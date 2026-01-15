/**
 * Smart Automatic Tax Exemptions and Deductions
 * Based on Nigeria Tax Act 2025 rules
 */

import { Expense } from "@/hooks/useExpenses";
import { TAX_EXEMPT_THRESHOLD, RENT_RELIEF_RATE, RENT_RELIEF_CAP, EMPLOYMENT_COMPENSATION_EXEMPT_CAP } from "./taxEngine2026";

export interface DetectedDeduction {
  type: string;
  category: string;
  amount: number;
  description: string;
  confidence: "high" | "medium" | "low";
  actionRequired: boolean;
  documentRequired: boolean;
  suggestion: string;
}

export interface AutoExemption {
  type: string;
  amount: number;
  description: string;
  isApplied: boolean;
  requirement: string;
}

export interface SmartDeductionResult {
  detectedDeductions: DetectedDeduction[];
  autoExemptions: AutoExemption[];
  totalPotentialSavings: number;
  recommendedActions: string[];
  taxOptimizationTips: string[];
}

// Keywords for detecting rent payments in expenses
const RENT_KEYWORDS = ["rent", "lease", "housing", "apartment", "accommodation", "tenancy"];
const INSURANCE_KEYWORDS = ["insurance", "life insurance", "premium", "policy", "annuity"];
const HEALTHCARE_KEYWORDS = ["health", "medical", "hospital", "nhis", "hmo", "health insurance"];
const PENSION_KEYWORDS = ["pension", "retirement", "pfa", "rsa", "pencom"];
const NHF_KEYWORDS = ["nhf", "housing fund", "national housing"];

/**
 * Detect potential deductions from expense records
 */
export function detectDeductionsFromExpenses(expenses: Expense[], year: number): DetectedDeduction[] {
  const yearlyExpenses = expenses.filter(
    (e) => new Date(e.date).getFullYear() === year
  );

  const detectedDeductions: DetectedDeduction[] = [];

  // Analyze each expense for potential deductions
  yearlyExpenses.forEach((expense) => {
    const desc = expense.description.toLowerCase();
    const vendor = (expense.vendor || "").toLowerCase();
    const combined = `${desc} ${vendor}`;

    // Detect rent payments
    if (expense.category === "rent" || expense.category === "housing" || 
        RENT_KEYWORDS.some((k) => combined.includes(k))) {
      detectedDeductions.push({
        type: "rent_relief",
        category: "Rent Relief",
        amount: expense.amount,
        description: expense.description,
        confidence: expense.category === "rent" || expense.category === "housing" ? "high" : "medium",
        actionRequired: true,
        documentRequired: true,
        suggestion: "Upload rent receipt or lease agreement to claim 20% rent relief (max ₦500,000)",
      });
    }

    // Detect insurance payments
    if (expense.category === "insurance" || INSURANCE_KEYWORDS.some((k) => combined.includes(k))) {
      const isLifeInsurance = combined.includes("life") || combined.includes("annuity");
      detectedDeductions.push({
        type: isLifeInsurance ? "life_insurance" : "general_insurance",
        category: isLifeInsurance ? "Life Insurance Premium" : "Insurance",
        amount: expense.amount,
        description: expense.description,
        confidence: isLifeInsurance ? "high" : "medium",
        actionRequired: true,
        documentRequired: true,
        suggestion: isLifeInsurance 
          ? "Life insurance premiums are deductible. Upload premium receipt to claim."
          : "If this is a life insurance or annuity premium, it may be deductible.",
      });
    }

    // Detect healthcare/NHIS payments
    if (expense.category === "healthcare" || HEALTHCARE_KEYWORDS.some((k) => combined.includes(k))) {
      const isNHIS = combined.includes("nhis") || combined.includes("hmo");
      if (isNHIS) {
        detectedDeductions.push({
          type: "nhis_contribution",
          category: "NHIS Contribution",
          amount: expense.amount,
          description: expense.description,
          confidence: "high",
          actionRequired: true,
          documentRequired: true,
          suggestion: "NHIS contributions are fully deductible. Upload contribution statement.",
        });
      }
    }

    // Detect pension contributions
    if (PENSION_KEYWORDS.some((k) => combined.includes(k))) {
      detectedDeductions.push({
        type: "pension_contribution",
        category: "Pension Contribution",
        amount: expense.amount,
        description: expense.description,
        confidence: "high",
        actionRequired: true,
        documentRequired: true,
        suggestion: "Pension contributions to registered PFAs are fully deductible.",
      });
    }

    // Detect NHF contributions
    if (NHF_KEYWORDS.some((k) => combined.includes(k))) {
      detectedDeductions.push({
        type: "nhf_contribution",
        category: "NHF Contribution",
        amount: expense.amount,
        description: expense.description,
        confidence: "high",
        actionRequired: true,
        documentRequired: true,
        suggestion: "National Housing Fund contributions are tax-deductible.",
      });
    }
  });

  // Aggregate by type
  const aggregated = new Map<string, DetectedDeduction>();
  detectedDeductions.forEach((d) => {
    const existing = aggregated.get(d.type);
    if (existing) {
      existing.amount += d.amount;
      existing.description = `${existing.description.split(",")[0]} and ${detectedDeductions.filter((x) => x.type === d.type).length - 1} more`;
    } else {
      aggregated.set(d.type, { ...d });
    }
  });

  return Array.from(aggregated.values());
}

