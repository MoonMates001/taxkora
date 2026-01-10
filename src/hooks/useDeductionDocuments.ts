import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface DeductionDocument {
  id: string;
  user_id: string;
  year: number;
  document_type: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  description: string | null;
  created_at: string;
}

export const DOCUMENT_TYPES = [
  { value: "pension", label: "Pension Contribution" },
  { value: "nhis", label: "NHIS Contribution" },
  { value: "nhf", label: "NHF Contribution" },
  { value: "housing_loan", label: "Housing Loan Interest" },
  { value: "life_insurance", label: "Life Insurance Premium" },
  { value: "rent", label: "Rent Receipt/Lease" },
  { value: "other", label: "Other Document" },
];

export function useDeductionDocuments(year?: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["deduction-documents", user?.id, year],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("deduction_documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (year) {
        query = query.eq("year", year);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching deduction documents:", error);
        throw error;
      }

      return data as DeductionDocument[];
    },
    enabled: !!user,
  });

  const uploadDocument = useMutation({
    mutationFn: async ({
      file,
      documentType,
      year: docYear,
      description,
    }: {
      file: File;
      documentType: string;
      year: number;
      description?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${docYear}/${documentType}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("deduction-documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("deduction-documents")
        .getPublicUrl(fileName);

      // Create document record
      const { data, error } = await supabase
        .from("deduction_documents")
        .insert({
          user_id: user.id,
          year: docYear,
          document_type: documentType,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_size: file.size,
          description,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deduction-documents"] });
      toast.success("Document uploaded successfully");
    },
    onError: (error) => {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (doc: DeductionDocument) => {
      if (!user) throw new Error("User not authenticated");

      // Extract file path from URL
      const urlParts = doc.file_url.split("/");
      const filePath = urlParts.slice(-3).join("/");

      // Delete from storage
      await supabase.storage.from("deduction-documents").remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from("deduction_documents")
        .delete()
        .eq("id", doc.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deduction-documents"] });
      toast.success("Document deleted");
    },
    onError: (error) => {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    },
  });

  return {
    documents,
    isLoading,
    uploadDocument,
    deleteDocument,
  };
}
