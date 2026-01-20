import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AppRole = "admin" | "moderator" | "user";

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export const useUserRole = () => {
  const { user } = useAuth();

  const { data: roles, isLoading, error } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data as UserRole[];
    },
    enabled: !!user?.id,
  });

  const hasRole = (role: AppRole): boolean => {
    return roles?.some((r) => r.role === role) ?? false;
  };

  const isAdmin = hasRole("admin");
  const isModerator = hasRole("moderator") || isAdmin;

  return {
    roles,
    isLoading,
    error,
    hasRole,
    isAdmin,
    isModerator,
  };
};
