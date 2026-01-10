/**
 * Nigeria Tax Act 2026 - Personal Income Tax Engine
 * Implements the new PIT rules effective from 2026
 */

// Tax-exempt threshold
export const TAX_EXEMPT_THRESHOLD = 800000;

// Rent relief cap
export const RENT_RELIEF_RATE = 0.20; // 20% of annual rent
export const RENT_RELIEF_CAP = 500000; // Maximum ₦500,000

// Employment compensation exemption cap
export const EMPLOYMENT_COMPENSATION_EXEMPT_CAP = 50000000; // ₦50 million

// Progressive Tax Brackets (Nigeria Tax Act 2026)
export const PIT_BRACKETS_2026 = [
  { min: 0, max: 800000, rate: 0, label: "First ₦800,000" },
  { min: 800000, max: 3000000, rate: 0.15, label: "₦800,001 — ₦3,000,000" },
  { min: 3000000, max: 12000000, rate: 0.18, label: "₦3,000,001 — ₦12,000,000" },
  { min: 12000000, max: 25000000, rate: 0.21, label: "₦12,000,001 — ₦25,000,000" },
  { min: 25000000, max: 50000000, rate: 0.23, label: "₦25,000,001 — ₦50,000,000" },
  { min: 50000000, max: Infinity, rate: 0.25, label: "Above ₦50,000,000" },
];

// Income categories that count as taxable income
export const TAXABLE_INCOME_CATEGORIES = [
  "employment", // Salaries, wages, bonuses
  "salary",
  "wages",
  "bonus",
  "business_profits", // Business/professional profits
  "professional_fees",
  "consulting",
  "services",
  "interest", // Interest/investment income
  "investment",
  "fx_gains", // FX gains
  "bond_income", // Bond income
  "rent_income", // Rent and property income
  "property",
  "asset_disposal", // Gains from disposal of assets
  "capital_gains",
  "crypto", // Digital/virtual asset gains
  "digital_assets",
  "virtual_assets",
  "foreign_income", // Foreign-sourced income
  "other", // Other taxable income
] as const;

// Exempt income categories
export const EXEMPT_INCOME_CATEGORIES = [
  "gifts", // Gifts received are exempt
  "pension_benefits", // Approved pension benefits
] as const;

export interface StatutoryDeductions {
  pension_contribution: number;
  nhis_contribution: number;
  nhf_contribution: number;
  housing_loan_interest: number;
  life_insurance_premium: number;
  annual_rent_paid: number;
  employment_compensation: number;
  gifts_received: number;
  pension_benefits_received: number;
}

export interface TaxComputationResult {
  // Income breakdown
  grossIncome: number;
  exemptIncome: number;
  taxableGrossIncome: number;
  
  // Deductions
  statutoryDeductions: number;
  rentRelief: number;
  totalDeductions: number;
  deductionBreakdown: {
    pension: number;
    nhis: number;
    nhf: number;
    housingLoanInterest: number;
    lifeInsurance: number;
    rentRelief: number;
  };
  
  // Taxable income
  taxableIncome: number;
  
  // Tax calculation
  isExempt: boolean;
  exemptionReason: string | null;
  taxByBracket: { bracket: string; income: number; rate: number; tax: number }[];
  totalTax: number;
  effectiveRate: number;
  
  // Final amounts
  netTaxPayable: number;
}

/**
 * Calculate rent relief (20% of annual rent, capped at ₦500,000)
 */
export function calculateRentRelief(annualRentPaid: number): number {
  const relief = annualRentPaid * RENT_RELIEF_RATE;
  return Math.min(relief, RENT_RELIEF_CAP);
}

/**
 * Calculate total statutory deductions
 */
export function calculateStatutoryDeductions(deductions: StatutoryDeductions): {
  total: number;
  breakdown: TaxComputationResult["deductionBreakdown"];
} {
  const rentRelief = calculateRentRelief(deductions.annual_rent_paid);
  
  const breakdown = {
    pension: deductions.pension_contribution,
    nhis: deductions.nhis_contribution,
    nhf: deductions.nhf_contribution,
    housingLoanInterest: deductions.housing_loan_interest,
    lifeInsurance: deductions.life_insurance_premium,
    rentRelief,
  };
  
  const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
  
  return { total, breakdown };
}

