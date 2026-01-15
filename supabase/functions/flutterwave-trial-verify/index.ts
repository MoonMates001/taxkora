import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Webhook function - needs wildcard CORS for Flutterwave callbacks and user redirect
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validate transaction_id format (Flutterwave uses numeric IDs)
const TRANSACTION_ID_REGEX = /^\d{1,20}$/;

// Plan amounts for future billing
const PLAN_AMOUNTS: Record<string, number> = {
  pit_individual: 2500,
  pit_business: 7500,
  cit: 25000,
};

// Plan names
const PLAN_NAMES: Record<string, string> = {
  pit_individual: "Individual PIT",
  pit_business: "Business PIT",
  cit: "Companies Income Tax",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { transaction_id, tx_ref } = await req.json();

    if (!transaction_id) {
      return new Response(
        JSON.stringify({ error: "Transaction ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate transaction_id format
    const transactionIdStr = String(transaction_id);
    if (!TRANSACTION_ID_REGEX.test(transactionIdStr)) {
      console.error("Invalid transaction_id format:", transaction_id);
      return new Response(
        JSON.stringify({ error: "Invalid transaction ID format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Verifying trial card tokenization:", { transaction_id, tx_ref });

    // Verify transaction with Flutterwave
    const verifyResponse = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: {
          Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    );

    const verifyData = await verifyResponse.json();

    if (verifyData.status !== "success") {
      console.error("Flutterwave verification failed:", verifyData);
      return new Response(
        JSON.stringify({ error: "Transaction verification failed", details: verifyData }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const transaction = verifyData.data;

    // Verify the transaction is successful
    if (transaction.status !== "successful") {
      return new Response(
        JSON.stringify({
          status: "failed",
          message: `Transaction ${transaction.status}`,
          transaction,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract metadata
    const { user_id, payment_type, plan } = transaction.meta || {};

    if (payment_type !== "trial_tokenization") {
      return new Response(
        JSON.stringify({ error: "Invalid payment type for trial verification" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!user_id || !plan) {
      return new Response(
        JSON.stringify({ error: "Missing user or plan information" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Trial tokenization verified:", { user_id, plan, transaction_id });

    // Extract card token from the transaction
    const cardToken = transaction.card?.token || null;
    const cardLastFour = transaction.card?.last_4digits || null;
    const cardExpiry = transaction.card?.expiry || null;

    if (!cardToken) {
      console.warn("No card token received from Flutterwave");
    }

    // Calculate trial dates (90 days)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 90);

    // Create trial subscription (without card token - that goes in separate secure table)
    const { data: subscriptionData, error: insertError } = await supabase
      .from("subscriptions")
      .insert({
        user_id,
        plan,
        status: "active",
        amount: 0, // Trial is free
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        payment_reference: "TRIAL",
        flutterwave_tx_ref: tx_ref,
        auto_renew: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create trial subscription:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to activate trial subscription" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store card token in secure payment_methods table (only accessible by service role)
    if (cardToken) {
      const { error: paymentMethodError } = await supabase
        .from("subscription_payment_methods")
        .insert({
          subscription_id: subscriptionData.id,
          user_id,
          card_token: cardToken,
          card_last_four: cardLastFour,
          card_expiry: cardExpiry,
        });

      if (paymentMethodError) {
        console.error("Failed to store payment method:", paymentMethodError);
        // Don't fail the subscription, but log the issue
      } else {
        console.log("Payment method stored securely");
      }
    }

    console.log("Trial subscription created:", subscriptionData.id);

    // Refund the ₦50 verification charge
    try {
      const refundResponse = await fetch(
        `https://api.flutterwave.com/v3/transactions/${transaction_id}/refund`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: 50,
            comments: "Trial card verification refund",
          }),
        }
      );

      const refundData = await refundResponse.json();
      if (refundData.status === "success") {
        console.log("Verification charge refunded successfully");
      } else {
        console.warn("Refund may have failed:", refundData);
      }
    } catch (refundError) {
      console.error("Error processing refund:", refundError);
      // Don't fail the trial activation if refund fails
    }

    // Send trial welcome email
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("user_id", user_id)
        .single();

      if (profileData?.email) {
        const trialEndDate = endDate.toLocaleDateString("en-NG", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        await fetch(
          `${supabaseUrl}/functions/v1/trial-welcome-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              email: profileData.email,
              name: profileData.full_name || profileData.email.split("@")[0],
              planName: PLAN_NAMES[plan] || plan,
              trialEndDate,
              features: [],
              hasCardOnFile: !!cardToken,
            }),
          }
        );
        console.log("Trial welcome email sent");
      }
    } catch (emailError) {
      console.error("Failed to send trial welcome email:", emailError);
    }

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Trial activated successfully",
        plan,
        trial_end_date: endDate.toISOString().split("T")[0],
        card_saved: !!cardToken,
        card_last_four: cardLastFour,
        subscription_id: subscriptionData.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Trial verification error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Verification failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
