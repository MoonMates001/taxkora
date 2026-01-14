import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface VATFilingStatus {
  id: string;
  year: number;
  month: number;
  status: "pending" | "filed" | "paid";
  filedDate?: string;
  paymentDate?: string;
  paymentReference?: string;
  paymentAmount?: number;
  notes?: string;
}

interface VATFilingStatusRecord {
  id: string;
  user_id: string;
  year: number;
  month: number;
  status: string;
  filed_date: string | null;
  payment_date: string | null;
  payment_reference: string | null;
  payment_amount: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const transformRecord = (record: VATFilingStatusRecord): VATFilingStatus => ({
  id: record.id,
  year: record.year,
  month: record.month,
  status: record.status as "pending" | "filed" | "paid",
  filedDate: record.filed_date || undefined,
  paymentDate: record.payment_date || undefined,
  paymentReference: record.payment_reference || undefined,
  paymentAmount: record.payment_amount ? Number(record.payment_amount) : undefined,
  notes: record.notes || undefined,
});

export function useVATFilingStatus(year?: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ["vat-filing-status", user?.id, year],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from("vat_filing_status")
        .select("*")
        .eq("user_id", user.id)
        .order("year", { ascending: false })
        .order("month", { ascending: false });

      if (year) {
        query = query.eq("year", year);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data as VATFilingStatusRecord[]).map(transformRecord);
    },
    enabled: !!user?.id,
  });

  const upsertStatus = useMutation({
    mutationFn: async (status: Omit<VATFilingStatus, "id"> & { id?: string }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("vat_filing_status")
        .upsert({
          user_id: user.id,
          year: status.year,
          month: status.month,
          status: status.status,
          filed_date: status.filedDate || null,
          payment_date: status.paymentDate || null,
          payment_reference: status.paymentReference || null,
          payment_amount: status.paymentAmount || null,
          notes: status.notes || null,
        }, {
          onConflict: "user_id,year,month",
        })
        .select()
        .single();

      if (error) throw error;
      return transformRecord(data as VATFilingStatusRecord);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vat-filing-status"] });
      toast.success("Filing status updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update status: " + error.message);
    },
  });

  const getStatusForMonth = (year: number, month: number): VATFilingStatus | undefined => {
    return statusQuery.data?.find(s => s.year === year && s.month === month);
  };

  return {
    filingStatuses: statusQuery.data || [],
    isLoading: statusQuery.isLoading,
    error: statusQuery.error,
    upsertStatus,
    getStatusForMonth,
  };
}
