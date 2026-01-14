import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FLUTTERWAVE_SECRET_KEY = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
    if (!FLUTTERWAVE_SECRET_KEY) {
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
        }
      }
    }

    // If it's a tax payment, record it in tax_payments table
    if (payment_type === "tax_payment" && user_id) {
      const currentYear = new Date().getFullYear();
      
      const { error: insertError } = await supabase.from("tax_payments").insert({
        user_id,
        amount: transaction.amount,
        payment_type: "annual",
        payment_date: new Date().toISOString().split("T")[0],
        payment_reference: transaction.tx_ref,
        payment_method: transaction.payment_type || "card",
        status: "completed",
        year: currentYear,
        notes: `Paid via Flutterwave. Transaction ID: ${transaction_id}`,
      });

      if (insertError) {
        console.error("Failed to record tax payment:", insertError);
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
