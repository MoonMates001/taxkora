import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://taxkora.lovable.app",
  "https://id-preview--7fc45929-e18d-42b8-a8c0-b8aac5338982.lovable.app",
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(o => origin.startsWith(o.replace('https://', 'https://'))) 
    ? origin 
    : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
};

interface TokenizeRequest {
  plan: "pit_individual" | "pit_business" | "cit";
  email: string;
  name: string;
  phone?: string;
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawFlutterwaveKey = Deno.env.get("FLUTTERWAVE_SECRET_KEY");

    let FLUTTERWAVE_SECRET_KEY = rawFlutterwaveKey
      ?.trim()
      .replace(/^Bearer\s+/i, "")
      .replace(/^FLUTTERWAVE_SECRET_KEY\s*=\s*/i, "")
      .trim()
      .replace(/^["'`]/, "")
      .replace(/["'`]$/, "")
      .trim();

    const extracted = FLUTTERWAVE_SECRET_KEY?.match(/FLWSECK(?:_TEST)?-[A-Za-z0-9_-]+/);
    if (extracted?.[0]) FLUTTERWAVE_SECRET_KEY = extracted[0];

    const keyLooksLikeSecret =
      (FLUTTERWAVE_SECRET_KEY?.startsWith("FLWSECK-") ?? false) ||
      (FLUTTERWAVE_SECRET_KEY?.startsWith("FLWSECK_TEST-") ?? false);

    const keyLooksLikePublic = FLUTTERWAVE_SECRET_KEY?.startsWith("FLWPUBK-") ?? false;

    if (!FLUTTERWAVE_SECRET_KEY || !keyLooksLikeSecret || keyLooksLikePublic) {
      console.error("FLUTTERWAVE_SECRET_KEY invalid or misconfigured", {
        present: !!rawFlutterwaveKey,
        looksLikeSecret: keyLooksLikeSecret,
        looksLikePublic: keyLooksLikePublic,
      });
      return new Response(
        JSON.stringify({ error: "Payment gateway not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: TokenizeRequest = await req.json();
    const { plan, email, name, phone } = body;

    // Validate required fields
    if (!plan || !email || !name) {
      return new Response(
        JSON.stringify({ error: "Plan, email, and name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate plan
    const validPlans = ["pit_individual", "pit_business", "cit"];
    if (!validPlans.includes(plan)) {
      return new Response(
        JSON.stringify({ error: "Invalid subscription plan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate unique transaction reference for tokenization
    const tx_ref = `TXK-TRIAL-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Use Flutterwave's payment link with tokenization enabled
    // We charge a minimal amount (₦50) that will be refunded, just to tokenize the card
    const paymentPayload = {
      tx_ref,
      amount: 50, // Minimal charge for card verification (will be explained to user)
      currency: "NGN",
      redirect_url: `${origin || "https://taxkora.lovable.app"}/dashboard/trial-callback`,
      customer: {
        email,
        phonenumber: phone || "",
        name,
      },
      customizations: {
        title: "TaxKora - Verify Card for Trial",
        description: "A ₦50 verification charge will be made and refunded immediately. Your card will be saved for automatic billing when your trial ends.",
        logo: "https://taxkora.lovable.app/favicon.ico",
      },
      meta: {
        user_id: user.id,
        payment_type: "trial_tokenization",
        plan,
      },
      // Enable tokenization
      payment_options: "card",
    };

    console.log("Initiating card tokenization for trial:", { user_id: user.id, plan, tx_ref });

    // Initialize payment with Flutterwave
    const flutterwaveResponse = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentPayload),
    });

    const flutterwaveData = await flutterwaveResponse.json();

    if (flutterwaveData.status !== "success") {
      console.error("Flutterwave tokenization error:", flutterwaveData);
      return new Response(
        JSON.stringify({ error: flutterwaveData.message || "Card verification initialization failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Card verification payment link generated:", { tx_ref });

    return new Response(
      JSON.stringify({
        status: "success",
        payment_link: flutterwaveData.data.link,
        tx_ref,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Tokenization error:", error);
    const corsHeaders = getCorsHeaders(req.headers.get("origin"));
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Card verification failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