/**
 * Calculate Personal Income Tax using 2026 progressive brackets
 */
export function calculatePIT2026(taxableIncome: number): {
  totalTax: number;
  taxByBracket: TaxComputationResult["taxByBracket"];
} {
  // If below exempt threshold, no tax
  if (taxableIncome <= TAX_EXEMPT_THRESHOLD) {
    return {
      totalTax: 0,
      taxByBracket: PIT_BRACKETS_2026.map(b => ({
        bracket: b.label,
        income: 0,
        rate: b.rate * 100,
        tax: 0,
      })),
    };
  }
  
  const taxByBracket: TaxComputationResult["taxByBracket"] = [];
  let totalTax = 0;
  let remaining = taxableIncome;
  
  for (const bracket of PIT_BRACKETS_2026) {
    const bracketSize = bracket.max === Infinity 
      ? remaining 
      : bracket.max - bracket.min;
    
    const incomeInBracket = Math.min(Math.max(0, remaining), bracketSize);
    const taxInBracket = incomeInBracket * bracket.rate;
    
    taxByBracket.push({
      bracket: bracket.label,
      income: incomeInBracket,
      rate: bracket.rate * 100,
      tax: taxInBracket,
    });
    
    totalTax += taxInBracket;
    remaining -= incomeInBracket;
    
    if (remaining <= 0) break;
  }
  
  return { totalTax, taxByBracket };
}

/**
 * Check if taxpayer qualifies for exemption
 */
export function checkExemption(
  taxableIncome: number,
  deductions: StatutoryDeductions
): { isExempt: boolean; reason: string | null } {
  // Full exemption if taxable income ≤ ₦800,000
  if (taxableIncome <= TAX_EXEMPT_THRESHOLD) {
    return {
      isExempt: true,
      reason: `Annual taxable income (₦${taxableIncome.toLocaleString()}) is below the ₦800,000 threshold`,
    };
  }
  
  return { isExempt: false, reason: null };
}

/**
 * Calculate exempt income (gifts, pension benefits, employment compensation up to 50M)
 */
export function calculateExemptIncome(deductions: StatutoryDeductions): number {
  const exemptEmploymentComp = Math.min(
    deductions.employment_compensation,
    EMPLOYMENT_COMPENSATION_EXEMPT_CAP
  );
  
  return (
    deductions.gifts_received +
    deductions.pension_benefits_received +
    exemptEmploymentComp
  );
}

/**
 * Main tax computation function
 */
export function computeTax2026(
  grossIncome: number,
  deductions: StatutoryDeductions
): TaxComputationResult {
  // Step 1: Calculate exempt income
  const exemptIncome = calculateExemptIncome(deductions);
  const taxableGrossIncome = Math.max(0, grossIncome - exemptIncome);
  
  // Step 2: Calculate statutory deductions
  const { total: statutoryDeductionsTotal, breakdown } = calculateStatutoryDeductions(deductions);
  
  // Step 3: Calculate taxable income
  const taxableIncome = Math.max(0, taxableGrossIncome - statutoryDeductionsTotal);
  
  // Step 4: Check for exemption
  const { isExempt, reason: exemptionReason } = checkExemption(taxableIncome, deductions);
  
  // Step 5: Calculate tax
  const { totalTax, taxByBracket } = calculatePIT2026(taxableIncome);
  
  // Step 6: Calculate effective rate
  const effectiveRate = taxableGrossIncome > 0 
    ? (totalTax / taxableGrossIncome) * 100 
    : 0;
  
  return {
    grossIncome,
    exemptIncome,
    taxableGrossIncome,
    statutoryDeductions: statutoryDeductionsTotal,
    rentRelief: breakdown.rentRelief,
    totalDeductions: statutoryDeductionsTotal,
    deductionBreakdown: breakdown,
    taxableIncome,
    isExempt,
    exemptionReason,
    taxByBracket,
    totalTax,
    effectiveRate,
    netTaxPayable: isExempt ? 0 : totalTax,
  };
}
