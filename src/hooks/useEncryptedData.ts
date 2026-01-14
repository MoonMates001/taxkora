import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { 
  deriveUserKey, 
  encryptData, 
  decryptData, 
  generateMaskedValue 
} from "@/lib/encryption";

export type EncryptedDataType = 'tin' | 'bank_account' | 'payment_ref' | 'sensitive_note';

interface EncryptedUserData {
  id: string;
  user_id: string;
  data_type: string;
  encrypted_value: string;
  iv: string;
  masked_value: string | null;
  created_at: string;
  updated_at: string;
}

export const useEncryptedData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all encrypted data for user
  const { data: encryptedData, isLoading } = useQuery({
    queryKey: ["encrypted-data", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("encrypted_user_data")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data as EncryptedUserData[];
    },
    enabled: !!user?.id,
  });

  // Get masked value for a specific data type
  const getMaskedValue = (dataType: EncryptedDataType): string | null => {
    const record = encryptedData?.find(d => d.data_type === dataType);
    return record?.masked_value ?? null;
  };

  // Check if encrypted data exists for a type
  const hasEncryptedData = (dataType: EncryptedDataType): boolean => {
    return encryptedData?.some(d => d.data_type === dataType) ?? false;
  };

  // Store encrypted data
  const storeEncrypted = useMutation({
    mutationFn: async ({ 
      dataType, 
      value, 
      maskType 
    }: { 
      dataType: EncryptedDataType; 
      value: string; 
      maskType?: 'email' | 'phone' | 'tin' | 'payment_ref';
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Derive encryption key from user ID
      const key = await deriveUserKey(user.id);
      
      // Encrypt the value
      const { encryptedValue, iv } = await encryptData(value, key);
      
      // Generate masked value for display
      const maskedValue = maskType 
        ? generateMaskedValue(value, maskType) 
        : '*'.repeat(Math.min(value.length, 10));

      // Upsert to database
      const { data, error } = await supabase
        .from("encrypted_user_data")
        .upsert({
          user_id: user.id,
          data_type: dataType,
          encrypted_value: encryptedValue,
          iv,
          masked_value: maskedValue,
        }, {
          onConflict: 'user_id,data_type',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encrypted-data"] });
      toast.success("Data encrypted and stored securely");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to encrypt data");
    },
  });

  // Retrieve and decrypt data
  const retrieveDecrypted = async (dataType: EncryptedDataType): Promise<string | null> => {
    if (!user?.id) return null;

    const record = encryptedData?.find(d => d.data_type === dataType);
    if (!record) return null;

    try {
      const key = await deriveUserKey(user.id);
      return await decryptData(record.encrypted_value, record.iv, key);
    } catch (error) {
      console.error("Decryption failed:", error);
      return null;
    }
  };

  // Delete encrypted data
  const deleteEncrypted = useMutation({
    mutationFn: async (dataType: EncryptedDataType) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("encrypted_user_data")
        .delete()
        .eq("user_id", user.id)
        .eq("data_type", dataType);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encrypted-data"] });
      toast.success("Encrypted data deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete encrypted data");
    },
  });

  return {
    encryptedData,
    isLoading,
    getMaskedValue,
    hasEncryptedData,
    storeEncrypted,
    retrieveDecrypted,
    deleteEncrypted,
  };
};
