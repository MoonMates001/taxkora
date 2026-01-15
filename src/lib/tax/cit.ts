/**
 * Companies Income Tax (CIT) Engine for Incorporated Companies
 * Taxed under Nigeria Revenue Service (NRS)
 */

import { BusinessTaxInput, CITResult, CITBand } from "./types";
import { CIT_BANDS, SMALL_COMPANY_THRESHOLD } from "./constants";
import { calculateTotalCapitalAllowances, applyCapitalAllowanceRestriction } from "./capitalAllowance";
import { calculateGrossBusinessIncome, calculateAllowableExpenses } from "./pitBusiness";

/**
 * Determine CIT band based on annual turnover
 */
export function determineCITBand(annualTurnover: number): CITBand {
  for (const band of CIT_BANDS) {
    if (annualTurnover > band.minTurnover && annualTurnover <= band.maxTurnover) {
      return band;
    }
  }
  // Default to first band if turnover is 0 or negative
  return CIT_BANDS[0];
}

/**
 * Calculate accounting profit from financial statements
 */
export function calculateAccountingProfit(
  grossRevenue: number,
  costOfSales: number,
  operatingExpenses: number
): number {
  return grossRevenue - costOfSales - operatingExpenses;
}

/**
 * Apply tax adjustments to accounting profit
 */
export function applyTaxAdjustments(
  accountingProfit: number,
  adjustments: NonNullable<BusinessTaxInput["citAdjustments"]>
): {
  assessableProfit: number;
  addBacks: number;
  deductions: number;
} {
  const addBacks =
    adjustments.depreciation +
    adjustments.nonDeductibleExpenses +
    adjustments.provisions +
    adjustments.unapprovedDonations;

  const deductions = adjustments.exemptIncome;

  const assessableProfit = accountingProfit + addBacks - deductions;

  return { assessableProfit, addBacks, deductions };
}

/**
 * Main CIT computation for incorporated companies
 */
export function computeCIT(input: BusinessTaxInput): CITResult {
  // Step 1: Determine turnover classification
  const annualTurnover = input.annualTurnover || 0;
  const citBand = determineCITBand(annualTurnover);
  
  // Step 2: Calculate gross revenue from business income
  const grossRevenue = calculateGrossBusinessIncome(input.businessIncome);
  
  // Step 3: Calculate costs
  const { allowable: operatingExpenses } = calculateAllowableExpenses(input.businessExpenses);
  const costOfSales = input.businessExpenses.costOfGoodsSold;
  
  // Step 4: Calculate accounting profit
  const accountingProfit = grossRevenue - costOfSales - (operatingExpenses - costOfSales);
  
  // Step 5: Apply tax adjustments
  const citAdjustments = input.citAdjustments || {
    depreciation: 0,
    nonDeductibleExpenses: 0,
    provisions: 0,
    unapprovedDonations: 0,
    exemptIncome: 0,
  };
  
  const { assessableProfit, addBacks, deductions } = applyTaxAdjustments(
    accountingProfit,
    citAdjustments
  );
  
  // Step 6: Calculate Capital Allowances
  const { breakdown: capitalAllowanceBreakdown, totalAllowance: rawCapitalAllowances } =
    calculateTotalCapitalAllowances(input.capitalAssets, input.year);
  
  // Apply 2/3 restriction
  const {
    allowedAmount: capitalAllowances,
    restrictedAmount: capitalAllowanceRestriction,
    carryForward: capitalAllowanceCarryForward,
  } = applyCapitalAllowanceRestriction(rawCapitalAllowances, assessableProfit);
  
  // Step 7: Calculate taxable profit
  const taxableProfit = Math.max(0, assessableProfit - capitalAllowances);
  
  // Step 8: Determine if exempt (small company 0% rate)
  const isExempt = citBand.rate === 0;
  const exemptionReason = isExempt
    ? `Company qualifies as Small Company with turnover ≤₦25 million (0% CIT rate)`
    : null;
  
  // Step 9: Calculate CIT
  const citPayable = taxableProfit * citBand.rate;
  
  // Step 10: Effective rate
  const effectiveRate = grossRevenue > 0 ? (citPayable / grossRevenue) * 100 : 0;
  
  return {
    entityType: "limited_company",
    taxAuthority: "NRS",
    taxationType: "CIT",
    annualTurnover,
    turnoverCategory: citBand.category,
    citRate: citBand.rate * 100,
    grossRevenue,
    costOfSales,
    operatingExpenses: operatingExpenses - costOfSales,
    accountingProfit,
    addBackDepreciation: citAdjustments.depreciation,
    addBackNonDeductible: citAdjustments.nonDeductibleExpenses,
    addBackProvisions: citAdjustments.provisions,
    addBackUnapprovedDonations: citAdjustments.unapprovedDonations,
    deductCapitalAllowances: capitalAllowances,
    deductExemptIncome: citAdjustments.exemptIncome,
    capitalAllowances,
    capitalAllowanceRestriction,
    capitalAllowanceCarryForward,
    capitalAllowanceBreakdown,
    assessableProfit,
    taxableProfit,
    isExempt,
    exemptionReason,
    citPayable: isExempt ? 0 : citPayable,
    effectiveRate,
    filingRequired: true, // Filing always required even at 0%
  };
}
