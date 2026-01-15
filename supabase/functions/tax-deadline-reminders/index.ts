import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  generateBrandedEmail,
  generateDetailsTable,
  generateInfoBox,
  BRAND_COLORS,
} from "../_shared/email-template.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

// Internal/cron-only function - minimal CORS for service calls
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://taxkora.lovable.app",
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
      const urgencyType = reminder.daysUntilDue <= 3 ? "danger" : "warning";

      const formattedDate = new Date(reminder.dueDate).toLocaleDateString('en-NG', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      const emailContent = `
        ${generateInfoBox(
          `<strong>${urgencyText}${deadlineTypeLabel} deadline is approaching!</strong><br>
          <strong>${reminder.daysUntilDue} day${reminder.daysUntilDue > 1 ? 's' : ''}</strong> remaining until the deadline.`,
          urgencyType as "warning" | "danger"
        )}

        ${generateDetailsTable([
          { label: "Deadline Type", value: deadlineTypeLabel },
          { label: "Period", value: `${monthName} ${reminder.year}` },
          { label: "Due Date", value: formattedDate },
        ])}

        <p style="margin: 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">
          Please log in to TaxKora to review your ${reminder.deadlineType === 'vat' ? 'VAT transactions and file your return' : 'WHT deductions and complete the remittance'} before the deadline.
        </p>
      `;

      const emailHtml = generateBrandedEmail({
        preheader: `${urgencyText}${deadlineTypeLabel} deadline: ${reminder.daysUntilDue} days remaining`,
        title: "Tax Deadline Reminder",
        subtitle: `${deadlineTypeLabel} - ${monthName} ${reminder.year}`,
        recipientName: reminder.fullName,
        content: emailContent,
        ctaText: `Go to ${deadlineTypeLabel}`,
        ctaUrl: `https://taxkora.lovable.app/dashboard/${reminder.deadlineType}`,
        footerNote: "This is an automated reminder from TaxKora. Please do not reply to this email.",
      });

      try {
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
