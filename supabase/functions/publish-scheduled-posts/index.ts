import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date().toISOString();

    // Find all scheduled posts that are due for publication
    const { data: scheduledPosts, error: fetchError } = await supabase
      .from("blog_posts")
      .select("id, title, slug, scheduled_at")
      .eq("is_published", false)
      .not("scheduled_at", "is", null)
      .lte("scheduled_at", now);

    if (fetchError) {
      console.error("Error fetching scheduled posts:", fetchError);
      throw fetchError;
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      console.log("No scheduled posts to publish");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No scheduled posts to publish",
          published: 0 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Found ${scheduledPosts.length} posts to publish`);

    // Publish each scheduled post
    const postIds = scheduledPosts.map(post => post.id);
    const { error: updateError } = await supabase
      .from("blog_posts")
      .update({
        is_published: true,
        published_at: now,
        scheduled_at: null, // Clear schedule after publishing
      })
      .in("id", postIds);

    if (updateError) {
      console.error("Error publishing posts:", updateError);
      throw updateError;
    }

    const publishedTitles = scheduledPosts.map(p => p.title);
    console.log("Successfully published:", publishedTitles);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Published ${scheduledPosts.length} scheduled post(s)`,
        published: scheduledPosts.length,
        posts: publishedTitles,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error in publish-scheduled-posts:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
