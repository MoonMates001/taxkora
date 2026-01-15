import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import {
  generateBrandedEmail,
  generateInfoBox,
  generateFeatureList,
  escapeHtml,
  BRAND_COLORS,
} from "../_shared/email-template.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://taxkora.lovable.app",
  "https://wpczgwxsriezaubncuom.lovableproject.com",
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
};

interface ReferralInviteRequest {
  email: string;
  referralCode: string;
  referrerName: string;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Referral code validation (matches generate_referral_code format: TAX + 8 alphanumeric)
const REFERRAL_CODE_REGEX = /^TAX[A-Z0-9]{8}$/;

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Invalid token:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log("Authenticated user:", userId);

    const body = await req.json();
    const { email, referralCode, referrerName }: ReferralInviteRequest = body;

    // Validate required fields
    if (!email || !referralCode || !referrerName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate referral code format
    if (!REFERRAL_CODE_REGEX.test(referralCode)) {
      return new Response(
        JSON.stringify({ error: "Invalid referral code format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify the referral code exists and belongs to the authenticated user
    const supabaseService = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: referralData, error: referralError } = await supabaseService
      .from("referrals")
      .select("referrer_id, referral_code")
      .eq("referral_code", referralCode)
      .eq("referrer_id", userId)
      .maybeSingle();

    if (referralError || !referralData) {
      console.error("Invalid referral code or not owned by user:", referralError);
      return new Response(
        JSON.stringify({ error: "Invalid referral code" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate referrer name length
    if (referrerName.length > 100) {
      return new Response(
        JSON.stringify({ error: "Referrer name too long" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Escape user input for email
    const safeReferrerName = escapeHtml(referrerName);
    const signupUrl = `${origin || "https://taxkora.lovable.app"}/auth?ref=${referralCode}`;

    console.log(`Sending referral invite to ${email} from ${safeReferrerName}`);

    const features = [
      "Automated tax calculations for PIT, CIT, VAT & WHT",
      "Easy income & expense tracking",
      "Professional invoice generation",
      "Tax deadline reminders",
      "3-month free trial to get started!",
    ];

    const emailContent = `
      <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">
        <strong>${safeReferrerName}</strong> thinks you'd love TAXKORA - the simple way to manage your taxes in Nigeria.
      </p>

      ${generateInfoBox(`<strong>Why TAXKORA?</strong>`, "info")}

      ${generateFeatureList(features)}

      <!-- Referral Code -->
      <div style="background-color: #f4f4f5; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
        <p style="font-size: 14px; color: #71717a; margin: 0 0 8px;">
          Or use this referral code at signup:
        </p>
        <p style="font-size: 28px; font-weight: bold; color: ${BRAND_COLORS.primary}; letter-spacing: 4px; margin: 0; font-family: monospace;">
          ${referralCode}
        </p>
      </div>

      <p style="font-size: 14px; color: #71717a; text-align: center; margin: 0;">
        When you sign up and subscribe, ${safeReferrerName} gets credit toward a free year subscription!
      </p>
    `;

    const emailHtml = generateBrandedEmail({
      preheader: `${safeReferrerName} invited you to try TAXKORA!`,
      title: "You've Been Invited! 🎉",
      subtitle: "Referral Invitation",
      greeting: "Hello,",
      content: emailContent,
      ctaText: "Accept Invitation & Sign Up",
      ctaUrl: signupUrl,
    });

    const emailResponse = await resend.emails.send({
      from: "TAXKORA <onboarding@resend.dev>",
      to: [email],
      subject: `${safeReferrerName} invited you to try TAXKORA!`,
      html: emailHtml,
    });

    console.log("Referral invite email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending referral invite:", error);
    const corsHeaders = getCorsHeaders(req.headers.get("origin"));
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
