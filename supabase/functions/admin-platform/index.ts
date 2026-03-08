import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

    // ========================
    // PLATFORM OVERVIEW STATS
    // ========================
    if (action === "get_overview") {
      // Total users
      const { data: allUsers } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
      const totalUsers = allUsers?.users?.length || 0;

      // Users by account type
      const { data: profiles } = await adminClient.from("profiles").select("account_type, created_at");
      const businessUsers = profiles?.filter(p => p.account_type === "business").length || 0;
      const personalUsers = profiles?.filter(p => p.account_type === "personal").length || 0;

      // Subscriptions
      const { data: subscriptions } = await adminClient.from("subscriptions").select("*");
      const activeSubscriptions = subscriptions?.filter(s => s.status === "active" && (!s.end_date || new Date(s.end_date) > new Date())).length || 0;
      const trialSubscriptions = subscriptions?.filter(s => s.status === "active" && s.payment_reference === "TRIAL" && (!s.end_date || new Date(s.end_date) > new Date())).length || 0;
      const expiredSubscriptions = subscriptions?.filter(s => s.status === "expired" || (s.end_date && new Date(s.end_date) <= new Date())).length || 0;
      
      // Revenue calculation
      const paidSubscriptions = subscriptions?.filter(s => s.payment_reference !== "TRIAL" && s.payment_reference !== "ADMIN_CREATED" && s.amount > 0) || [];
      const totalRevenue = paidSubscriptions.reduce((sum, s) => sum + (s.amount || 0), 0);

      // Support tickets
      const { data: tickets } = await adminClient.from("support_tickets").select("status, created_at");
      const openTickets = tickets?.filter(t => t.status === "open").length || 0;
      const totalTickets = tickets?.length || 0;

      // Signups over time (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentSignups = allUsers?.users?.filter(u => new Date(u.created_at) >= thirtyDaysAgo).length || 0;

      // Signups by day (last 14 days)
      const signupsByDay: Record<string, number> = {};
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        signupsByDay[d.toISOString().split("T")[0]] = 0;
      }
      allUsers?.users?.forEach(u => {
        const day = u.created_at.split("T")[0];
        if (signupsByDay[day] !== undefined) {
          signupsByDay[day]++;
        }
      });

      // Webhook events
      const { data: webhookEvents, error: webhookError } = await adminClient
        .from("webhook_events")
        .select("status, event_type, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      const failedWebhooks = webhookEvents?.filter(e => e.status === "failed").length || 0;

      return new Response(JSON.stringify({
        overview: {
          totalUsers,
          businessUsers,
          personalUsers,
          activeSubscriptions,
          trialSubscriptions,
          expiredSubscriptions,
          totalRevenue,
          openTickets,
          totalTickets,
          recentSignups,
          signupsByDay,
          failedWebhooks,
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ========================
    // LIST ALL USERS (DETAILED)
    // ========================
    if (action === "list_users") {
      const { data: allUsers } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
      const { data: profiles } = await adminClient.from("profiles").select("*");
      const { data: subscriptions } = await adminClient.from("subscriptions").select("*").order("created_at", { ascending: false });
      const { data: userRoles } = await adminClient.from("user_roles").select("*");

      const enrichedUsers = allUsers?.users?.map(u => {
        const profile = profiles?.find(p => p.user_id === u.id);
        const userSubs = subscriptions?.filter(s => s.user_id === u.id) || [];
        const activeSub = userSubs.find(s => s.status === "active" && (!s.end_date || new Date(s.end_date) > new Date()));
        const roles = userRoles?.filter(r => r.user_id === u.id).map(r => r.role) || [];

        return {
          id: u.id,
          email: u.email,
          full_name: profile?.full_name,
          account_type: profile?.account_type,
          business_name: profile?.business_name,
          country_of_residence: profile?.country_of_residence,
          phone: profile?.phone,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          email_confirmed_at: u.email_confirmed_at,
          roles,
          active_subscription: activeSub || null,
          all_subscriptions: userSubs,
        };
      }) || [];

      return new Response(JSON.stringify({ users: enrichedUsers }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ========================
    // MANAGE USER ROLES
    // ========================
    if (action === "add_role") {
      const { target_user_id, role } = body;
      if (!target_user_id || !role) throw new Error("target_user_id and role required");

      const { data, error } = await adminClient
        .from("user_roles")
        .insert({ user_id: target_user_id, role })
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ role: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "remove_role") {
      const { target_user_id, role } = body;
      if (!target_user_id || !role) throw new Error("target_user_id and role required");

      const { error } = await adminClient
        .from("user_roles")
        .delete()
        .eq("user_id", target_user_id)
        .eq("role", role);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ========================
    // SUPPORT TICKETS
    // ========================
    if (action === "list_tickets") {
      const { data: tickets, error } = await adminClient
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify({ tickets }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update_ticket") {
      const { ticket_id, updates } = body;
      if (!ticket_id) throw new Error("ticket_id required");

      const { data, error } = await adminClient
        .from("support_tickets")
        .update(updates)
        .eq("id", ticket_id)
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ ticket: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete_ticket") {
      const { ticket_id } = body;
      if (!ticket_id) throw new Error("ticket_id required");

      const { error } = await adminClient
        .from("support_tickets")
        .delete()
        .eq("id", ticket_id);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ========================
    // AUDIT LOGS
    // ========================
    if (action === "list_audit_logs") {
      const { limit = 50, offset = 0 } = body;
      const { data: logs, error } = await adminClient
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return new Response(JSON.stringify({ logs }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ========================
    // WEBHOOK EVENTS
    // ========================
    if (action === "list_webhook_events") {
      const { limit = 50 } = body;
      const { data: events, error } = await adminClient
        .from("webhook_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return new Response(JSON.stringify({ events }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ========================
    // NEWSLETTER SUBSCRIBERS
    // ========================
    if (action === "list_newsletter") {
      const { data: subscribers, error } = await adminClient
        .from("newsletter_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify({ subscribers }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ========================
    // USER ACTIVITY REPORT
    // ========================
    if (action === "get_activity_report") {
      const { days = 7 } = body;
      const since = new Date();
      since.setDate(since.getDate() - Number(days));
      const sinceStr = since.toISOString();

      // All activity in period
      const { data: activities } = await adminClient
        .from("user_activity")
        .select("*")
        .gte("created_at", sinceStr)
        .order("created_at", { ascending: false })
        .limit(5000);

      const events = activities || [];
      const totalEvents = events.length;
      const totalPageViews = events.filter(e => e.event_type === "page_view").length;
      const totalLogins = events.filter(e => e.event_type === "login").length;
      const activeUserIds = [...new Set(events.map(e => e.user_id))];
      const activeUsers = activeUserIds.length;

      // Daily events
      const dailyEvents: Record<string, number> = {};
      for (let i = Number(days) - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dailyEvents[d.toISOString().split("T")[0]] = 0;
      }
      events.forEach(e => {
        const day = e.created_at.split("T")[0];
        if (dailyEvents[day] !== undefined) dailyEvents[day]++;
      });

      // Top pages
      const pageCounts: Record<string, number> = {};
      events.filter(e => e.event_type === "page_view" && e.page_path).forEach(e => {
        pageCounts[e.page_path] = (pageCounts[e.page_path] || 0) + 1;
      });
      const topPages = Object.entries(pageCounts)
        .map(([page, count]) => ({ page, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Platform & device breakdown
      const platformCounts: Record<string, number> = { web: 0, android: 0, ios: 0 };
      const deviceCounts: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 };
      events.forEach(e => {
        const meta = e.metadata as Record<string, any> | null;
        const plat = meta?.platform || "web";
        const dev = meta?.device_type || "desktop";
        platformCounts[plat] = (platformCounts[plat] || 0) + 1;
        deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;
      });
      const nativeAppEvents = events.filter(e => (e.metadata as any)?.is_native_app === true).length;

      // Most active users - get profiles
      const userEventCounts: Record<string, { count: number; sessions: Set<string>; lastActive: string; platform: string }> = {};
      events.forEach(e => {
        if (!userEventCounts[e.user_id]) {
          userEventCounts[e.user_id] = { count: 0, sessions: new Set(), lastActive: e.created_at, platform: "web" };
        }
        userEventCounts[e.user_id].count++;
        if (e.session_id) userEventCounts[e.user_id].sessions.add(e.session_id);
        if (e.created_at > userEventCounts[e.user_id].lastActive) {
          userEventCounts[e.user_id].lastActive = e.created_at;
          userEventCounts[e.user_id].platform = (e.metadata as any)?.platform || "web";
        }
      });

      const topUserIds = Object.entries(userEventCounts)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 15)
        .map(([uid]) => uid);

      // Get user details
      const { data: allUsers } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
      const { data: profiles } = await adminClient.from("profiles").select("user_id, full_name");

      const mostActiveUsers = topUserIds.map(uid => {
        const authUser = allUsers?.users?.find(u => u.id === uid);
        const profile = profiles?.find(p => p.user_id === uid);
        const stats = userEventCounts[uid];
        return {
          user_id: uid,
          email: authUser?.email || "—",
          full_name: profile?.full_name || null,
          event_count: stats.count,
          session_count: stats.sessions.size,
          last_active: stats.lastActive,
          platform: stats.platform,
        };
      });

      // Recent events (last 50) with user email
      const recentEvents = events.slice(0, 50).map(e => {
        const authUser = allUsers?.users?.find(u => u.id === e.user_id);
        return { ...e, email: authUser?.email || null };
      });

      return new Response(JSON.stringify({
        report: {
          total_events: totalEvents,
          total_page_views: totalPageViews,
          total_logins: totalLogins,
          active_users: activeUsers,
          daily_events: dailyEvents,
          top_pages: topPages,
          most_active_users: mostActiveUsers,
          recent_events: recentEvents,
          platform_breakdown: platformCounts,
          device_breakdown: deviceCounts,
          native_app_events: nativeAppEvents,
        }
      }), {
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
