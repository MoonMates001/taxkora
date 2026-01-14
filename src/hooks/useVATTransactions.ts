import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface VATTransaction {
  id: string;
  transactionType: "output" | "input";
  description: string;
  amount: number;
  vatAmount: number;
  category?: string;
  isExempt: boolean;
  transactionDate: string;
  year: number;
  month: number;
}

interface VATTransactionRecord {
  id: string;
  user_id: string;
  transaction_type: string;
  description: string;
  amount: number;
  vat_amount: number;
  category: string | null;
  is_exempt: boolean;
  transaction_date: string;
  year: number;
  month: number;
  created_at: string;
  updated_at: string;
}

const transformRecord = (record: VATTransactionRecord): VATTransaction => ({
  id: record.id,
  transactionType: record.transaction_type as "output" | "input",
  description: record.description,
  amount: Number(record.amount),
  vatAmount: Number(record.vat_amount),
  category: record.category || undefined,
  isExempt: record.is_exempt,
  transactionDate: record.transaction_date,
  year: record.year,
  month: record.month,
});

export function useVATTransactions(year?: number, month?: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const transactionsQuery = useQuery({
    queryKey: ["vat-transactions", user?.id, year, month],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from("vat_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("transaction_date", { ascending: false });

      if (year) {
        query = query.eq("year", year);
      }
      if (month) {
        query = query.eq("month", month);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data as VATTransactionRecord[]).map(transformRecord);
    },
    enabled: !!user?.id,
  });

  const createTransaction = useMutation({
    mutationFn: async (transaction: Omit<VATTransaction, "id">) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("vat_transactions")
        .insert({
          user_id: user.id,
          transaction_type: transaction.transactionType,
          description: transaction.description,
          amount: transaction.amount,
          vat_amount: transaction.vatAmount,
          category: transaction.category || null,
          is_exempt: transaction.isExempt,
          transaction_date: transaction.transactionDate,
          year: transaction.year,
          month: transaction.month,
        })
        .select()
        .single();

      if (error) throw error;
      return transformRecord(data as VATTransactionRecord);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vat-transactions"] });
      toast.success("VAT transaction added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add transaction: " + error.message);
    },
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<VATTransaction> & { id: string }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("vat_transactions")
        .update({
          transaction_type: updates.transactionType,
          description: updates.description,
          amount: updates.amount,
          vat_amount: updates.vatAmount,
          category: updates.category || null,
          is_exempt: updates.isExempt,
          transaction_date: updates.transactionDate,
          year: updates.year,
          month: updates.month,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return transformRecord(data as VATTransactionRecord);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vat-transactions"] });
      toast.success("VAT transaction updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update transaction: " + error.message);
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("vat_transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vat-transactions"] });
      toast.success("VAT transaction deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete transaction: " + error.message);
    },
  });

  return {
    transactions: transactionsQuery.data || [],
    isLoading: transactionsQuery.isLoading,
    error: transactionsQuery.error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
