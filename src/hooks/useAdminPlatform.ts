import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAdminPlatform(action: string, body: Record<string, unknown> = {}, enabled = true) {
  return useQuery({
    queryKey: ["admin-platform", action, body],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-platform", {
        body: { action, ...body },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data;
    },
    enabled,
  });
}
