import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, Profile } from "./useAuth";
import { toast } from "sonner";

export type ProfileUpdate = Partial<Omit<Profile, "id" | "user_id">>;

export const useProfile = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: async (updates: ProfileUpdate) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully");
      // Force page reload to refresh auth context
      window.location.reload();
    },
    onError: (error) => {
      toast.error("Failed to update profile: " + error.message);
    },
  });

  const uploadLogo = async (file: File): Promise<string> => {
    if (!user) throw new Error("Not authenticated");

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/logo.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("invoice-logos")
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("invoice-logos")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  return {
    profile,
    updateProfile,
    uploadLogo,
  };
};
