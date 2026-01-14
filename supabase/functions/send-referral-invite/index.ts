import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

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

// HTML escape to prevent XSS in emails
const escapeHtml = (text: string): string => {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
};

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

    console.log(`Sending referral invite to ${email} from ${safeReferrerName}`);

    const signupUrl = `${origin || "https://taxkora.lovable.app"}/auth?ref=${referralCode}`;

    const emailResponse = await resend.emails.send({
      from: "TAXKORA <onboarding@resend.dev>",
      to: [email],
      subject: `${safeReferrerName} invited you to try TAXKORA!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Logo -->
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; background-color: #0D9488; padding: 12px 16px; border-radius: 12px;">
                  <span style="color: white; font-weight: bold; font-size: 24px;">TAXKORA</span>
                </div>
              </div>

              <!-- Header -->
              <h1 style="font-size: 28px; font-weight: bold; color: #18181b; text-align: center; margin: 0 0 16px;">
                You've Been Invited! 🎉
              </h1>

              <p style="font-size: 16px; color: #52525b; text-align: center; margin: 0 0 32px;">
                <strong>${safeReferrerName}</strong> thinks you'd love TAXKORA - the simple way to manage your taxes in Nigeria.
              </p>

              <!-- Benefits -->
              <div style="background-color: #f0fdfa; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                <h2 style="font-size: 18px; font-weight: 600; color: #0d9488; margin: 0 0 16px;">
                  Why TAXKORA?
                </h2>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #374151;">
                  <li style="margin-bottom: 8px;">Automated tax calculations for PIT, CIT, VAT & WHT</li>
                  <li style="margin-bottom: 8px;">Easy income & expense tracking</li>
                  <li style="margin-bottom: 8px;">Professional invoice generation</li>
                  <li style="margin-bottom: 8px;">Tax deadline reminders</li>
                  <li>3-month free trial to get started!</li>
                </ul>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${signupUrl}" 
                   style="display: inline-block; background-color: #0D9488; color: white; font-weight: 600; font-size: 16px; padding: 16px 48px; border-radius: 12px; text-decoration: none;">
                  Accept Invitation & Sign Up
                </a>
              </div>

              <!-- Referral Code -->
              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
                <p style="font-size: 14px; color: #71717a; margin: 0 0 8px;">
                  Or use this referral code at signup:
                </p>
                <p style="font-size: 24px; font-weight: bold; color: #0D9488; letter-spacing: 4px; margin: 0;">
                  ${referralCode}
                </p>
              </div>

              <p style="font-size: 14px; color: #71717a; text-align: center; margin: 0;">
                When you sign up and subscribe, ${safeReferrerName} gets credit toward a free year subscription!
              </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 32px;">
              <p style="font-size: 12px; color: #a1a1aa; margin: 0;">
                © ${new Date().getFullYear()} TAXKORA. Making tax compliance simple for Nigerian businesses.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
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
