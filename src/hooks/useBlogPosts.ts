import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  author_name: string;
  category: string;
  tags: string[] | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBlogPostData {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image_url?: string;
  author_name?: string;
  category?: string;
  tags?: string[];
  is_published?: boolean;
}

export const useBlogPosts = (publishedOnly = true) => {
  return useQuery({
    queryKey: ["blog-posts", publishedOnly],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select("*")
        .order("published_at", { ascending: false, nullsFirst: false });
      
      if (publishedOnly) {
        query = query.eq("is_published", true);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as BlogPost[];
    },
  });
};

export const useBlogPost = (slug: string) => {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();
      
      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!slug,
  });
};

export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateBlogPostData) => {
      const { data: post, error } = await supabase
        .from("blog_posts")
        .insert({
          ...data,
          published_at: data.is_published ? new Date().toISOString() : null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast.success("Blog post created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create blog post: " + error.message);
    },
  });
};

export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<BlogPost> & { id: string }) => {
      const updateData: Record<string, unknown> = { ...data };
      if (data.is_published && !data.published_at) {
        updateData.published_at = new Date().toISOString();
      }
      
      const { data: post, error } = await supabase
        .from("blog_posts")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast.success("Blog post updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update blog post: " + error.message);
    },
  });
};

export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast.success("Blog post deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete blog post: " + error.message);
    },
  });
};
