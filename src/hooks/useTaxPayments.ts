import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface TaxPayment {
  id: string;
  user_id: string;
  year: number;
  amount: number;
  payment_date: string;
  payment_type: string;
  payment_reference: string | null;
  payment_method: string | null;
  receipt_url: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaxPaymentInsert {
  year: number;
  amount: number;
  payment_date: string;
  payment_type: string;
  payment_reference?: string;
  payment_method?: string;
  receipt_url?: string;
  status?: string;
  notes?: string;
}

export const PAYMENT_TYPES = [
  { value: "pit", label: "Personal Income Tax (PIT)" },
  { value: "cit", label: "Companies Income Tax (CIT)" },
  { value: "vat", label: "Value Added Tax (VAT)" },
  { value: "wht", label: "Withholding Tax (WHT)" },
  { value: "other", label: "Other" },
];

export const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "online", label: "Online Payment" },
  { value: "cash", label: "Cash" },
  { value: "other", label: "Other" },
];

export const PAYMENT_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "confirmed", label: "Confirmed", color: "bg-green-100 text-green-800" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" },
];

export function useTaxPayments(year?: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["tax-payments", user?.id, year],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("tax_payments")
        .select("*")
        .eq("user_id", user.id)
        .order("payment_date", { ascending: false });

      if (year) {
        query = query.eq("year", year);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching tax payments:", error);
        throw error;
      }

      return data as TaxPayment[];
    },
    enabled: !!user,
  });

  const createPayment = useMutation({
    mutationFn: async (payment: TaxPaymentInsert) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("tax_payments")
        .insert({
          user_id: user.id,
          ...payment,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-payments"] });
      toast.success("Tax payment recorded successfully");
    },
    onError: (error) => {
      console.error("Error recording tax payment:", error);
      toast.error("Failed to record tax payment");
    },
  });

  const updatePayment = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TaxPayment> & { id: string }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("tax_payments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-payments"] });
      toast.success("Tax payment updated successfully");
    },
    onError: (error) => {
      console.error("Error updating tax payment:", error);
      toast.error("Failed to update tax payment");
    },
  });

  const deletePayment = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("tax_payments").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-payments"] });
      toast.success("Tax payment deleted");
    },
    onError: (error) => {
      console.error("Error deleting tax payment:", error);
      toast.error("Failed to delete tax payment");
    },
  });

  // Calculate totals
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const confirmedTotal = payments
    .filter((p) => p.status === "confirmed")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return {
    payments,
    isLoading,
    createPayment,
    updatePayment,
    deletePayment,
    totalPaid,
    confirmedTotal,
  };
}
