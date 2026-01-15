import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

// Internal/cron-only function - minimal CORS for service calls
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://taxkora.lovable.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLAN_AMOUNTS: Record<string, number> = {
  pit_individual: 2500,
  pit_business: 7500,
  cit: 25000,
};

const PLAN_NAMES: Record<string, string> = {
  pit_individual: "Individual PIT",
  pit_business: "Business PIT",
  cit: "Companies Income Tax",
};

// Verify this is a cron/service call (from pg_cron or service role)
const verifyServiceCall = (req: Request): boolean => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return false;
  }
  
  const token = authHeader.replace("Bearer ", "");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  
  return token === serviceRoleKey || token === anonKey;
};

interface ChargeResult {
  userId: string;
  subscriptionId: string;
  success: boolean;
  error?: string;
  transactionId?: string;
}

const sendRenewalEmail = async (
  email: string,
  fullName: string,
  planName: string,
  amount: number,
  success: boolean,
  errorMessage?: string
) => {
  const subject = success
    ? `Your TaxKora ${planName} Subscription Has Been Renewed`
    : `Action Required: TaxKora Subscription Renewal Failed`;

  const emailHtml = success
    ? `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .success { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">TaxKora</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Nigerian Tax Companion</p>
          </div>
          <div class="content">
            <h2>Hello ${fullName},</h2>
            
            <div class="success">
              <strong>✅ Payment Successful!</strong><br>
              Your subscription has been automatically renewed.
            </div>
            
            <div class="details">
              <p style="margin: 0;"><strong>Plan:</strong> ${planName}</p>
              <p style="margin: 5px 0 0 0;"><strong>Amount Charged:</strong> ₦${amount.toLocaleString()}</p>
              <p style="margin: 5px 0 0 0;"><strong>Next Renewal:</strong> ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <p>You'll continue to enjoy uninterrupted access to all ${planName} features.</p>
            
            <p style="color: #6b7280; font-size: 14px;">
              You can manage your subscription settings anytime from your dashboard.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} TaxKora. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
    : `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .error { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .cta { text-align: center; margin: 30px 0; }
          .cta a { background: #0d9488; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">TaxKora</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Nigerian Tax Companion</p>
          </div>
          <div class="content">
            <h2>Hello ${fullName},</h2>
            
            <div class="error">
              <strong>⚠️ Payment Failed</strong><br>
              We couldn't automatically renew your subscription.
            </div>
            
            <p><strong>Reason:</strong> ${errorMessage || "Payment could not be processed"}</p>
            
            <p>Your subscription access may be limited. Please update your payment method or manually renew your subscription to continue using TaxKora.</p>
            
            <div class="cta">
              <a href="https://taxkora.lovable.app/dashboard/subscription">Update Payment Method</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              If you believe this is an error, please check your card details or contact your bank.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} TaxKora. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "TaxKora <notifications@resend.dev>",
        to: [email],
        subject: subject,
        html: emailHtml,
      }),
    });
  } catch (error) {
    console.error("Failed to send renewal email:", error);
  }
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

    console.log("Starting subscription auto-renewal check...");

    const rawFlutterwaveKey = Deno.env.get("FLUTTERWAVE_SECRET_KEY");

    let FLUTTERWAVE_SECRET_KEY = rawFlutterwaveKey
      ?.trim()
      .replace(/^Bearer\s+/i, "")
      .replace(/^FLUTTERWAVE_SECRET_KEY\s*=\s*/i, "")
      .trim()
      .replace(/^["'`]/, "")
      .replace(/["'`]$/, "")
      .trim();

    const extracted = FLUTTERWAVE_SECRET_KEY?.match(/FLWSECK(?:_TEST)?-[A-Za-z0-9_-]+/);
    if (extracted?.[0]) FLUTTERWAVE_SECRET_KEY = extracted[0];

    const keyLooksLikeSecret =
      (FLUTTERWAVE_SECRET_KEY?.startsWith("FLWSECK-") ?? false) ||
      (FLUTTERWAVE_SECRET_KEY?.startsWith("FLWSECK_TEST-") ?? false);

    const keyLooksLikePublic = FLUTTERWAVE_SECRET_KEY?.startsWith("FLWPUBK-") ?? false;

    if (!FLUTTERWAVE_SECRET_KEY || !keyLooksLikeSecret || keyLooksLikePublic) {
      console.error("FLUTTERWAVE_SECRET_KEY invalid or misconfigured", {
        present: !!rawFlutterwaveKey,
        looksLikeSecret: keyLooksLikeSecret,
        looksLikePublic: keyLooksLikePublic,
      });
      return new Response(
        JSON.stringify({ error: "Payment gateway not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    console.log(`Checking for subscriptions expiring on ${todayStr} with auto_renew enabled...`);

    // Fetch subscriptions that expire today with auto_renew enabled
    // First get subscriptions, then join with payment methods to get card tokens
    const { data: subscriptionsBase, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("status", "active")
      .eq("end_date", todayStr)
      .eq("auto_renew", true);

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscriptions" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Filter to only those with card tokens by checking payment_methods table
    const subscriptions = [];
    for (const sub of subscriptionsBase || []) {
      const { data: paymentMethod } = await supabase
        .from("subscription_payment_methods")
        .select("card_token")
        .eq("subscription_id", sub.id)
        .single();
      
      if (paymentMethod?.card_token) {
        subscriptions.push({ ...sub, card_token: paymentMethod.card_token });
      }
    }

    console.log(`Found ${subscriptions?.length || 0} subscriptions to auto-renew`);

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No subscriptions to renew", renewals: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const results: ChargeResult[] = [];

    for (const subscription of subscriptions) {
      const amount = PLAN_AMOUNTS[subscription.plan] || 0;
      const planName = PLAN_NAMES[subscription.plan] || subscription.plan;

      if (amount === 0) {
        console.log(`Skipping subscription ${subscription.id}: No amount defined for plan ${subscription.plan}`);
        continue;
      }

      // Get user profile for email
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("user_id", subscription.user_id)
        .single();

      console.log(`Processing renewal for user ${subscription.user_id}, plan: ${planName}, amount: ₦${amount}`);

      try {
        // Charge the tokenized card using Flutterwave
        const chargeResponse = await fetch("https://api.flutterwave.com/v3/tokenized-charges", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: subscription.card_token,
            email: profile?.email || "",
            currency: "NGN",
            amount: amount,
            tx_ref: `TXK-RENEW-${subscription.id}-${Date.now()}`,
            narration: `TaxKora ${planName} Annual Subscription Renewal`,
          }),
        });

        const chargeData = await chargeResponse.json();

        if (chargeData.status === "success" && chargeData.data?.status === "successful") {
          console.log(`Successfully charged user ${subscription.user_id}: Transaction ID ${chargeData.data.id}`);

          // Calculate new dates
          const newStartDate = new Date();
          const newEndDate = new Date();
          newEndDate.setFullYear(newEndDate.getFullYear() + 1);

          // Update subscription with new dates
          const { error: updateError } = await supabase
            .from("subscriptions")
            .update({
              start_date: newStartDate.toISOString().split("T")[0],
              end_date: newEndDate.toISOString().split("T")[0],
              amount: amount,
              payment_reference: `FLW-RENEW-${chargeData.data.id}`,
              flutterwave_tx_ref: chargeData.data.tx_ref,
            })
            .eq("id", subscription.id);

          if (updateError) {
            console.error(`Failed to update subscription ${subscription.id}:`, updateError);
          }

          results.push({
            userId: subscription.user_id,
            subscriptionId: subscription.id,
            success: true,
            transactionId: chargeData.data.id.toString(),
          });

          // Send success email
          if (profile?.email) {
            await sendRenewalEmail(
              profile.email,
              profile.full_name || "Valued Customer",
              planName,
              amount,
              true
            );
          }
        } else {
          const errorMsg = chargeData.message || chargeData.data?.processor_response || "Payment failed";
          console.error(`Failed to charge user ${subscription.user_id}:`, errorMsg);

          // Mark subscription as expired
          await supabase
            .from("subscriptions")
            .update({ status: "expired" })
            .eq("id", subscription.id);

          results.push({
            userId: subscription.user_id,
            subscriptionId: subscription.id,
            success: false,
            error: errorMsg,
          });

          // Send failure email
          if (profile?.email) {
            await sendRenewalEmail(
              profile.email,
              profile.full_name || "Valued Customer",
              planName,
              amount,
              false,
              errorMsg
            );
          }
        }
      } catch (chargeError) {
        const errorMsg = chargeError instanceof Error ? chargeError.message : "Charge failed";
        console.error(`Error charging subscription ${subscription.id}:`, chargeError);

        results.push({
          userId: subscription.user_id,
          subscriptionId: subscription.id,
          success: false,
          error: errorMsg,
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    const result = {
      success: true,
      message: "Auto-renewal processing completed",
      stats: {
        total: subscriptions.length,
        successful: successCount,
        failed: failCount,
      },
      results,
    };

    console.log("Auto-renewal result:", result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in subscription-auto-renew function:", error);
    // Return generic error - don't expose internal details (this is a service function)
    return new Response(
      JSON.stringify({ error: "Auto-renewal processing failed" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
