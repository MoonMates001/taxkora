import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ViewData {
  post_id: string;
  referrer?: string;
  device_type?: string;
}

// Detect device type from user agent
const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
};

export const useRecordPostView = () => {
  return useMutation({
    mutationFn: async (postId: string) => {
      const viewData: ViewData = {
        post_id: postId,
        referrer: document.referrer || null,
        device_type: getDeviceType(),
      };
      
      const { error } = await supabase
        .from("blog_post_views")
        .insert(viewData);
      
      if (error) throw error;
    },
  });
};

export const usePostViewCounts = () => {
  return useQuery({
    queryKey: ["blog-post-view-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_post_views")
        .select("post_id");
      
      if (error) throw error;
      
      // Count views per post
      const counts: Record<string, number> = {};
      data.forEach((view) => {
        counts[view.post_id] = (counts[view.post_id] || 0) + 1;
      });
      
      return counts;
    },
  });
};

// Analytics data types
export interface ViewTrend {
  date: string;
  views: number;
}

export interface PopularPost {
  post_id: string;
  title: string;
  views: number;
  slug: string;
}

export interface TrafficSource {
  source: string;
  views: number;
  percentage: number;
}

export interface DeviceStats {
  device: string;
  views: number;
  percentage: number;
}

export interface BlogAnalytics {
  totalViews: number;
  viewTrends: ViewTrend[];
  popularPosts: PopularPost[];
  trafficSources: TrafficSource[];
  deviceStats: DeviceStats[];
}

// Parse referrer to get source name
const parseReferrerSource = (referrer: string | null): string => {
  if (!referrer) return "Direct";
  try {
    const url = new URL(referrer);
    const hostname = url.hostname.replace("www.", "");
    
    // Common sources
    if (hostname.includes("google")) return "Google";
    if (hostname.includes("facebook") || hostname.includes("fb.")) return "Facebook";
    if (hostname.includes("twitter") || hostname.includes("t.co")) return "Twitter/X";
    if (hostname.includes("linkedin")) return "LinkedIn";
    if (hostname.includes("instagram")) return "Instagram";
    if (hostname.includes("youtube")) return "YouTube";
    if (hostname.includes("reddit")) return "Reddit";
    if (hostname.includes("bing")) return "Bing";
    if (hostname.includes("yahoo")) return "Yahoo";
    
    return hostname;
  } catch {
    return "Other";
  }
};

export const useBlogAnalytics = (days: number = 30) => {
  return useQuery({
    queryKey: ["blog-analytics", days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Fetch all views with details
      const { data: views, error: viewsError } = await supabase
        .from("blog_post_views")
        .select("post_id, viewed_at, referrer, device_type")
        .gte("viewed_at", startDate.toISOString())
        .order("viewed_at", { ascending: true });
      
      if (viewsError) throw viewsError;
      
      // Fetch post titles
      const { data: posts, error: postsError } = await supabase
        .from("blog_posts")
        .select("id, title, slug");
      
      if (postsError) throw postsError;
      
      const postMap = new Map(posts?.map(p => [p.id, { title: p.title, slug: p.slug }]) || []);
      
      // Calculate total views
      const totalViews = views?.length || 0;
      
      // Calculate view trends (group by date)
      const trendMap = new Map<string, number>();
      views?.forEach(view => {
        const date = new Date(view.viewed_at).toISOString().split('T')[0];
        trendMap.set(date, (trendMap.get(date) || 0) + 1);
      });
      
      const viewTrends: ViewTrend[] = Array.from(trendMap.entries())
        .map(([date, views]) => ({ date, views }))
        .sort((a, b) => a.date.localeCompare(b.date));
      
      // Calculate popular posts
      const postViewMap = new Map<string, number>();
      views?.forEach(view => {
        postViewMap.set(view.post_id, (postViewMap.get(view.post_id) || 0) + 1);
      });
      
      const popularPosts: PopularPost[] = Array.from(postViewMap.entries())
        .map(([post_id, views]) => ({
          post_id,
          title: postMap.get(post_id)?.title || "Unknown Post",
          slug: postMap.get(post_id)?.slug || "",
          views,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
      
      // Calculate traffic sources
      const sourceMap = new Map<string, number>();
      views?.forEach(view => {
        const source = parseReferrerSource(view.referrer);
        sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
      });
      
      const trafficSources: TrafficSource[] = Array.from(sourceMap.entries())
        .map(([source, views]) => ({
          source,
          views,
          percentage: totalViews > 0 ? Math.round((views / totalViews) * 100) : 0,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
      
      // Calculate device stats
      const deviceMap = new Map<string, number>();
      views?.forEach(view => {
        const device = view.device_type || "Unknown";
        deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
      });
      
      const deviceStats: DeviceStats[] = Array.from(deviceMap.entries())
        .map(([device, views]) => ({
          device: device.charAt(0).toUpperCase() + device.slice(1),
          views,
          percentage: totalViews > 0 ? Math.round((views / totalViews) * 100) : 0,
        }))
        .sort((a, b) => b.views - a.views);
      
      return {
        totalViews,
        viewTrends,
        popularPosts,
        trafficSources,
        deviceStats,
      } as BlogAnalytics;
    },
  });
};
