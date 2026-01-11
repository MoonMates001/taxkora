import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface StatutoryDeductionsRecord {
  id: string;
  user_id: string;
  year: number;
  pension_contribution: number;
  nhis_contribution: number;
  nhf_contribution: number;
  housing_loan_interest: number;
  life_insurance_premium: number;
  annual_rent_paid: number;
  employment_compensation: number;
  gifts_received: number;
  pension_benefits_received: number;
  created_at: string;
  updated_at: string;
}

export interface StatutoryDeductionsInsert {
  year: number;
  pension_contribution?: number;
  nhis_contribution?: number;
  nhf_contribution?: number;
  housing_loan_interest?: number;
  life_insurance_premium?: number;
  annual_rent_paid?: number;
  employment_compensation?: number;
  gifts_received?: number;
  pension_benefits_received?: number;
}

const DEFAULT_DEDUCTIONS: Omit<StatutoryDeductionsRecord, "id" | "user_id" | "created_at" | "updated_at"> = {
  year: new Date().getFullYear(),
  pension_contribution: 0,
  nhis_contribution: 0,
  nhf_contribution: 0,
  housing_loan_interest: 0,
  life_insurance_premium: 0,
  annual_rent_paid: 0,
  employment_compensation: 0,
  gifts_received: 0,
  pension_benefits_received: 0,
};

export function useStatutoryDeductions(year?: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const currentYear = year || new Date().getFullYear();

  const { data: deductions, isLoading } = useQuery({
    queryKey: ["statutory-deductions", user?.id, currentYear],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("statutory_deductions")
        .select("*")
        .eq("user_id", user.id)
        .eq("year", currentYear)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching statutory deductions:", error);
        throw error;
      }
      
      return data as StatutoryDeductionsRecord | null;
    },
    enabled: !!user,
  });

  const upsertDeductions = useMutation({
    mutationFn: async (values: StatutoryDeductionsInsert) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("statutory_deductions")
        .upsert(
          {
            user_id: user.id,
            year: values.year || currentYear,
            pension_contribution: values.pension_contribution || 0,
            nhis_contribution: values.nhis_contribution || 0,
            nhf_contribution: values.nhf_contribution || 0,
            housing_loan_interest: values.housing_loan_interest || 0,
            life_insurance_premium: values.life_insurance_premium || 0,
            annual_rent_paid: values.annual_rent_paid || 0,
            employment_compensation: values.employment_compensation || 0,
            gifts_received: values.gifts_received || 0,
            pension_benefits_received: values.pension_benefits_received || 0,
          },
          { onConflict: "user_id,year" }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statutory-deductions"] });
      toast.success("Deductions saved successfully");
    },
    onError: (error) => {
      console.error("Error saving deductions:", error);
      toast.error("Failed to save deductions");
    },
  });

  // Memoize default values to prevent infinite re-renders
  const deductionsWithDefaults = useMemo(() => {
    return deductions || { ...DEFAULT_DEDUCTIONS, year: currentYear };
  }, [deductions, currentYear]);

  return {
    deductions: deductionsWithDefaults,
    isLoading,
    upsertDeductions,
  };
}
