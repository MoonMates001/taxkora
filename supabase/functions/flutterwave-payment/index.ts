import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers - allow all origins for flexibility
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  amount: number;
  email: string;
  name: string;
  phone?: string;
  payment_type: "invoice" | "subscription";
  reference_id?: string;
  description?: string;
  redirect_url?: string;
  plan?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Sanitize the key to prevent common misconfigurations like leading/trailing spaces,
    // users pasting "Bearer <key>", quotes, or the whole env line.
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
        JSON.stringify({
          error:
            "Payment gateway not configured (invalid Flutterwave secret key). Please update your FLUTTERWAVE_SECRET_KEY.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: PaymentRequest = await req.json();
    const { amount, email, name, phone, payment_type, reference_id, description, redirect_url } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: "Invalid payment amount" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!email || !name) {
      return new Response(JSON.stringify({ error: "Email and name are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const origin = req.headers.get("origin");

    // Generate unique transaction reference
    const tx_ref = `TXK-${payment_type.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    console.log("Initiating payment:", { tx_ref, amount, email, payment_type, plan: body.plan });

    // Prepare Flutterwave payment payload
    const paymentPayload = {
      tx_ref,
      amount,
      currency: "NGN",
      redirect_url: redirect_url || `${origin || "https://taxkora.lovable.app"}/dashboard/payment-callback`,
      customer: {
        email,
        phonenumber: phone || "",
        name,
      },
      customizations: {
        title: "TaxKora Payment",
        description: description || `Payment for ${payment_type.replace("_", " ")}`,
        logo: "https://taxkora.lovable.app/favicon.ico",
      },
      meta: {
        user_id: user.id,
        payment_type,
        reference_id: reference_id || null,
        plan: body.plan || null,
      },
    };

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

    console.log("Flutterwave response:", flutterwaveData);

    if (flutterwaveData.status !== "success") {
      console.error("Flutterwave error:", flutterwaveData);
      // Return generic error message - don't expose gateway internals
      return new Response(
        JSON.stringify({ error: "Payment initialization failed. Please try again or contact support." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        status: "success",
        payment_link: flutterwaveData.data.link,
        tx_ref,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Payment error:", error);
    // Return generic error - don't expose internal details
    return new Response(
      JSON.stringify({ error: "Payment processing failed. Please try again or contact support." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
