import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller is an admin
    const authHeader = req.headers.get("Authorization")!;
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    // List all users with their subscriptions
    if (action === "list_users") {
      const { data: users, error } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
      if (error) throw error;

      const { data: profiles } = await adminClient.from("profiles").select("*");
      const { data: subscriptions } = await adminClient
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      const enrichedUsers = users.users.map((u) => {
        const profile = profiles?.find((p) => p.user_id === u.id);
        const userSubs = subscriptions?.filter((s) => s.user_id === u.id) || [];
        const activeSub = userSubs.find((s) => s.status === "active" && (!s.end_date || new Date(s.end_date) > new Date()));
        return {
          id: u.id,
          email: u.email,
          full_name: profile?.full_name,
          account_type: profile?.account_type,
          business_name: profile?.business_name,
          created_at: u.created_at,
          active_subscription: activeSub || null,
          all_subscriptions: userSubs,
        };
      });

      return new Response(JSON.stringify({ users: enrichedUsers }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update subscription
    if (action === "update_subscription") {
      const { subscription_id, updates } = body;
      if (!subscription_id) throw new Error("subscription_id required");

      const { data, error } = await adminClient
        .from("subscriptions")
        .update(updates)
        .eq("id", subscription_id)
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ subscription: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create subscription for a user
    if (action === "create_subscription") {
      const { target_user_id, plan, status, amount, start_date, end_date, payment_reference } = body;
      if (!target_user_id || !plan) throw new Error("target_user_id and plan required");

      const { data, error } = await adminClient
        .from("subscriptions")
        .insert({
          user_id: target_user_id,
          plan,
          status: status || "active",
          amount: amount ?? 0,
          start_date: start_date || new Date().toISOString().split("T")[0],
          end_date: end_date || null,
          payment_reference: payment_reference || "ADMIN_CREATED",
        })
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ subscription: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete subscription
    if (action === "delete_subscription") {
      const { subscription_id } = body;
      if (!subscription_id) throw new Error("subscription_id required");

      // Use service role to bypass RLS (users can't delete subscriptions)
      const { error } = await adminClient
        .from("subscriptions")
        .delete()
        .eq("id", subscription_id);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
