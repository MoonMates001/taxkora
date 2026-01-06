import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export type ExpenseCategory =
  | "office_supplies"
  | "utilities"
  | "rent"
  | "salaries"
  | "marketing"
  | "travel"
  | "professional_services"
  | "insurance"
  | "equipment"
  | "maintenance"
  | "inventory"
  | "taxes"
  | "other";

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "office_supplies", label: "Office Supplies" },
  { value: "utilities", label: "Utilities" },
  { value: "rent", label: "Rent" },
  { value: "salaries", label: "Salaries & Wages" },
  { value: "marketing", label: "Marketing & Advertising" },
  { value: "travel", label: "Travel & Transport" },
  { value: "professional_services", label: "Professional Services" },
  { value: "insurance", label: "Insurance" },
  { value: "equipment", label: "Equipment" },
  { value: "maintenance", label: "Maintenance & Repairs" },
  { value: "inventory", label: "Inventory & Stock" },
  { value: "taxes", label: "Taxes & Fees" },
  { value: "other", label: "Other" },
];

export interface Expense {
  id: string;
  user_id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  vendor: string | null;
  receipt_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseInsert {
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  vendor?: string | null;
  receipt_url?: string | null;
  notes?: string | null;
}

export const useExpenses = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!user,
  });

  const createExpense = useMutation({
    mutationFn: async (expense: ExpenseInsert) => {
      const { data, error } = await supabase
        .from("expenses")
        .insert({ ...expense, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense recorded successfully");
    },
    onError: (error) => {
      toast.error("Failed to record expense: " + error.message);
    },
  });

  const updateExpense = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Expense> & { id: string }) => {
      const { data, error } = await supabase
        .from("expenses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update expense: " + error.message);
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete expense: " + error.message);
    },
  });

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  return {
    expenses,
    isLoading,
    createExpense,
    updateExpense,
    deleteExpense,
    totalExpenses,
  };
};
