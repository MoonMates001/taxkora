import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  WHTPaymentType, 
  RecipientType, 
  WHTTransaction,
  calculateWHT 
} from "@/lib/tax/wht";

export interface WHTTransactionInsert {
  paymentType: WHTPaymentType;
  recipientType: RecipientType;
  recipientName: string;
  recipientTIN?: string;
  grossAmount: number;
  paymentDate: string;
  description?: string;
}

// Transform database record to WHTTransaction interface
function transformRecord(record: any): WHTTransaction {
  return {
    id: record.id,
    paymentType: record.payment_type as WHTPaymentType,
    recipientType: record.recipient_type as RecipientType,
    recipientName: record.recipient_name,
    recipientTIN: record.recipient_tin || undefined,
    grossAmount: Number(record.gross_amount),
    whtRate: Number(record.wht_rate),
    whtAmount: Number(record.wht_amount),
    netAmount: Number(record.net_amount),
    paymentDate: record.payment_date,
    description: record.description || undefined,
  };
}

export function useWHTTransactions(year?: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["wht-transactions", user?.id, year],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from("wht_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("payment_date", { ascending: false });

      if (year) {
        query = query
          .gte("payment_date", `${year}-01-01`)
          .lte("payment_date", `${year}-12-31`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching WHT transactions:", error);
        throw error;
      }

      return (data || []).map(transformRecord);
    },
    enabled: !!user?.id,
  });

  const createTransaction = useMutation({
    mutationFn: async (input: WHTTransactionInsert) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { whtRate, whtAmount, netAmount } = calculateWHT(
        input.grossAmount,
        input.paymentType,
        input.recipientType
      );

      const { data, error } = await supabase
        .from("wht_transactions")
        .insert({
          user_id: user.id,
          payment_type: input.paymentType,
          recipient_type: input.recipientType,
          recipient_name: input.recipientName,
          recipient_tin: input.recipientTIN || null,
          gross_amount: input.grossAmount,
          wht_rate: whtRate,
          wht_amount: whtAmount,
          net_amount: netAmount,
          payment_date: input.paymentDate,
          description: input.description || null,
        })
        .select()
        .single();

      if (error) throw error;
      return transformRecord(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wht-transactions"] });
      toast.success("WHT transaction recorded");
    },
    onError: (error) => {
      console.error("Error creating WHT transaction:", error);
      toast.error("Failed to record transaction");
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("wht_transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wht-transactions"] });
      toast.success("Transaction deleted");
    },
    onError: (error) => {
      console.error("Error deleting WHT transaction:", error);
      toast.error("Failed to delete transaction");
    },
  });

  return {
    transactions,
    isLoading,
    createTransaction,
    deleteTransaction,
  };
}