/**
 * Calculate automatic exemptions based on income
 */
export function calculateAutoExemptions(
  grossIncome: number,
  employmentCompensation: number = 0,
  giftsReceived: number = 0,
  pensionBenefits: number = 0
): AutoExemption[] {
  const exemptions: AutoExemption[] = [];

  // Tax-free threshold exemption
  if (grossIncome <= TAX_EXEMPT_THRESHOLD) {
    exemptions.push({
      type: "income_threshold",
      amount: grossIncome,
      description: "Full tax exemption for income ≤ ₦800,000",
      isApplied: true,
      requirement: "No documentation required - automatically applied",
    });
  }

  // Minimum wage exemption (approximation)
  const MINIMUM_WAGE_ANNUAL = 70000 * 12; // ₦70,000 monthly minimum wage
  if (grossIncome <= MINIMUM_WAGE_ANNUAL && grossIncome > 0) {
    exemptions.push({
      type: "minimum_wage",
      amount: grossIncome,
      description: "Minimum wage earners are effectively exempt",
      isApplied: true,
      requirement: "Employment records showing minimum wage earnings",
    });
  }

  // Gifts exemption
  if (giftsReceived > 0) {
    exemptions.push({
      type: "gifts",
      amount: giftsReceived,
      description: "Gifts received are exempt from tax",
      isApplied: true,
      requirement: "Documentation of gift source may be required",
    });
  }

  // Pension benefits exemption
  if (pensionBenefits > 0) {
    exemptions.push({
      type: "pension_benefits",
      amount: pensionBenefits,
      description: "Approved pension and retirement benefits are exempt",
      isApplied: true,
      requirement: "Pension payout documentation from PFA",
    });
  }

  // Employment compensation exemption (up to ₦50M)
  if (employmentCompensation > 0) {
    const exemptAmount = Math.min(employmentCompensation, EMPLOYMENT_COMPENSATION_EXEMPT_CAP);
    exemptions.push({
      type: "employment_compensation",
      amount: exemptAmount,
      description: `Loss of employment compensation (up to ₦50M exempt)`,
      isApplied: true,
      requirement: "Termination letter and compensation agreement",
    });
  }

  return exemptions;
}

/**
 * Calculate potential rent relief from expenses
 */
export function calculatePotentialRentRelief(expenses: Expense[], year: number): number {
  const rentExpenses = expenses
    .filter((e) => new Date(e.date).getFullYear() === year)
    .filter((e) => {
      const combined = `${e.description} ${e.vendor || ""}`.toLowerCase();
      return e.category === "rent" || e.category === "housing" || 
             RENT_KEYWORDS.some((k) => combined.includes(k));
    });

  const totalRent = rentExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const relief = totalRent * RENT_RELIEF_RATE;
  return Math.min(relief, RENT_RELIEF_CAP);
}

/**
 * Generate tax optimization tips
 */
