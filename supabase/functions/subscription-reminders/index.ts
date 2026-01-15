import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  generateBrandedEmail,
  generateDetailsTable,
  generateInfoBox,
  generateFeatureList,
  BRAND_COLORS,
} from "../_shared/email-template.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

// Internal/cron-only function - minimal CORS for service calls
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://taxkora.lovable.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscriptionReminder {
  email: string;
  fullName: string;
  planName: string;
  expiryDate: string;
  daysRemaining: number;
  isTrial: boolean;
}

const PLAN_NAMES: Record<string, string> = {
  pit_individual: "Individual PIT",
  pit_business: "Business PIT",
  cit: "Companies Income Tax",
};

// Verify this is a cron/service call (from pg_cron with service role key only)
const verifyServiceCall = (req: Request): boolean => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return false;
  }
  
  const token = authHeader.replace("Bearer ", "");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  // Only accept service role key - reject anonymous/public keys
  return token === serviceRoleKey;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify this is a cron/service call
    if (!verifyServiceCall(req)) {
      console.error("Unauthorized: This function is for scheduled execution only");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Starting subscription reminder check...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate reminder dates (30, 7, and 1 day before expiry)
    const reminderDays = [30, 7, 1];
    const reminders: SubscriptionReminder[] = [];

    for (const days of reminderDays) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + days);
      const targetDateStr = targetDate.toISOString().split("T")[0];

      console.log(`Checking for subscriptions expiring on ${targetDateStr} (${days} days from now)`);

      // Fetch active subscriptions expiring on the target date
      const { data: subscriptions, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("status", "active")
        .eq("end_date", targetDateStr);

      if (subError) {
        console.error("Error fetching subscriptions:", subError);
        continue;
      }

      console.log(`Found ${subscriptions?.length || 0} subscriptions expiring in ${days} days`);

      if (!subscriptions || subscriptions.length === 0) continue;

      // Get user profiles for these subscriptions
      for (const subscription of subscriptions) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("user_id", subscription.user_id)
          .single();

        if (profileError || !profile?.email) {
          console.log(`No profile/email found for user ${subscription.user_id}`);
          continue;
        }

        const isTrial = subscription.amount === 0;

        reminders.push({
          email: profile.email,
          fullName: profile.full_name || "Valued Customer",
          planName: PLAN_NAMES[subscription.plan] || subscription.plan,
          expiryDate: subscription.end_date,
          daysRemaining: days,
          isTrial,
        });
      }
    }

    console.log(`Total reminders to send: ${reminders.length}`);

    // Send reminder emails
    let successCount = 0;
    let failCount = 0;

    for (const reminder of reminders) {
      const subject = reminder.isTrial
        ? `Your TaxKora Trial Expires in ${reminder.daysRemaining} Day${reminder.daysRemaining > 1 ? "s" : ""}`
        : `Your TaxKora Subscription Expires in ${reminder.daysRemaining} Day${reminder.daysRemaining > 1 ? "s" : ""}`;

      const urgencyType = reminder.daysRemaining === 1
        ? "danger"
        : reminder.daysRemaining === 7
          ? "warning"
          : "info";

      const urgencyText = reminder.daysRemaining === 1
        ? "⚠️ This is your final reminder!"
        : reminder.daysRemaining === 7
          ? "🔔 One week left!"
          : "📅 30 days remaining";

      const actionText = reminder.isTrial
        ? "Subscribe now to continue enjoying all premium features and keep your tax data safe."
        : "Renew now to maintain uninterrupted access to all your tax records and features.";

      const formattedDate = new Date(reminder.expiryDate).toLocaleDateString('en-NG', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      const features = [
        "Tax computation and filing tools",
        "Income and expense tracking",
        "Invoice management",
        "VAT and WHT calculations",
        "Tax payment tracking",
      ];

      const emailContent = `
        ${generateInfoBox(
          `<strong>${urgencyText}</strong><br>
          Your ${reminder.isTrial ? 'free trial' : 'subscription'} for <strong>${reminder.planName}</strong> will expire on 
          <strong>${formattedDate}</strong>.`,
          urgencyType as "info" | "warning" | "danger"
        )}

        <p style="margin: 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">
          ${actionText}
        </p>

        ${generateDetailsTable([
          { label: "Plan", value: reminder.planName },
          { label: "Expires", value: new Date(reminder.expiryDate).toLocaleDateString('en-NG') },
          { label: "Days Remaining", value: String(reminder.daysRemaining) },
        ])}

        <h3 style="margin: 24px 0 16px 0; font-size: 16px; font-weight: 600; color: #18181b;">
          What you'll lose access to:
        </h3>

        ${generateFeatureList(features)}
      `;

      const emailHtml = generateBrandedEmail({
        preheader: `${urgencyText} - ${reminder.planName} expires soon`,
        title: reminder.isTrial ? "Trial Expiring Soon" : "Subscription Expiring Soon",
        subtitle: "Subscription Reminder",
        recipientName: reminder.fullName,
        content: emailContent,
        ctaText: reminder.isTrial ? "Subscribe Now" : "Renew Now",
        ctaUrl: "https://taxkora.lovable.app/dashboard/subscription",
        footerNote: "If you have any questions about your subscription, please don't hesitate to reach out to our support team.",
      });

      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "TaxKora <notifications@resend.dev>",
            to: [reminder.email],
            subject: subject,
            html: emailHtml,
          }),
        });

        if (!emailResponse.ok) {
          throw new Error(`Resend API error: ${emailResponse.statusText}`);
        }

        const result = await emailResponse.json();
        console.log(`Email sent successfully to ${reminder.email}:`, result);
        successCount++;
      } catch (emailError) {
        console.error(`Failed to send email to ${reminder.email}:`, emailError);
        failCount++;
      }
    }

    const result = {
      success: true,
      message: `Subscription reminder check completed`,
      stats: {
        totalReminders: reminders.length,
        emailsSent: successCount,
        emailsFailed: failCount,
      },
    };

    console.log("Reminder check result:", result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in subscription-reminders function:", error);
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
