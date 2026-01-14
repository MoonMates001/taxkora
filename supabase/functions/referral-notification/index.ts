import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  referrerId: string;
  referredEmail: string;
  eventType: "signed_up" | "subscribed";
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { referrerId, referredEmail, eventType }: NotificationRequest = await req.json();

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

    let subject = "";
    let htmlContent = "";

    if (eventType === "signed_up") {
      subject = "🎉 Your referral just signed up!";
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; margin: 0;">Great News! 🎉</h1>
          </div>
          
          <p>Hi ${referrerProfile.full_name || "there"},</p>
          
          <p>Exciting news! <strong>${referredEmail}</strong> just signed up using your referral link!</p>
          
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-size: 18px;">Your friend is one step away from completing the referral.</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Once they subscribe, you'll get credit toward your free year!</p>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            <strong>Current Progress:</strong> ${completedCount}/10 completed referrals
            ${pitReward ? "<br>✅ You've earned your PIT reward!" : ""}
            ${citReward ? "<br>✅ You've earned your CIT reward!" : ""}
          </p>
          
          <p>Keep sharing your referral link to reach your goal!</p>
          
          <p style="color: #666;">Best regards,<br><strong>The TAXKORA Team</strong></p>
        </body>
        </html>
      `;
    } else if (eventType === "subscribed") {
      const justEarnedPit = completedCount === 10;
      const justEarnedCit = completedCount === 20;

      subject = justEarnedPit 
        ? "🏆 Congratulations! You've earned 1 year FREE (PIT)!" 
        : justEarnedCit
          ? "🏆 Amazing! You've unlocked the CIT reward!"
          : "✅ Referral completed!";

      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; margin: 0;">${justEarnedPit || justEarnedCit ? "🏆 Reward Unlocked!" : "Referral Completed! 🎉"}</h1>
          </div>
          
          <p>Hi ${referrerProfile.full_name || "there"},</p>
          
          <p><strong>${referredEmail}</strong> just subscribed to TAXKORA!</p>
          
          ${justEarnedPit ? `
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 25px; border-radius: 12px; margin: 20px 0; text-align: center;">
            <h2 style="margin: 0 0 10px 0; font-size: 24px;">🎉 You Did It!</h2>
            <p style="margin: 0; font-size: 18px;">You've completed 10 referrals and earned</p>
            <p style="margin: 10px 0 0 0; font-size: 28px; font-weight: bold;">1 YEAR FREE SUBSCRIPTION!</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Choose Individual PIT or Business PIT plan</p>
          </div>
          <p><strong>Log in to your dashboard to claim your reward!</strong></p>
          ` : justEarnedCit ? `
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 25px; border-radius: 12px; margin: 20px 0; text-align: center;">
            <h2 style="margin: 0 0 10px 0; font-size: 24px;">🌟 Ultimate Achievement!</h2>
            <p style="margin: 0; font-size: 18px;">You've completed 20 referrals and unlocked</p>
            <p style="margin: 10px 0 0 0; font-size: 28px; font-weight: bold;">CIT PLAN REWARD!</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">₦25,000 value - 1 Year Free!</p>
          </div>
          <p><strong>Log in to your dashboard to claim your CIT reward!</strong></p>
          ` : `
          <div style="background: #f0fdf4; border: 2px solid #10b981; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-size: 18px; color: #10b981;">+1 Referral Completed!</p>
            <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold; color: #333;">${completedCount}/10 toward PIT reward</p>
            ${completedCount >= 10 ? `<p style="margin: 10px 0 0 0; font-size: 16px; color: #333;">${completedCount}/20 toward CIT reward</p>` : ""}
          </div>
          <p>${10 - completedCount > 0 ? `Only <strong>${10 - completedCount}</strong> more referral(s) to earn your free year!` : `${20 - completedCount} more to unlock CIT reward!`}</p>
          `}
          
          <p style="color: #666;">Best regards,<br><strong>The TAXKORA Team</strong></p>
        </body>
        </html>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "TAXKORA <onboarding@resend.dev>",
      to: [referrerProfile.email],
      subject: subject,
      html: htmlContent,
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
