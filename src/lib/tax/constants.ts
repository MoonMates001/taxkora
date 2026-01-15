/**
 * Nigeria Tax Act 2025 - Tax Constants
 */

import { CITBand, CapitalAllowanceRates } from "./types";

// ============================================
// PERSONAL INCOME TAX (PIT) CONSTANTS
// ============================================

// Tax-exempt threshold (₦800,000)
export const PIT_EXEMPT_THRESHOLD = 800000;

// Rent relief: 20% of annual rent, capped at ₦500,000
export const RENT_RELIEF_RATE = 0.20;
export const RENT_RELIEF_CAP = 500000;

// Employment compensation exemption cap: ₦50 million
export const EMPLOYMENT_COMPENSATION_EXEMPT_CAP = 50000000;

// Progressive PIT brackets (Nigeria Tax Act 2025)
export const PIT_BRACKETS = [
  { min: 0, max: 800000, rate: 0, label: "First ₦800,000" },
  { min: 800000, max: 3000000, rate: 0.15, label: "₦800,001 — ₦3,000,000" },
  { min: 3000000, max: 12000000, rate: 0.18, label: "₦3,000,001 — ₦12,000,000" },
  { min: 12000000, max: 25000000, rate: 0.21, label: "₦12,000,001 — ₦25,000,000" },
  { min: 25000000, max: 50000000, rate: 0.23, label: "₦25,000,001 — ₦50,000,000" },
  { min: 50000000, max: Infinity, rate: 0.25, label: "Above ₦50,000,000" },
];

// ============================================
// COMPANIES INCOME TAX (CIT) CONSTANTS
// ============================================

// CIT turnover bands and rates
export const CIT_BANDS: CITBand[] = [
  {
    minTurnover: 0,
    maxTurnover: 25000000,
    rate: 0,
    category: "small",
    label: "Small Company (≤₦25M)",
  },
  {
    minTurnover: 25000000,
    maxTurnover: 100000000,
    rate: 0.20,
    category: "medium",
    label: "Medium Company (₦25M — ₦100M)",
  },
  {
    minTurnover: 100000000,
    maxTurnover: 250000000,
    rate: 0.30,
    category: "upper-medium",
    label: "Upper-Medium (₦100M — ₦250M)",
  },
  {
    minTurnover: 250000000,
    maxTurnover: Infinity,
    rate: 0.30,
    category: "large",
    label: "Large Company (>₦250M)",
  },
];

// Small company turnover threshold
export const SMALL_COMPANY_THRESHOLD = 25000000;
export const MEDIUM_COMPANY_THRESHOLD = 100000000;
export const UPPER_MEDIUM_THRESHOLD = 250000000;

// ============================================
// CAPITAL ALLOWANCE CONSTANTS
// ============================================

// Capital allowance restriction: 2/3 of assessable profit
export const CAPITAL_ALLOWANCE_RESTRICTION_RATE = 2 / 3;

// Capital allowance rates by asset category
export const CAPITAL_ALLOWANCE_RATES: CapitalAllowanceRates[] = [
  {
    category: "plant_machinery",
    label: "Plant & Machinery",
    initialRate: 0.50,
    annualRate: 0.25,
  },
  {
    category: "motor_vehicles",
    label: "Motor Vehicles",
    initialRate: 0.50,
    annualRate: 0.25,
  },
  {
    category: "furniture_fittings",
    label: "Furniture & Fittings",
    initialRate: 0.25,
    annualRate: 0.20,
  },
  {
    category: "buildings",
    label: "Buildings",
    initialRate: 0.15,
    annualRate: 0.10,
  },
  {
    category: "computers_equipment",
    label: "Computers & IT Equipment",
    initialRate: 0.50,
    annualRate: 0.25,
  },
  {
    category: "agricultural_equipment",
    label: "Agricultural Equipment",
    initialRate: 0.95,
    annualRate: 0.00,
  },
  {
    category: "other",
    label: "Other Assets",
    initialRate: 0.25,
    annualRate: 0.20,
  },
];

// ============================================
// VAT & WHT CONSTANTS (for reference)
// ============================================

export const VAT_RATE = 0.075; // 7.5%
export const WHT_RATES = {
  dividends: 0.10,
  interest: 0.10,
  royalties: 0.10,
  rent: 0.10,
  commissions: 0.05,
  professionalFees: 0.10,
  constructionContracts: 0.05,
};
