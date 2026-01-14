import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeadlineReminder {
  userId: string;
  email: string;
  fullName: string;
  deadlineType: "vat" | "wht";
  month: number;
  year: number;
  dueDate: string;
  daysUntilDue: number;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Verify this is a cron/service call (from pg_cron or service role)
const verifyServiceCall = (req: Request): boolean => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return false;
  }
  
  const token = authHeader.replace("Bearer ", "");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  
  // Allow calls with either service role key or anon key (for cron jobs)
  return token === serviceRoleKey || token === anonKey;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Tax deadline reminder function called");

  // Handle CORS preflight requests
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Calculate VAT deadline (21st of next month)
    const vatMonth = currentMonth;
    const vatYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    const vatDueDate = new Date(currentMonth === 12 ? currentYear + 1 : currentYear, currentMonth, 21);
    const vatDaysUntilDue = Math.ceil((vatDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate WHT deadline (21st of current month for previous month's deductions)
    const whtDueDate = new Date(currentYear, currentMonth - 1, 21);
    const whtDaysUntilDue = Math.ceil((whtDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    console.log(`VAT deadline: ${vatDueDate.toISOString()}, days until due: ${vatDaysUntilDue}`);
    console.log(`WHT deadline: ${whtDueDate.toISOString()}, days until due: ${whtDaysUntilDue}`);

    // Fetch all users with profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, email, full_name, account_type")
      .not("email", "is", null);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    console.log(`Found ${profiles?.length || 0} profiles with email addresses`);

    const reminders: DeadlineReminder[] = [];
    const emailsSent: string[] = [];

    for (const profile of profiles || []) {
      // Only send reminders for business accounts or if they have VAT/WHT transactions
      if (profile.account_type === "business") {
        // Check VAT filing status - only send if not already filed
        if (vatDaysUntilDue <= 7 && vatDaysUntilDue > 0) {
          const { data: vatStatus } = await supabase
            .from("vat_filing_status")
            .select("status")
            .eq("user_id", profile.user_id)
            .eq("year", vatYear)
            .eq("month", vatMonth)
            .single();

          if (!vatStatus || vatStatus.status === "pending") {
            reminders.push({
              userId: profile.user_id,
              email: profile.email,
              fullName: profile.full_name || "User",
              deadlineType: "vat",
              month: vatMonth,
              year: vatYear,
              dueDate: vatDueDate.toISOString().split("T")[0],
              daysUntilDue: vatDaysUntilDue,
            });
          }
        }

        // Check WHT - only send if there are pending transactions
        if (whtDaysUntilDue <= 7 && whtDaysUntilDue > 0) {
          const { data: whtTransactions } = await supabase
            .from("wht_transactions")
            .select("id")
            .eq("user_id", profile.user_id)
            .gte("payment_date", new Date(currentYear, currentMonth - 2, 1).toISOString())
            .lt("payment_date", new Date(currentYear, currentMonth - 1, 1).toISOString())
            .limit(1);

          if (whtTransactions && whtTransactions.length > 0) {
            reminders.push({
              userId: profile.user_id,
              email: profile.email,
              fullName: profile.full_name || "User",
              deadlineType: "wht",
              month: currentMonth - 1 || 12,
              year: currentMonth === 1 ? currentYear - 1 : currentYear,
              dueDate: whtDueDate.toISOString().split("T")[0],
              daysUntilDue: whtDaysUntilDue,
            });
          }
        }
      }
    }

    console.log(`Generated ${reminders.length} reminders to send`);

    // Send emails
    for (const reminder of reminders) {
      const monthName = MONTHS[reminder.month - 1];
      const deadlineTypeLabel = reminder.deadlineType === "vat" ? "VAT Return" : "WHT Remittance";
      const urgencyText = reminder.daysUntilDue <= 3 ? "⚠️ URGENT: " : "";

      try {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 30px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">TaxKora</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Tax Deadline Reminder</p>
            </div>
            
            <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="font-size: 16px;">Dear ${reminder.fullName},</p>
              
              <div style="background: ${reminder.daysUntilDue <= 3 ? '#fef2f2' : '#fffbeb'}; border-left: 4px solid ${reminder.daysUntilDue <= 3 ? '#ef4444' : '#f59e0b'}; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; font-weight: 600; color: ${reminder.daysUntilDue <= 3 ? '#991b1b' : '#92400e'};">
                  ${urgencyText}${deadlineTypeLabel} deadline is approaching!
                </p>
                <p style="margin: 10px 0 0 0; color: ${reminder.daysUntilDue <= 3 ? '#991b1b' : '#92400e'};">
                  <strong>${reminder.daysUntilDue} day${reminder.daysUntilDue > 1 ? 's' : ''}</strong> remaining until the deadline.
                </p>
              </div>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Deadline Type:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${deadlineTypeLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Period:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${monthName} ${reminder.year}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Due Date:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${new Date(reminder.dueDate).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                </tr>
              </table>
              
              <p style="margin: 20px 0;">
                Please log in to TaxKora to review your ${reminder.deadlineType === 'vat' ? 'VAT transactions and file your return' : 'WHT deductions and complete the remittance'} before the deadline.
              </p>
              
              <a href="https://taxkora.lovable.app/dashboard/${reminder.deadlineType}" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 0;">
                Go to ${deadlineTypeLabel}
              </a>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                This is an automated reminder from TaxKora. Please do not reply to this email.
              </p>
            </div>
          </body>
          </html>
        `;

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "TaxKora <onboarding@resend.dev>",
            to: [reminder.email],
            subject: `${urgencyText}${deadlineTypeLabel} Deadline Reminder - ${monthName} ${reminder.year}`,
            html: emailHtml,
          }),
        });

        const emailData = await emailResponse.json();
        console.log(`Email sent to ${reminder.email}:`, emailData);
        emailsSent.push(reminder.email);
      } catch (emailError: any) {
        console.error(`Failed to send email to ${reminder.email}:`, emailError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        remindersGenerated: reminders.length,
        emailsSent: emailsSent.length,
        details: emailsSent,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in tax-deadline-reminders function:", error);
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
