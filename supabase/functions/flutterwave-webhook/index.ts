import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, verif-hash",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the webhook secret hash from Flutterwave
    const signature = req.headers.get("verif-hash");
    const secretHash = Deno.env.get("FLUTTERWAVE_WEBHOOK_SECRET");

    // Verify webhook signature if secret is configured
    if (secretHash && signature !== secretHash) {
      console.error("Invalid webhook signature");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = await req.json();
    console.log("Flutterwave webhook received:", JSON.stringify(payload, null, 2));

    const { event, data } = payload;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different webhook events
    switch (event) {
      case "charge.completed": {
        const { tx_ref, status, amount, currency, customer, id: transactionId } = data;
        console.log(`Payment completed: tx_ref=${tx_ref}, status=${status}, amount=${amount} ${currency}`);

        if (status === "successful") {
          // Check if this is a subscription payment
          if (tx_ref?.startsWith("sub_")) {
            const parts = tx_ref.split("_");
            const planType = parts[1]; // pit_individual, pit_business, or cit
            const userId = parts.slice(2, -1).join("_"); // Handle UUIDs with dashes

            console.log(`Processing subscription webhook: plan=${planType}, userId=${userId}`);

            // Calculate subscription dates
            const startDate = new Date();
            const endDate = new Date();
            endDate.setFullYear(endDate.getFullYear() + 1);

            // Update or create subscription
            const { error: subError } = await supabase
              .from("subscriptions")
              .upsert({
                user_id: userId,
                plan: planType,
                status: "active",
                amount: amount,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                flutterwave_tx_ref: tx_ref,
                payment_reference: transactionId?.toString(),
                updated_at: new Date().toISOString(),
              }, {
                onConflict: "user_id",
              });

            if (subError) {
              console.error("Error updating subscription:", subError);
            } else {
              console.log(`Subscription activated for user ${userId}`);
            }
          }

          // Check if this is an invoice payment
          if (tx_ref?.startsWith("inv_")) {
            const invoiceId = tx_ref.replace("inv_", "").split("_")[0];
            console.log(`Processing invoice payment webhook: invoiceId=${invoiceId}`);

            const { error: invError } = await supabase
              .from("invoices")
              .update({ 
                status: "paid",
                updated_at: new Date().toISOString()
              })
              .eq("id", invoiceId);

            if (invError) {
              console.error("Error updating invoice:", invError);
            } else {
              console.log(`Invoice ${invoiceId} marked as paid`);
            }
          }

          // Check if this is a trial verification payment
          if (tx_ref?.startsWith("trial_")) {
            console.log(`Trial verification payment received: ${tx_ref}`);
            // Trial verification is handled by flutterwave-trial-verify
          }
        }
        break;
      }

      case "transfer.completed": {
        console.log("Transfer completed:", data);
        break;
      }

      case "payment.failed": {
        const { tx_ref, status } = data;
        console.log(`Payment failed: tx_ref=${tx_ref}, status=${status}`);
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    return new Response(
      JSON.stringify({ status: "success", message: "Webhook processed" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({ error }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
