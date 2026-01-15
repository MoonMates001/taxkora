/**
 * Nigeria Tax Act 2025 - Tax Types and Interfaces
 */

// Business entity types
export type BusinessEntityType = "sole_proprietorship" | "partnership" | "limited_company";
export type TaxAuthority = "SIRS" | "NRS"; // State IRS vs Nigeria Revenue Service

// Tax computation type
export type TaxationType = "PIT" | "CIT"; // Personal Income Tax vs Companies Income Tax

// CIT Turnover bands
export interface CITBand {
  minTurnover: number;
  maxTurnover: number;
  rate: number;
  category: "small" | "medium" | "upper-medium" | "large";
  label: string;
}

// Capital asset for capital allowance computation
export interface CapitalAsset {
  id: string;
  description: string;
  category: CapitalAssetCategory;
  cost: number;
  acquisitionDate: string;
  initialAllowanceRate: number;
  annualAllowanceRate: number;
  yearAcquired: number;
  writtenDownValue: number;
  totalAllowanceClaimed: number;
}

export type CapitalAssetCategory =
  | "plant_machinery"
  | "motor_vehicles"
  | "furniture_fittings"
  | "buildings"
  | "computers_equipment"
  | "agricultural_equipment"
  | "other";

// Capital allowance rates by category
export interface CapitalAllowanceRates {
  category: CapitalAssetCategory;
  label: string;
  initialRate: number;
  annualRate: number;
}

// Business expenses structure
export interface BusinessExpenses {
  costOfGoodsSold: number;
  rentPremises: number;
  utilities: number;
  transport: number;
  staffSalaries: number;
  repairsMaintenance: number;
  professionalFees: number;
  internetSoftware: number;
  marketingAdvertising: number;
  otherAllowable: number;
  // Disallowed (tracked but not deducted)
  personalExpenses: number;
  capitalExpenditure: number;
  finesPenalties: number;
  nonBusinessDonations: number;
}

// Business income structure
export interface BusinessIncome {
  salesRevenue: number;
  serviceFees: number;
  commissions: number;
  digitalIncome: number;
  exchangeGains: number;
  otherReceipts: number;
}

// PIT computation for sole proprietors
export interface PITBusinessResult {
  // Entity info
  entityType: "sole_proprietorship" | "partnership";
  taxAuthority: "SIRS";
  taxationType: "PIT";
  
  // Income
  grossBusinessIncome: number;
  incomeBreakdown: BusinessIncome;
  
  // Expenses
  allowableExpenses: number;
  disallowedExpenses: number;
  expenseBreakdown: BusinessExpenses;
  
  // Capital Allowances
  capitalAllowances: number;
  capitalAllowanceRestriction: number; // 2/3 restriction
  capitalAllowanceBreakdown: CapitalAllowanceResult[];
  
  // Adjusted Profit
  adjustedProfit: number;
  
  // Personal Reliefs
  personalReliefs: number;
  reliefBreakdown: {
    pension: number;
    nhis: number;
    nhf: number;
    lifeInsurance: number;
    housingLoanInterest: number;
    rentRelief: number;
  };
  
  // Taxable Income
  taxableIncome: number;
  
  // Tax Calculation
  isExempt: boolean;
  exemptionReason: string | null;
  taxByBracket: { bracket: string; income: number; rate: number; tax: number }[];
  totalTax: number;
  effectiveRate: number;
}

// CIT computation for companies
export interface CITResult {
  // Entity info
  entityType: "limited_company";
  taxAuthority: "NRS";
  taxationType: "CIT";
  
  // Turnover classification
  annualTurnover: number;
  turnoverCategory: "small" | "medium" | "upper-medium" | "large";
  citRate: number;
  
  // Accounting profit
  grossRevenue: number;
  costOfSales: number;
  operatingExpenses: number;
  accountingProfit: number;
  
  // Tax adjustments
  addBackDepreciation: number;
  addBackNonDeductible: number;
  addBackProvisions: number;
  addBackUnapprovedDonations: number;
  deductCapitalAllowances: number;
  deductExemptIncome: number;
  
  // Capital Allowances
  capitalAllowances: number;
  capitalAllowanceRestriction: number;
  capitalAllowanceCarryForward: number;
  capitalAllowanceBreakdown: CapitalAllowanceResult[];
  
  // Taxable Profit
  assessableProfit: number;
  taxableProfit: number;
  
  // Tax Calculation
  isExempt: boolean;
  exemptionReason: string | null;
  citPayable: number;
  effectiveRate: number;
  
  // Filing requirement
  filingRequired: boolean;
}

// Capital allowance computation result
export interface CapitalAllowanceResult {
  assetId: string;
  assetDescription: string;
  assetCategory: CapitalAssetCategory;
  cost: number;
  initialAllowance: number;
  annualAllowance: number;
  totalAllowance: number;
  writtenDownValue: number;
}

// Combined business tax result
export type BusinessTaxResult = PITBusinessResult | CITResult;

// Input for business tax computation
export interface BusinessTaxInput {
  entityType: BusinessEntityType;
  year: number;
  
  // For CIT
  annualTurnover?: number;
  
  // Income
  businessIncome: BusinessIncome;
  
  // Expenses
  businessExpenses: BusinessExpenses;
  
  // Capital Assets
  capitalAssets: CapitalAsset[];
  
  // For PIT (personal reliefs)
  personalReliefs?: {
    pension: number;
    nhis: number;
    nhf: number;
    lifeInsurance: number;
    housingLoanInterest: number;
    annualRentPaid: number;
  };
  
  // CIT adjustments
  citAdjustments?: {
    depreciation: number;
    nonDeductibleExpenses: number;
    provisions: number;
    unapprovedDonations: number;
    exemptIncome: number;
  };
}
