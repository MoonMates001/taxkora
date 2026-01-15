import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import {
  generateBrandedEmail,
  generateInfoBox,
  generateFeatureList,
  generateDetailsTable,
  escapeHtml,
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

interface TrialWelcomeRequest {
  email: string;
  name: string;
  planName: string;
  trialEndDate: string;
  features: string[];
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

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
    const { email, name, planName, trialEndDate, features }: TrialWelcomeRequest = body;

    // Validate required fields
    if (!email || !name || !planName || !trialEndDate || !features) {
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

    // Validate features array
    if (!Array.isArray(features) || features.length === 0 || features.length > 20) {
      return new Response(
        JSON.stringify({ error: "Invalid features array" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Escape HTML in user-provided content
    const safeName = escapeHtml(name);
    const safePlanName = escapeHtml(planName);
    const safeTrialEndDate = escapeHtml(trialEndDate);

    const emailContent = `
      <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">
        Thank you for starting your <strong>3-month free trial</strong> of the <strong>${safePlanName}</strong> plan! 
        We're excited to help you simplify your tax management.
      </p>

      ${generateDetailsTable([
        { label: "Plan", value: safePlanName },
        { label: "Trial Ends", value: safeTrialEndDate },
        { label: "Cost", value: "Free for 3 months" },
      ])}

      <h3 style="margin: 24px 0 16px 0; font-size: 18px; font-weight: 600; color: #18181b;">
        What you can access:
      </h3>

      ${generateFeatureList(features)}

      ${generateInfoBox(
        `<strong>💡 Pro Tip:</strong> Start by adding your income sources and expenses to get accurate tax projections. The earlier you track, the more deductions you'll catch!`,
        "warning"
      )}
    `;

    const emailHtml = generateBrandedEmail({
      preheader: `Your ${safePlanName} trial has started!`,
      title: "Welcome to TAXKORA! 🎉",
      subtitle: "Your Free Trial Has Started",
      recipientName: safeName,
      content: emailContent,
      ctaText: "Go to Dashboard",
      ctaUrl: "https://taxkora.lovable.app/dashboard",
      footerNote: "Questions? Reply to this email - we're here to help!",
    });

    const emailResponse = await resend.emails.send({
      from: "TaxKora <onboarding@resend.dev>",
      to: [email],
      subject: `🎉 Welcome to TaxKora! Your ${safePlanName} Trial Has Started`,
      html: emailHtml,
    });

    console.log("Trial welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending trial welcome email:", error);
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
