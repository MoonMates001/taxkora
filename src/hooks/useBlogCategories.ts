import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
}

export const useBlogCategories = () => {
  return useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data as BlogCategory[];
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateCategoryData) => {
      const { data: category, error } = await supabase
        .from("blog_categories")
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
      toast.success("Category created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create category: " + error.message);
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<BlogCategory> & { id: string }) => {
      const { data: category, error } = await supabase
        .from("blog_categories")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
      toast.success("Category updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update category: " + error.message);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("blog_categories")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
      toast.success("Category deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete category: " + error.message);
    },
  });
};
