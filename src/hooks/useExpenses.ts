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
  | "housing"
  | "food"
  | "healthcare"
  | "education"
  | "entertainment"
  | "personal_care"
  | "clothing"
  | "transportation"
  | "debt_payment"
  | "savings"
  | "other";

// Business/Corporate expense categories
export const BUSINESS_EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "office_supplies", label: "Office Supplies" },
  { value: "utilities", label: "Utilities" },
  { value: "rent", label: "Rent & Lease" },
  { value: "salaries", label: "Salaries & Wages" },
  { value: "marketing", label: "Marketing & Advertising" },
  { value: "travel", label: "Business Travel" },
  { value: "professional_services", label: "Professional Services" },
  { value: "insurance", label: "Business Insurance" },
  { value: "equipment", label: "Equipment & Machinery" },
  { value: "maintenance", label: "Maintenance & Repairs" },
  { value: "inventory", label: "Inventory & Stock" },
  { value: "taxes", label: "Taxes & Licenses" },
  { value: "other", label: "Other Expenses" },
];

// Personal/Individual expense categories
export const PERSONAL_EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "housing", label: "Housing & Rent" },
  { value: "utilities", label: "Utilities" },
  { value: "food", label: "Food & Groceries" },
  { value: "transportation", label: "Transportation" },
  { value: "healthcare", label: "Healthcare & Medical" },
  { value: "insurance", label: "Insurance" },
  { value: "education", label: "Education" },
  { value: "entertainment", label: "Entertainment & Leisure" },
  { value: "personal_care", label: "Personal Care" },
  { value: "clothing", label: "Clothing & Accessories" },
  { value: "debt_payment", label: "Debt Payments" },
  { value: "savings", label: "Savings & Investments" },
  { value: "taxes", label: "Taxes" },
  { value: "other", label: "Other Expenses" },
];

// Default categories (all combined for backward compatibility)
export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  ...BUSINESS_EXPENSE_CATEGORIES,
  ...PERSONAL_EXPENSE_CATEGORIES.filter(
    (p) => !BUSINESS_EXPENSE_CATEGORIES.some((b) => b.value === p.value)
  ),
];

// Helper to get categories by account type
export const getExpenseCategoriesByType = (accountType: "business" | "personal" | null) => {
  if (accountType === "business") return BUSINESS_EXPENSE_CATEGORIES;
  if (accountType === "personal") return PERSONAL_EXPENSE_CATEGORIES;
  return EXPENSE_CATEGORIES;
};

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
