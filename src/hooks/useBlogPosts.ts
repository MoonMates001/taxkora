import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BlogAuthor } from "./useBlogAuthors";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  author_name: string;
  author_id: string | null;
  category: string;
  tags: string[] | null;
  is_published: boolean;
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  author?: BlogAuthor;
}

export interface CreateBlogPostData {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image_url?: string;
  author_name?: string;
  author_id?: string;
  category?: string;
  tags?: string[];
  is_published?: boolean;
  scheduled_at?: string | null;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
}

export interface PaginatedBlogPosts {
  posts: BlogPost[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export const useBlogPosts = (publishedOnly = true) => {
  return useQuery({
    queryKey: ["blog-posts", publishedOnly],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select("*, author:blog_authors(*)")
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

export const usePaginatedBlogPosts = (page: number = 1, pageSize: number = 9, publishedOnly = true) => {
  return useQuery({
    queryKey: ["blog-posts-paginated", page, pageSize, publishedOnly],
    queryFn: async (): Promise<PaginatedBlogPosts> => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Get total count first
      let countQuery = supabase
        .from("blog_posts")
        .select("*", { count: "exact", head: true });
      
      if (publishedOnly) {
        countQuery = countQuery.eq("is_published", true);
      }
      
      const { count, error: countError } = await countQuery;
      
      if (countError) throw countError;

      // Get paginated data with author
      let dataQuery = supabase
        .from("blog_posts")
        .select("*, author:blog_authors(*)")
        .order("published_at", { ascending: false, nullsFirst: false })
        .range(from, to);
      
      if (publishedOnly) {
        dataQuery = dataQuery.eq("is_published", true);
      }
      
      const { data, error: dataError } = await dataQuery;
      
      if (dataError) throw dataError;

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        posts: data as BlogPost[],
        totalCount,
        totalPages,
        currentPage: page,
      };
    },
  });
};

export const useBlogPost = (slug: string) => {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*, author:blog_authors(*)")
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      if (variables.scheduled_at) {
        toast.success(`Blog post scheduled for ${new Date(variables.scheduled_at).toLocaleString()}`);
      } else {
        toast.success("Blog post created successfully");
      }
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
