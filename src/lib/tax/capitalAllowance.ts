/**
 * Capital Allowance Computation
 * Handles initial and annual allowances for capital assets
 */

import { CapitalAsset, CapitalAllowanceResult, CapitalAssetCategory } from "./types";
import { CAPITAL_ALLOWANCE_RATES, CAPITAL_ALLOWANCE_RESTRICTION_RATE } from "./constants";

/**
 * Get capital allowance rates for an asset category
 */
export function getAllowanceRates(category: CapitalAssetCategory) {
  return CAPITAL_ALLOWANCE_RATES.find((r) => r.category === category) || CAPITAL_ALLOWANCE_RATES.find((r) => r.category === "other")!;
}

/**
 * Calculate capital allowance for a single asset
 */
export function calculateAssetAllowance(
  asset: CapitalAsset,
  currentYear: number
): CapitalAllowanceResult {
  const rates = getAllowanceRates(asset.category);
  const yearsHeld = currentYear - asset.yearAcquired;
  
  let initialAllowance = 0;
  let annualAllowance = 0;
  let writtenDownValue = asset.cost;
  
  // Initial allowance only in year of acquisition
  if (yearsHeld === 0) {
    initialAllowance = asset.cost * rates.initialRate;
    writtenDownValue -= initialAllowance;
  } else if (yearsHeld > 0) {
    // Initial allowance was claimed in acquisition year
    const initialClaimed = asset.cost * rates.initialRate;
    writtenDownValue = asset.cost - initialClaimed;
    
    // Annual allowances for subsequent years
    for (let year = 1; year <= yearsHeld; year++) {
      const yearlyAllowance = (asset.cost - initialClaimed) * rates.annualRate;
      if (writtenDownValue - yearlyAllowance > 0) {
        writtenDownValue -= yearlyAllowance;
      } else {
        writtenDownValue = 0;
        break;
      }
    }
    
    // Current year's annual allowance
    if (writtenDownValue > 0) {
      annualAllowance = Math.min(
        (asset.cost - initialClaimed) * rates.annualRate,
        writtenDownValue
      );
    }
  }
  
  const totalAllowance = initialAllowance + annualAllowance;
  
  return {
    assetId: asset.id,
    assetDescription: asset.description,
    assetCategory: asset.category,
    cost: asset.cost,
    initialAllowance,
    annualAllowance,
    totalAllowance,
    writtenDownValue: Math.max(0, writtenDownValue - annualAllowance),
  };
}

/**
 * Calculate total capital allowances for all assets
 */
export function calculateTotalCapitalAllowances(
  assets: CapitalAsset[],
  currentYear: number
): {
  breakdown: CapitalAllowanceResult[];
  totalAllowance: number;
} {
  const breakdown = assets.map((asset) => calculateAssetAllowance(asset, currentYear));
  const totalAllowance = breakdown.reduce((sum, r) => sum + r.totalAllowance, 0);
  
  return { breakdown, totalAllowance };
}

/**
 * Apply 2/3 restriction to capital allowances
 * Capital allowances are restricted to 2/3 of assessable profit
 */
export function applyCapitalAllowanceRestriction(
  totalAllowance: number,
  assessableProfit: number
): {
  allowedAmount: number;
  restrictedAmount: number;
  carryForward: number;
} {
  // If in loss, no restriction applies but no allowance can be claimed
  if (assessableProfit <= 0) {
    return {
      allowedAmount: 0,
      restrictedAmount: 0,
      carryForward: totalAllowance,
    };
  }
  
  const maxAllowable = assessableProfit * CAPITAL_ALLOWANCE_RESTRICTION_RATE;
  const allowedAmount = Math.min(totalAllowance, maxAllowable);
  const carryForward = Math.max(0, totalAllowance - allowedAmount);
  
  return {
    allowedAmount,
    restrictedAmount: totalAllowance - allowedAmount,
    carryForward,
  };
}

/**
 * Compute capital allowances with restriction - main entry point
 */
export function computeCapitalAllowances(
  assets: CapitalAsset[],
  assessableProfit: number,
  currentYear: number
): {
  assetBreakdown: CapitalAllowanceResult[];
  totalInitial: number;
  totalAnnual: number;
  totalAllowance: number;
  maxAllowableAmount: number;
  allowableAmount: number;
  carriedForward: number;
  isRestricted: boolean;
} {
  const { breakdown, totalAllowance } = calculateTotalCapitalAllowances(assets, currentYear);
  const restriction = applyCapitalAllowanceRestriction(totalAllowance, assessableProfit);
  
  const totalInitial = breakdown.reduce((sum, a) => sum + a.initialAllowance, 0);
  const totalAnnual = breakdown.reduce((sum, a) => sum + a.annualAllowance, 0);
  const maxAllowableAmount = assessableProfit > 0 
    ? assessableProfit * CAPITAL_ALLOWANCE_RESTRICTION_RATE 
    : 0;
  
  return {
    assetBreakdown: breakdown,
    totalInitial,
    totalAnnual,
    totalAllowance,
    maxAllowableAmount,
    allowableAmount: restriction.allowedAmount,
    carriedForward: restriction.carryForward,
    isRestricted: restriction.carryForward > 0,
  };
}
