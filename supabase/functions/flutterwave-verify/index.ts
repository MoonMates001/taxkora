import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Webhook function - needs wildcard CORS for Flutterwave callbacks and user redirect
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validate transaction_id format (Flutterwave uses numeric IDs)
const TRANSACTION_ID_REGEX = /^\d{1,20}$/;

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

    // Validate transaction_id format to prevent enumeration attacks
    const transactionIdStr = String(transaction_id);
    if (!TRANSACTION_ID_REGEX.test(transactionIdStr)) {
      console.error("Invalid transaction_id format:", transaction_id);
      return new Response(
        JSON.stringify({ error: "Invalid transaction ID format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
      return new Response(
        JSON.stringify({ error: "Transaction verification failed", details: verifyData }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const transaction = verifyData.data;

    // Verify the transaction is successful and matches expected details
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
    const { user_id, payment_type, reference_id } = transaction.meta || {};

    // Handle subscription payment
    if (payment_type === "subscription" && user_id) {
      console.log("Processing subscription payment for user:", user_id);
      
      // Find the pending subscription with this tx_ref
      const { data: pendingSubscription, error: findError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("flutterwave_tx_ref", transaction.tx_ref)
        .eq("status", "pending")
        .single();

      if (findError) {
        console.error("Failed to find pending subscription:", findError);
      } else if (pendingSubscription) {
        // Calculate subscription dates (1 year from now)
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);

        // Update subscription to active
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            status: "active",
            start_date: startDate.toISOString().split("T")[0],
            end_date: endDate.toISOString().split("T")[0],
            payment_reference: `FLW-${transaction_id}`,
          })
          .eq("id", pendingSubscription.id);

        if (updateError) {
          console.error("Failed to activate subscription:", updateError);
        } else {
          console.log("Subscription activated successfully:", pendingSubscription.id);

          // Check if this user was referred by someone and update referral status
          const { data: referralData, error: referralError } = await supabase
            .from("referrals")
            .select("id, referrer_id, referred_email")
            .eq("referred_user_id", user_id)
            .eq("status", "signed_up")
            .maybeSingle();

          if (!referralError && referralData) {
            // Update referral status to subscribed
            const { error: referralUpdateError } = await supabase
              .from("referrals")
              .update({
                status: "subscribed",
                completed_at: new Date().toISOString(),
              })
              .eq("id", referralData.id);

            if (!referralUpdateError) {
              console.log("Referral marked as subscribed:", referralData.id);

              // Get user email for notification
              const { data: userProfile } = await supabase
                .from("profiles")
                .select("email")
                .eq("user_id", user_id)
                .single();

              // Send notification to referrer using fetch to call the edge function
              try {
                const notifyResponse = await fetch(
                  `${Deno.env.get("SUPABASE_URL")}/functions/v1/referral-notification`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                    },
                    body: JSON.stringify({
                      referrerId: referralData.referrer_id,
                      referredEmail: referralData.referred_email || userProfile?.email || "A friend",
                      eventType: "subscribed",
                    }),
                  }
                );
                
                if (notifyResponse.ok) {
                  console.log("Referral notification sent to referrer");
                } else {
                  console.error("Failed to send referral notification:", await notifyResponse.text());
                }
              } catch (notifyError) {
                console.error("Error sending referral notification:", notifyError);
              }
            }
          }
        }
      }
    }

    // If it's an invoice payment, update invoice status
    if (payment_type === "invoice" && reference_id) {
      const { error: updateError } = await supabase
        .from("invoices")
        .update({ status: "paid" })
        .eq("id", reference_id);

      if (updateError) {
        console.error("Failed to update invoice status:", updateError);
      }
    }

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Payment verified successfully",
        payment_type,
        transaction: {
          id: transaction.id,
          tx_ref: transaction.tx_ref,
          amount: transaction.amount,
          currency: transaction.currency,
          payment_type: transaction.payment_type,
          status: transaction.status,
          customer: transaction.customer,
          created_at: transaction.created_at,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Verification error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Verification failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
