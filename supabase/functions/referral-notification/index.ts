import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";
import {
  generateBrandedEmail,
  generateHighlightBox,
  generateInfoBox,
  escapeHtml,
  BRAND_COLORS,
} from "../_shared/email-template.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Internal-only function - minimal CORS for service calls
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://taxkora.lovable.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  referrerId: string;
  referredEmail: string;
  eventType: "signed_up" | "subscribed";
}

// Verify this is an internal service call (from other edge functions or cron)
const verifyServiceCall = (req: Request): boolean => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return false;
  }
  
  const token = authHeader.replace("Bearer ", "");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  // Only allow calls with the service role key (internal calls)
  return token === serviceRoleKey;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify this is an internal service call
    if (!verifyServiceCall(req)) {
      console.error("Unauthorized: This function is internal-only");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { referrerId, referredEmail, eventType }: NotificationRequest = body;

    // Validate required fields
    if (!referrerId || !referredEmail || !eventType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate eventType
    if (!["signed_up", "subscribed"].includes(eventType)) {
      return new Response(
        JSON.stringify({ error: "Invalid event type" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Processing referral notification: ${eventType} for referrer ${referrerId}`);

    // Get referrer's profile to send them notification
    const { data: referrerProfile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("user_id", referrerId)
      .single();

    if (profileError || !referrerProfile?.email) {
      console.error("Failed to get referrer profile:", profileError);
      throw new Error("Referrer profile not found");
    }

    // Get completed referral count for the referrer
    const { data: referrals, error: referralsError } = await supabase
      .from("referrals")
      .select("id, status")
      .eq("referrer_id", referrerId)
      .eq("status", "subscribed");

    if (referralsError) {
      console.error("Failed to get referrals:", referralsError);
    }

    const completedCount = referrals?.length || 0;
    const pitReward = completedCount >= 10;
    const citReward = completedCount >= 20;

    // Escape user-provided content
    const safeName = escapeHtml(referrerProfile.full_name || "there");
    const safeEmail = escapeHtml(referredEmail);

    let subject = "";
    let title = "";
    let emailContent = "";

    if (eventType === "signed_up") {
      subject = "🎉 Your referral just signed up!";
      title = "Great News! 🎉";
      
      emailContent = `
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">
          Exciting news! <strong>${safeEmail}</strong> just signed up using your referral link!
        </p>

        ${generateHighlightBox(
          "Almost There!",
          "Your friend is one step away from completing the referral. Once they subscribe, you'll get credit toward your free year!",
          "teal"
        )}

        <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: ${BRAND_COLORS.muted};">
            <strong>Current Progress:</strong>
          </p>
          <p style="margin: 0; font-size: 24px; font-weight: 700; color: ${BRAND_COLORS.primary};">
            ${completedCount}/10 completed referrals
          </p>
          ${pitReward ? `<p style="margin: 8px 0 0 0; color: #22c55e;">✅ You've earned your PIT reward!</p>` : ""}
          ${citReward ? `<p style="margin: 8px 0 0 0; color: #8b5cf6;">✅ You've earned your CIT reward!</p>` : ""}
        </div>

        <p style="margin: 0; font-size: 16px; color: #374151;">
          Keep sharing your referral link to reach your goal!
        </p>
      `;
    } else if (eventType === "subscribed") {
      const justEarnedPit = completedCount === 10;
      const justEarnedCit = completedCount === 20;

      subject = justEarnedPit 
        ? "🏆 Congratulations! You've earned 1 year FREE (PIT)!" 
        : justEarnedCit
          ? "🏆 Amazing! You've unlocked the CIT reward!"
          : "✅ Referral completed!";

      title = justEarnedPit || justEarnedCit ? "🏆 Reward Unlocked!" : "Referral Completed! 🎉";

      emailContent = `
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">
          <strong>${safeEmail}</strong> just subscribed to TAXKORA!
        </p>

        ${justEarnedPit ? generateHighlightBox(
          "🎉 You Did It!",
          `You've completed 10 referrals and earned <strong>1 YEAR FREE SUBSCRIPTION!</strong><br><small>Choose Individual PIT or Business PIT plan</small>`,
          "gold"
        ) : justEarnedCit ? generateHighlightBox(
          "🌟 Ultimate Achievement!",
          `You've completed 20 referrals and unlocked the <strong>CIT PLAN REWARD!</strong><br><small>₦25,000 value - 1 Year Free!</small>`,
          "purple"
        ) : `
          <div style="background: #f0fdf4; border: 2px solid ${BRAND_COLORS.success}; padding: 24px; border-radius: 12px; margin: 24px 0; text-align: center;">
            <p style="margin: 0; font-size: 18px; color: ${BRAND_COLORS.success}; font-weight: 600;">+1 Referral Completed!</p>
            <p style="margin: 12px 0 0 0; font-size: 28px; font-weight: bold; color: #18181b;">
              ${completedCount}/10 toward PIT reward
            </p>
            ${completedCount >= 10 ? `<p style="margin: 8px 0 0 0; font-size: 16px; color: #18181b;">${completedCount}/20 toward CIT reward</p>` : ""}
          </div>
        `}

        ${justEarnedPit || justEarnedCit ? `
          ${generateInfoBox("<strong>Log in to your dashboard to claim your reward!</strong>", "success")}
        ` : `
          <p style="margin: 0; font-size: 16px; color: #374151; text-align: center;">
            ${10 - completedCount > 0 
              ? `Only <strong>${10 - completedCount}</strong> more referral(s) to earn your free year!` 
              : `${20 - completedCount} more to unlock CIT reward!`
            }
          </p>
        `}
      `;
    }

    const emailHtml = generateBrandedEmail({
      preheader: subject,
      title: title,
      subtitle: "Referral Update",
      recipientName: safeName,
      content: emailContent,
      ctaText: "View Referral Dashboard",
      ctaUrl: "https://taxkora.lovable.app/dashboard/referrals",
    });

    const emailResponse = await resend.emails.send({
      from: "TAXKORA <onboarding@resend.dev>",
      to: [referrerProfile.email],
      subject: subject,
      html: emailHtml,
    });

    console.log("Notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in referral-notification function:", error);
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
