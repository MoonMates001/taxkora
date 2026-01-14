import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CapitalAsset, CapitalAssetCategory } from "@/lib/tax/types";
import { toast } from "sonner";

interface CapitalAssetRecord {
  id: string;
  user_id: string;
  description: string;
  category: string;
  cost: number;
  acquisition_date: string;
  year_acquired: number;
  created_at: string;
  updated_at: string;
}

const transformRecord = (record: CapitalAssetRecord): CapitalAsset => ({
  id: record.id,
  description: record.description,
  category: record.category as CapitalAssetCategory,
  cost: Number(record.cost),
  acquisitionDate: record.acquisition_date,
  yearAcquired: record.year_acquired,
  initialAllowanceRate: 0.25,
  annualAllowanceRate: 0.20,
  writtenDownValue: Number(record.cost),
  totalAllowanceClaimed: 0,
});

export function useCapitalAssets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const assetsQuery = useQuery({
    queryKey: ["capital-assets", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("capital_assets")
        .select("*")
        .eq("user_id", user.id)
        .order("year_acquired", { ascending: false });

      if (error) throw error;
      return (data as CapitalAssetRecord[]).map(transformRecord);
    },
    enabled: !!user?.id,
  });

  const createAsset = useMutation({
    mutationFn: async (asset: Omit<CapitalAsset, "id" | "initialAllowanceRate" | "annualAllowanceRate" | "writtenDownValue" | "totalAllowanceClaimed">) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("capital_assets")
        .insert({
          user_id: user.id,
          description: asset.description,
          category: asset.category,
          cost: asset.cost,
          acquisition_date: asset.acquisitionDate,
          year_acquired: asset.yearAcquired,
        })
        .select()
        .single();

      if (error) throw error;
      return transformRecord(data as CapitalAssetRecord);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capital-assets"] });
      toast.success("Capital asset added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add asset: " + error.message);
    },
  });

  const updateAsset = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CapitalAsset> & { id: string }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("capital_assets")
        .update({
          description: updates.description,
          category: updates.category,
          cost: updates.cost,
          acquisition_date: updates.acquisitionDate,
          year_acquired: updates.yearAcquired,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return transformRecord(data as CapitalAssetRecord);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capital-assets"] });
      toast.success("Capital asset updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update asset: " + error.message);
    },
  });

  const deleteAsset = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("capital_assets")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capital-assets"] });
      toast.success("Capital asset deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete asset: " + error.message);
    },
  });

  return {
    assets: assetsQuery.data || [],
    isLoading: assetsQuery.isLoading,
    error: assetsQuery.error,
    createAsset,
    updateAsset,
    deleteAsset,
  };
}
