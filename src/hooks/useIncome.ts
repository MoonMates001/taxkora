import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export type IncomeCategory =
  | "sales"
  | "services"
  | "consulting"
  | "commission"
  | "interest"
  | "rental"
  | "investment"
  | "grants"
  | "salary"
  | "wages"
  | "pension"
  | "dividends"
  | "gifts"
  | "freelance"
  | "other";

// Business/Corporate income categories
export const BUSINESS_INCOME_CATEGORIES: { value: IncomeCategory; label: string }[] = [
  { value: "sales", label: "Sales Revenue" },
  { value: "services", label: "Service Revenue" },
  { value: "consulting", label: "Consulting Fees" },
  { value: "commission", label: "Commission Income" },
  { value: "interest", label: "Interest Income" },
  { value: "rental", label: "Rental Income" },
  { value: "investment", label: "Investment Returns" },
  { value: "grants", label: "Grants & Subsidies" },
  { value: "dividends", label: "Dividend Income" },
  { value: "other", label: "Other Income" },
];

// Personal/Individual income categories
export const PERSONAL_INCOME_CATEGORIES: { value: IncomeCategory; label: string }[] = [
  { value: "salary", label: "Salary" },
  { value: "wages", label: "Wages" },
  { value: "freelance", label: "Freelance Income" },
  { value: "pension", label: "Pension" },
  { value: "interest", label: "Interest Income" },
  { value: "rental", label: "Rental Income" },
  { value: "dividends", label: "Dividends" },
  { value: "investment", label: "Investment Returns" },
  { value: "gifts", label: "Gifts & Inheritance" },
  { value: "other", label: "Other Income" },
];

// Default categories (all combined for backward compatibility)
export const INCOME_CATEGORIES: { value: IncomeCategory; label: string }[] = [
  ...BUSINESS_INCOME_CATEGORIES,
  ...PERSONAL_INCOME_CATEGORIES.filter(
    (p) => !BUSINESS_INCOME_CATEGORIES.some((b) => b.value === p.value)
  ),
];

// Helper to get categories by account type
export const getIncomeCategoriesByType = (accountType: "business" | "personal" | null) => {
  if (accountType === "business") return BUSINESS_INCOME_CATEGORIES;
  if (accountType === "personal") return PERSONAL_INCOME_CATEGORIES;
  return INCOME_CATEGORIES;
};

export interface IncomeRecord {
  id: string;
  user_id: string;
  category: IncomeCategory;
  description: string;
  amount: number;
  date: string;
  client_id: string | null;
  invoice_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  clients?: { name: string } | null;
}

export interface IncomeInsert {
  category: IncomeCategory;
  description: string;
  amount: number;
  date: string;
  client_id?: string | null;
  invoice_id?: string | null;
  notes?: string | null;
}

export const useIncome = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: incomeRecords = [], isLoading } = useQuery({
    queryKey: ["income", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("income_records")
        .select(`
          *,
          clients (name)
        `)
        .order("date", { ascending: false });
      if (error) throw error;
      return data as IncomeRecord[];
    },
    enabled: !!user,
  });

  const createIncome = useMutation({
    mutationFn: async (income: IncomeInsert) => {
      const { data, error } = await supabase
        .from("income_records")
        .insert({ ...income, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
      toast.success("Income recorded successfully");
    },
    onError: (error) => {
      toast.error("Failed to record income: " + error.message);
    },
  });

  const updateIncome = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<IncomeRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from("income_records")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
      toast.success("Income updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update income: " + error.message);
    },
  });

  const deleteIncome = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("income_records")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
      toast.success("Income deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete income: " + error.message);
    },
  });

  const totalIncome = incomeRecords.reduce(
    (sum, record) => sum + Number(record.amount),
    0
  );

  return {
    incomeRecords,
    isLoading,
    createIncome,
    updateIncome,
    deleteIncome,
    totalIncome,
  };
};
