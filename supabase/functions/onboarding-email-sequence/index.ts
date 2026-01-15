import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";
import {
  generateBrandedEmail,
  generateInfoBox,
} from "../_shared/email-template.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Internal/cron-only function - minimal CORS for service calls
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://taxkora.lovable.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Onboarding tips configuration
const ONBOARDING_TIPS = [
  {
    type: "tip_1",
    dayOffset: 2, // Send on day 2
    subject: "💡 Tip 1: Track Your Income Sources",
    content: {
      title: "Start by adding your income sources",
      tip: "The first step to accurate tax computation is tracking all your income. Whether it's salary, freelance work, or business revenue, TaxKora helps you categorize and monitor everything.",
      action: "Add Your Income",
      actionUrl: "/dashboard/income",
      benefit: "Users who track income regularly save an average of 15% more on taxes through proper deduction matching.",
    },
  },
  {
    type: "tip_2",
    dayOffset: 4, // Send on day 4
    subject: "📊 Tip 2: Don't Miss Deductible Expenses",
    content: {
      title: "Capture every deductible expense",
      tip: "Many Nigerians miss legitimate tax deductions simply because they don't track expenses. From office supplies to professional development, every naira counts!",
      action: "Log Expenses",
      actionUrl: "/dashboard/expenses",
      benefit: "The average TaxKora user discovers ₦50,000+ in missed deductions in their first month.",
    },
  },
  {
    type: "tip_3",
    dayOffset: 7, // Send on day 7
    subject: "🎯 Tip 3: Review Your Tax Projection",
    content: {
      title: "Check your real-time tax projection",
      tip: "Now that you've added some data, visit your dashboard to see your projected tax liability. This helps you plan ahead and avoid surprises during tax season.",
      action: "View Tax Projection",
      actionUrl: "/dashboard/tax",
      benefit: "Proactive tax planning can reduce your effective tax rate by understanding brackets and timing income strategically.",
    },
  },
];

interface TrialUser {
  user_id: string;
  email: string;
  full_name: string | null;
  trial_start_date: string;
  plan: string;
}

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

    console.log("Starting onboarding email sequence check...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all active trial subscriptions that started within the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: trialSubscriptions, error: subError } = await supabase
      .from("subscriptions")
      .select("user_id, plan, start_date")
      .eq("status", "active")
      .eq("payment_reference", "TRIAL")
      .gte("start_date", sevenDaysAgo.toISOString().split("T")[0]);

    if (subError) {
      console.error("Error fetching trial subscriptions:", subError);
      throw subError;
    }

    console.log(`Found ${trialSubscriptions?.length || 0} active trial users`);

    if (!trialSubscriptions || trialSubscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No trial users to process", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get user profiles for email addresses
    const userIds = trialSubscriptions.map((s) => s.user_id);
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, email, full_name")
      .in("user_id", userIds);

    if (profileError) {
      console.error("Error fetching profiles:", profileError);
      throw profileError;
    }

    // Get already sent onboarding emails
    const { data: sentEmails, error: sentError } = await supabase
      .from("onboarding_emails")
      .select("user_id, email_type")
      .in("user_id", userIds);

    if (sentError) {
      console.error("Error fetching sent emails:", sentError);
      throw sentError;
    }

    const sentEmailsMap = new Map<string, Set<string>>();
    sentEmails?.forEach((email) => {
      if (!sentEmailsMap.has(email.user_id)) {
        sentEmailsMap.set(email.user_id, new Set());
      }
      sentEmailsMap.get(email.user_id)!.add(email.email_type);
    });

    let emailsSent = 0;
    const today = new Date();

    for (const subscription of trialSubscriptions) {
      const profile = profiles?.find((p) => p.user_id === subscription.user_id);
      if (!profile?.email) {
        console.log(`No email found for user ${subscription.user_id}, skipping`);
        continue;
      }

      const trialStartDate = new Date(subscription.start_date);
      const daysSinceStart = Math.floor(
        (today.getTime() - trialStartDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      console.log(
        `User ${subscription.user_id}: ${daysSinceStart} days since trial start`
      );

      const userSentEmails = sentEmailsMap.get(subscription.user_id) || new Set();

      for (const tip of ONBOARDING_TIPS) {
        // Check if this tip should be sent today and hasn't been sent yet
        if (daysSinceStart >= tip.dayOffset && !userSentEmails.has(tip.type)) {
          const userName = profile.full_name || profile.email.split("@")[0];
          const tipNumber = parseInt(tip.type.split("_")[1]);

          console.log(`Sending ${tip.type} to ${profile.email}`);

          const emailContent = `
            <h3 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #0D9488;">
              ${tip.content.title}
            </h3>

            <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">
              ${tip.content.tip}
            </p>

            ${generateInfoBox(
              `<strong>💰 Did you know?</strong> ${tip.content.benefit}`,
              "success"
            )}

            <p style="margin-top: 24px; font-size: 14px; color: #64748b;">
              This is tip ${tipNumber} of 3 in your onboarding series. More helpful tips coming soon!
            </p>
          `;

          const emailHtml = generateBrandedEmail({
            preheader: tip.content.title,
            title: `Onboarding Tip #${tipNumber}`,
            subtitle: "Getting Started with TaxKora",
            recipientName: userName,
            content: emailContent,
            ctaText: tip.content.action,
            ctaUrl: `https://taxkora.lovable.app${tip.content.actionUrl}`,
            footerNote: "Questions? Reply to this email - we're here to help!",
          });

          try {
            const emailResponse = await resend.emails.send({
              from: "TaxKora <onboarding@resend.dev>",
              to: [profile.email],
              subject: tip.subject,
              html: emailHtml,
            });

            console.log(`Email sent successfully:`, emailResponse);

            // Record that this email was sent
            const { error: insertError } = await supabase
              .from("onboarding_emails")
              .insert({
                user_id: subscription.user_id,
                email_type: tip.type,
              });

            if (insertError) {
              console.error(`Error recording sent email:`, insertError);
            } else {
              emailsSent++;
            }
          } catch (emailError) {
            console.error(`Error sending email to ${profile.email}:`, emailError);
          }
        }
      }
    }

    console.log(`Onboarding sequence complete. Sent ${emailsSent} emails.`);

    return new Response(
      JSON.stringify({ 
        message: "Onboarding email sequence processed", 
        sent: emailsSent,
        processedUsers: trialSubscriptions.length 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in onboarding email sequence:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
