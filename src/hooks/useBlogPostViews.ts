import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRecordPostView = () => {
  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from("blog_post_views")
        .insert({ post_id: postId });
      
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
