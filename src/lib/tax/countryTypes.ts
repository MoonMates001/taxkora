/**
 * Country-Specific Tax Configuration Types
 * Used by the generic multi-country tax engine
 */

export interface PITBracket {
  min: number;
  max: number;
  rate: number;
  label: string;
}

export interface WHTRates {
  dividends: number;
  interest: number;
  royalties: number;
  /** Optional additional WHT categories */
  rent?: number;
  commissions?: number;
  professionalFees?: number;
  technicalFees?: number;
}

export interface TaxExemption {
  id: string;
  label: string;
  description: string;
}

export interface TaxRelief {
  id: string;
  label: string;
  description: string;
  /** If numeric, a fixed deduction amount; if percentage, applied to income */
  type: "fixed" | "percentage" | "credit";
  defaultValue?: number;
}

export interface CountryTaxConfig {
  /** ISO-style country name matching countries.ts */
  countryName: string;
  /** ISO 3166-1 alpha-2 code */
  countryCode: string;
  /** Currency code (ISO 4217) */
  currency: string;
  /** Currency symbol for display */
  currencySymbol: string;
  /** Locale for number formatting */
  locale: string;

  // ─── PIT ───
  pit: {
    type: "progressive" | "flat";
    brackets: PITBracket[];
    /** Additional surcharges as a flat rate on top of PIT */
    surcharge?: number;
    surchargeLabel?: string;
    /** Whether worldwide income is taxed */
    worldwideIncome: boolean;
    /** Brief description of PIT rules */
    description: string;
  };

  // ─── CIT ───
  cit: {
    /** Standard CIT rate (decimal, e.g. 0.21 for 21%) */
    standardRate: number;
    /** Effective rate if different from statutory */
    effectiveRate?: number;
    /** Small business / SME rate if available */
    smeRate?: number;
    /** Turnover threshold for SME rate */
    smeThreshold?: number;
    description: string;
  };

  // ─── WHT ───
  wht: WHTRates;

  // ─── Exemptions ───
  exemptions: TaxExemption[];

  // ─── Reliefs / Credits ───
  reliefs: TaxRelief[];

  /** Tax authority name */
  taxAuthority: string;
  /** Fiscal year description */
  fiscalYear: string;
}

/**
 * Result from a generic country PIT computation
 */
export interface CountryPITResult {
  country: string;
  currency: string;
  grossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  taxByBracket: Array<{
    bracket: string;
    rate: number;
    income: number;
    tax: number;
  }>;
  baseTax: number;
  surcharge: number;
  totalTax: number;
  effectiveRate: number;
  isExempt: boolean;
}

/**
 * Result from a generic country CIT computation
 */
export interface CountryCITResult {
  country: string;
  currency: string;
  grossRevenue: number;
  allowableExpenses: number;
  taxableProfit: number;
  citRate: number;
  citPayable: number;
  effectiveRate: number;
  isSME: boolean;
}