export function generateOptimizationTips(
  grossIncome: number,
  currentDeductions: number,
  detectedDeductions: DetectedDeduction[]
): string[] {
  const tips: string[] = [];

  // Check if near exemption threshold
  if (grossIncome > TAX_EXEMPT_THRESHOLD && grossIncome <= TAX_EXEMPT_THRESHOLD * 1.5) {
    tips.push(
      `Your income is close to the ₦800,000 tax-free threshold. Maximizing deductions could reduce your taxable income below this level.`
    );
  }

  // Check for unclaimed rent relief
  const rentDeduction = detectedDeductions.find((d) => d.type === "rent_relief");
  if (rentDeduction && rentDeduction.actionRequired) {
    const potentialRelief = Math.min(rentDeduction.amount * RENT_RELIEF_RATE, RENT_RELIEF_CAP);
    tips.push(
      `You may be eligible for up to ₦${potentialRelief.toLocaleString()} in rent relief. Upload rent documentation to claim.`
    );
  }

  // Suggest pension contributions
  if (!detectedDeductions.some((d) => d.type === "pension_contribution")) {
    tips.push(
      `Consider contributing to a registered Pension Fund (PFA). Pension contributions are fully tax-deductible.`
    );
  }

  // Suggest NHIS enrollment
  if (!detectedDeductions.some((d) => d.type === "nhis_contribution")) {
    tips.push(
      `Enrolling in the National Health Insurance Scheme (NHIS) provides tax-deductible contributions.`
    );
  }

  // Life insurance suggestion
  if (!detectedDeductions.some((d) => d.type === "life_insurance")) {
    tips.push(
      `Life insurance and annuity premiums are tax-deductible. Consider a policy for both protection and tax benefits.`
    );
  }

  // NHF suggestion for higher earners
  if (grossIncome >= 3000000) {
    tips.push(
      `Contributing to the National Housing Fund (NHF) is mandatory for some employees and provides tax deductions.`
    );
  }

  return tips;
}

/**
 * Main function to analyze and recommend smart deductions
 */
export function analyzeSmartDeductions(
  grossIncome: number,
  expenses: Expense[],
  year: number,
  currentStatutoryDeductions: {
    pension_contribution: number;
    nhis_contribution: number;
    nhf_contribution: number;
    life_insurance_premium: number;
    annual_rent_paid: number;
    employment_compensation: number;
    gifts_received: number;
    pension_benefits_received: number;
  }
): SmartDeductionResult {
  // Detect deductions from expenses
  const detectedDeductions = detectDeductionsFromExpenses(expenses, year);

  // Calculate auto exemptions
  const autoExemptions = calculateAutoExemptions(
    grossIncome,
    currentStatutoryDeductions.employment_compensation,
    currentStatutoryDeductions.gifts_received,
    currentStatutoryDeductions.pension_benefits_received
  );

  // Calculate potential savings
  const potentialRentRelief = calculatePotentialRentRelief(expenses, year);
  const claimedRentRelief = Math.min(
    currentStatutoryDeductions.annual_rent_paid * RENT_RELIEF_RATE,
    RENT_RELIEF_CAP
  );
  const unclaimedRentRelief = Math.max(0, potentialRentRelief - claimedRentRelief);

  // Sum up unclaimed deductions
  const unclaimedDeductions = detectedDeductions
    .filter((d) => d.actionRequired)
    .reduce((sum, d) => {
      if (d.type === "rent_relief") return sum + unclaimedRentRelief;
      return sum + d.amount;
    }, 0);

  // Generate optimization tips
  const taxOptimizationTips = generateOptimizationTips(
    grossIncome,
    currentStatutoryDeductions.pension_contribution + 
    currentStatutoryDeductions.nhis_contribution +
    currentStatutoryDeductions.nhf_contribution,
    detectedDeductions
  );

  // Generate recommended actions
  const recommendedActions: string[] = [];
  
  if (detectedDeductions.some((d) => d.documentRequired && d.actionRequired)) {
    recommendedActions.push("Upload supporting documents for detected deductions");
  }
  
  if (unclaimedRentRelief > 0) {
    recommendedActions.push(`Claim ₦${unclaimedRentRelief.toLocaleString()} in rent relief`);
  }

  const uncapturedPension = detectedDeductions.find(
    (d) => d.type === "pension_contribution" && d.amount > currentStatutoryDeductions.pension_contribution
  );
  if (uncapturedPension) {
    recommendedActions.push("Update pension contribution records");
  }

  return {
    detectedDeductions,
    autoExemptions,
    totalPotentialSavings: unclaimedDeductions,
    recommendedActions,
    taxOptimizationTips,
  };
}
