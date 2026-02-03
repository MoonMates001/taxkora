import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BlogAuthor {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatar_url: string | null;
  job_title: string | null;
  email: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBlogAuthorData {
  name: string;
  slug: string;
  bio?: string;
  avatar_url?: string;
  job_title?: string;
  email?: string;
  twitter_url?: string;
  linkedin_url?: string;
  website_url?: string;
}

export const useBlogAuthors = () => {
  return useQuery({
    queryKey: ["blog-authors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_authors")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data as BlogAuthor[];
    },
  });
};

export const useBlogAuthor = (id: string) => {
  return useQuery({
    queryKey: ["blog-author", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_authors")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as BlogAuthor;
    },
    enabled: !!id,
  });
};

export const useCreateBlogAuthor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBlogAuthorData) => {
      const { data: author, error } = await supabase
        .from("blog_authors")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return author;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-authors"] });
      toast.success("Author created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create author: " + error.message);
    },
  });
};

export const useUpdateBlogAuthor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<BlogAuthor> & { id: string }) => {
      const { data: author, error } = await supabase
        .from("blog_authors")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return author;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-authors"] });
      toast.success("Author updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update author: " + error.message);
    },
  });
};

export const useDeleteBlogAuthor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("blog_authors")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-authors"] });
      toast.success("Author deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete author: " + error.message);
    },
  });
};
