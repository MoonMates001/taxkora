import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Helper to create a JWT from service account for Google APIs
async function getGoogleAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.readonly https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/androidpublisher",
    aud: serviceAccount.token_uri,
    exp: now + 3600,
    iat: now,
  };

  const encode = (obj: any) => btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const headerB64 = encode(header);
  const payloadB64 = encode(payload);
  const signingInput = `${headerB64}.${payloadB64}`;

  // Import private key
  const pemContent = serviceAccount.private_key
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\n/g, "");
  const binaryKey = Uint8Array.from(atob(pemContent), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const jwt = `${signingInput}.${sigB64}`;

  // Exchange JWT for access token
  const tokenRes = await fetch(serviceAccount.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) {
    throw new Error(`Token exchange failed: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
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
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse service account key
    const serviceAccountJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_KEY");
    if (!serviceAccountJson) {
      return new Response(JSON.stringify({ error: "Firebase service account not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceAccount = JSON.parse(serviceAccountJson);
    const accessToken = await getGoogleAccessToken(serviceAccount);
    const projectId = serviceAccount.project_id;

    const body = await req.json();
    const { action } = body;

    // ========================
    // FIREBASE ANALYTICS
    // ========================
    if (action === "get_app_analytics") {
      const results: any = {
        activeUsers: null,
        newUsers: null,
        crashFreeRate: null,
        usersByCountry: [],
        usersByDay: [],
        retentionData: null,
        errors: [],
      };

      // Try Firebase Analytics Data API (GA4)
      // First, find the GA4 property linked to Firebase
      try {
        // List Firebase apps to get app info
        const appsRes = await fetch(
          `https://firebase.googleapis.com/v1beta1/projects/${projectId}/androidApps`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const appsData = await appsRes.json();
        if (appsRes.ok) {
          results.androidApps = appsData.apps || [];
        } else {
          results.errors.push(`Firebase apps: ${JSON.stringify(appsData)}`);
        }
      } catch (e) {
        results.errors.push(`Firebase apps error: ${e.message}`);
      }

      // Try Google Analytics Data API (GA4) for user metrics
      try {
        // List GA4 properties linked to this Firebase project
        const adminRes = await fetch(
          `https://analyticsadmin.googleapis.com/v1beta/properties?filter=firebase_project:projects/${projectId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const adminData = await adminRes.json();
        
        if (adminRes.ok && adminData.properties && adminData.properties.length > 0) {
          const propertyId = adminData.properties[0].name; // e.g. "properties/123456"

          // Run analytics report - Active users, new users, sessions by day (last 30 days)
          const reportRes = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/${propertyId}:runReport`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
                dimensions: [{ name: "date" }],
                metrics: [
                  { name: "activeUsers" },
                  { name: "newUsers" },
                  { name: "sessions" },
                  { name: "crashFreeUsersRate" },
                ],
                orderBys: [{ dimension: { dimensionName: "date" } }],
              }),
            }
          );
          const reportData = await reportRes.json();

          if (reportRes.ok && reportData.rows) {
            let totalActive = 0;
            let totalNew = 0;
            const dailyData: any[] = [];

            reportData.rows.forEach((row: any) => {
              const date = row.dimensionValues[0].value;
              const active = parseInt(row.metricValues[0].value) || 0;
              const newU = parseInt(row.metricValues[1].value) || 0;
              const sessions = parseInt(row.metricValues[2].value) || 0;
              totalActive += active;
              totalNew += newU;
              dailyData.push({
                date: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
                activeUsers: active,
                newUsers: newU,
                sessions,
              });
            });

            results.activeUsers = totalActive;
            results.newUsers = totalNew;
            results.usersByDay = dailyData;

            // Crash-free rate from last row
            if (reportData.rows.length > 0) {
              const lastRow = reportData.rows[reportData.rows.length - 1];
              const cfr = parseFloat(lastRow.metricValues[3].value);
              if (!isNaN(cfr)) results.crashFreeRate = cfr;
            }
          } else {
            results.errors.push(`Analytics report: ${JSON.stringify(reportData)}`);
          }

          // Country breakdown
          try {
            const countryRes = await fetch(
              `https://analyticsdata.googleapis.com/v1beta/${propertyId}:runReport`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
                  dimensions: [{ name: "country" }],
                  metrics: [{ name: "activeUsers" }],
                  orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
                  limit: 15,
                }),
              }
            );
            const countryData = await countryRes.json();
            if (countryRes.ok && countryData.rows) {
              results.usersByCountry = countryData.rows.map((row: any) => ({
                country: row.dimensionValues[0].value,
                users: parseInt(row.metricValues[0].value) || 0,
              }));
            }
          } catch (e) {
            results.errors.push(`Country data: ${e.message}`);
          }

          // Device breakdown
          try {
            const deviceRes = await fetch(
              `https://analyticsdata.googleapis.com/v1beta/${propertyId}:runReport`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
                  dimensions: [{ name: "deviceCategory" }],
                  metrics: [{ name: "activeUsers" }],
                }),
              }
            );
            const deviceData = await deviceRes.json();
            if (deviceRes.ok && deviceData.rows) {
              results.deviceBreakdown = deviceData.rows.map((row: any) => ({
                device: row.dimensionValues[0].value,
                users: parseInt(row.metricValues[0].value) || 0,
              }));
            }
          } catch (e) {
            results.errors.push(`Device data: ${e.message}`);
          }
        } else {
          results.errors.push(`No GA4 property found linked to Firebase project. Response: ${JSON.stringify(adminData)}`);
        }
      } catch (e) {
        results.errors.push(`GA4 error: ${e.message}`);
      }

      return new Response(JSON.stringify({ analytics: results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Firebase analytics error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
