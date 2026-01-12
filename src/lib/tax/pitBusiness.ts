/**
 * Personal Income Tax (PIT) Engine for Sole Proprietors & Partnerships
 * Taxed under State Internal Revenue Service
 */

import { BusinessTaxInput, PITBusinessResult, BusinessIncome, BusinessExpenses } from "./types";
import { PIT_BRACKETS, PIT_EXEMPT_THRESHOLD, RENT_RELIEF_RATE, RENT_RELIEF_CAP } from "./constants";
import { calculateTotalCapitalAllowances, applyCapitalAllowanceRestriction } from "./capitalAllowance";

/**
 * Calculate total gross business income
 */
export function calculateGrossBusinessIncome(income: BusinessIncome): number {
  return (
    income.salesRevenue +
    income.serviceFees +
    income.commissions +
    income.digitalIncome +
    income.exchangeGains +
    income.otherReceipts
  );
}

/**
 * Calculate allowable business expenses
 * Expenses must be wholly, exclusively, necessarily, and reasonably incurred
 */
export function calculateAllowableExpenses(expenses: BusinessExpenses): {
  allowable: number;
  disallowed: number;
} {
  const allowable =
    expenses.costOfGoodsSold +
    expenses.rentPremises +
    expenses.utilities +
    expenses.transport +
    expenses.staffSalaries +
    expenses.repairsMaintenance +
    expenses.professionalFees +
    expenses.internetSoftware +
    expenses.marketingAdvertising +
    expenses.otherAllowable;

  const disallowed =
    expenses.personalExpenses +
    expenses.capitalExpenditure +
    expenses.finesPenalties +
    expenses.nonBusinessDonations;

  return { allowable, disallowed };
}

/**
 * Calculate rent relief (20% of annual rent, capped at ₦500,000)
 */
export function calculateRentRelief(annualRentPaid: number): number {
  const relief = annualRentPaid * RENT_RELIEF_RATE;
  return Math.min(relief, RENT_RELIEF_CAP);
}

/**
 * Calculate personal reliefs for sole proprietors
 */
export function calculatePersonalReliefs(reliefs: NonNullable<BusinessTaxInput["personalReliefs"]>): {
  total: number;
  breakdown: PITBusinessResult["reliefBreakdown"];
} {
  const rentRelief = calculateRentRelief(reliefs.annualRentPaid);
  
  const breakdown = {
    pension: reliefs.pension,
    nhis: reliefs.nhis,
    nhf: reliefs.nhf,
    lifeInsurance: reliefs.lifeInsurance,
    housingLoanInterest: reliefs.housingLoanInterest,
    rentRelief,
  };
  
  const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
  
  return { total, breakdown };
}

/**
 * Calculate PIT using progressive brackets
 */
export function calculatePIT(taxableIncome: number): {
  totalTax: number;
  taxByBracket: PITBusinessResult["taxByBracket"];
} {
  if (taxableIncome <= PIT_EXEMPT_THRESHOLD) {
    return {
      totalTax: 0,
      taxByBracket: PIT_BRACKETS.map((b) => ({
        bracket: b.label,
        income: 0,
        rate: b.rate * 100,
        tax: 0,
      })),
    };
  }

  const taxByBracket: PITBusinessResult["taxByBracket"] = [];
  let totalTax = 0;
  let remaining = taxableIncome;

  for (const bracket of PIT_BRACKETS) {
    const bracketSize = bracket.max === Infinity ? remaining : bracket.max - bracket.min;
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
 * Main PIT computation for sole proprietors and partnerships
 */
export function computePITBusiness(input: BusinessTaxInput): PITBusinessResult {
  const entityType = input.entityType === "partnership" ? "partnership" : "sole_proprietorship";
  
  // Step 1: Calculate Gross Business Income
  const grossBusinessIncome = calculateGrossBusinessIncome(input.businessIncome);
  
  // Step 2: Calculate Allowable Expenses
  const { allowable: allowableExpenses, disallowed: disallowedExpenses } = 
    calculateAllowableExpenses(input.businessExpenses);
  
  // Step 3: Calculate Capital Allowances
  const { breakdown: capitalAllowanceBreakdown, totalAllowance: rawCapitalAllowances } = 
    calculateTotalCapitalAllowances(input.capitalAssets, input.year);
  
  // Preliminary adjusted profit (before capital allowance restriction)
  const preliminaryAdjustedProfit = grossBusinessIncome - allowableExpenses;
  
  // Apply 2/3 restriction on capital allowances
  const { allowedAmount: capitalAllowances, restrictedAmount: capitalAllowanceRestriction } = 
    applyCapitalAllowanceRestriction(rawCapitalAllowances, preliminaryAdjustedProfit);
  
  // Step 4: Calculate Adjusted Profit
  const adjustedProfit = Math.max(0, preliminaryAdjustedProfit - capitalAllowances);
  
  // Step 5: Calculate Personal Reliefs
  const reliefs = input.personalReliefs || {
    pension: 0,
    nhis: 0,
    nhf: 0,
    lifeInsurance: 0,
    housingLoanInterest: 0,
    annualRentPaid: 0,
  };
  const { total: personalReliefs, breakdown: reliefBreakdown } = calculatePersonalReliefs(reliefs);
  
  // Step 6: Calculate Taxable Income
  const taxableIncome = Math.max(0, adjustedProfit - personalReliefs);
  
  // Step 7: Check Exemption
  const isExempt = taxableIncome <= PIT_EXEMPT_THRESHOLD;
  const exemptionReason = isExempt
    ? `Annual taxable income (₦${taxableIncome.toLocaleString()}) is at or below the ₦800,000 threshold`
    : null;
  
  // Step 8: Calculate Tax
  const { totalTax, taxByBracket } = calculatePIT(taxableIncome);
  
  // Step 9: Effective Rate
  const effectiveRate = grossBusinessIncome > 0 ? (totalTax / grossBusinessIncome) * 100 : 0;
  
  return {
    entityType,
    taxAuthority: "SIRS",
    taxationType: "PIT",
    grossBusinessIncome,
    incomeBreakdown: input.businessIncome,
    allowableExpenses,
    disallowedExpenses,
    expenseBreakdown: input.businessExpenses,
    capitalAllowances,
    capitalAllowanceRestriction,
    capitalAllowanceBreakdown,
    adjustedProfit,
    personalReliefs,
    reliefBreakdown,
    taxableIncome,
    isExempt,
    exemptionReason,
    taxByBracket,
    totalTax: isExempt ? 0 : totalTax,
    effectiveRate,
  };
}
