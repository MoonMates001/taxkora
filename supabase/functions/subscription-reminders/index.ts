import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

      const urgencyText = reminder.daysRemaining === 1
        ? "⚠️ This is your final reminder!"
        : reminder.daysRemaining === 7
        ? "🔔 One week left!"
        : "📅 30 days remaining";

      const actionText = reminder.isTrial
        ? "Subscribe now to continue enjoying all premium features and keep your tax data safe."
        : "Renew now to maintain uninterrupted access to all your tax records and features.";

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .urgency { background: ${reminder.daysRemaining === 1 ? '#fef2f2' : reminder.daysRemaining === 7 ? '#fffbeb' : '#f0fdf4'}; 
                       border-left: 4px solid ${reminder.daysRemaining === 1 ? '#ef4444' : reminder.daysRemaining === 7 ? '#f59e0b' : '#22c55e'}; 
                       padding: 15px; margin: 20px 0; border-radius: 4px; }
            .cta { text-align: center; margin: 30px 0; }
            .cta a { background: #0d9488; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            .details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">TaxKora</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Nigerian Tax Companion</p>
            </div>
            <div class="content">
              <h2>Hello ${reminder.fullName},</h2>
              
              <div class="urgency">
                <strong>${urgencyText}</strong><br>
                Your ${reminder.isTrial ? 'free trial' : 'subscription'} for <strong>${reminder.planName}</strong> will expire on 
                <strong>${new Date(reminder.expiryDate).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>.
              </div>
              
              <p>${actionText}</p>
              
              <div class="details">
                <p style="margin: 0;"><strong>Plan:</strong> ${reminder.planName}</p>
                <p style="margin: 5px 0 0 0;"><strong>Expires:</strong> ${new Date(reminder.expiryDate).toLocaleDateString('en-NG')}</p>
                <p style="margin: 5px 0 0 0;"><strong>Days Remaining:</strong> ${reminder.daysRemaining}</p>
              </div>
              
              <p><strong>What you'll lose access to:</strong></p>
              <ul>
                <li>Tax computation and filing tools</li>
                <li>Income and expense tracking</li>
                <li>Invoice management</li>
                <li>VAT and WHT calculations</li>
                <li>Tax payment tracking</li>
              </ul>
              
              <div class="cta">
                <a href="https://taxkora.lovable.app/dashboard/subscription">${reminder.isTrial ? 'Subscribe Now' : 'Renew Now'}</a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px;">
                If you have any questions about your subscription, please don't hesitate to reach out to our support team.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} TaxKora. All rights reserved.</p>
              <p>This is an automated reminder from TaxKora.</p>
            </div>
          </div>
        </body>
        </html>
      `;

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
