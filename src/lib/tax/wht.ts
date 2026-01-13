/**
 * Nigeria Tax Act 2025/2026 - WHT Computation Module
 * Withholding Tax (WHT) - Advance payment of income tax
 */

import { WHT_RATES } from "./constants";

// WHT payment types
export const WHT_PAYMENT_TYPES = [
  "dividends",
  "interest",
  "royalties",
  "rent",
  "commissions",
  "professionalFees",
  "constructionContracts",
  "managementFees",
  "technicalFees",
  "consultingFees",
  "directorsFees",
  "other",
] as const;

export type WHTPaymentType = typeof WHT_PAYMENT_TYPES[number];

// WHT rates by payment type and recipient type
export interface WHTRateConfig {
  type: WHTPaymentType;
  label: string;
  corporateRate: number;
  individualRate: number;
  nonResidentRate: number;
  description: string;
}

export const WHT_RATE_CONFIG: WHTRateConfig[] = [
  {
    type: "dividends",
    label: "Dividends",
    corporateRate: 0.10,
    individualRate: 0.10,
    nonResidentRate: 0.10,
    description: "Withholding on dividend payments",
  },
  {
    type: "interest",
    label: "Interest",
    corporateRate: 0.10,
    individualRate: 0.10,
    nonResidentRate: 0.10,
    description: "Withholding on interest payments",
  },
  {
    type: "royalties",
    label: "Royalties",
    corporateRate: 0.10,
    individualRate: 0.10,
    nonResidentRate: 0.10,
    description: "Withholding on royalty payments",
  },
  {
    type: "rent",
    label: "Rent",
    corporateRate: 0.10,
    individualRate: 0.10,
    nonResidentRate: 0.10,
    description: "Withholding on rental payments",
  },
  {
    type: "commissions",
    label: "Commissions",
    corporateRate: 0.05,
    individualRate: 0.05,
    nonResidentRate: 0.10,
    description: "Withholding on commission payments",
  },
  {
    type: "professionalFees",
    label: "Professional Fees",
    corporateRate: 0.10,
    individualRate: 0.05,
    nonResidentRate: 0.10,
    description: "Withholding on professional service fees",
  },
  {
    type: "constructionContracts",
    label: "Construction Contracts",
    corporateRate: 0.05,
    individualRate: 0.05,
    nonResidentRate: 0.05,
    description: "Withholding on construction contracts",
  },
  {
    type: "managementFees",
    label: "Management Fees",
    corporateRate: 0.10,
    individualRate: 0.05,
    nonResidentRate: 0.10,
    description: "Withholding on management fees",
  },
  {
    type: "technicalFees",
    label: "Technical Fees",
    corporateRate: 0.10,
    individualRate: 0.05,
    nonResidentRate: 0.10,
    description: "Withholding on technical service fees",
  },
  {
    type: "consultingFees",
    label: "Consulting Fees",
    corporateRate: 0.10,
    individualRate: 0.05,
    nonResidentRate: 0.10,
    description: "Withholding on consulting fees",
  },
  {
    type: "directorsFees",
    label: "Directors' Fees",
    corporateRate: 0.10,
    individualRate: 0.10,
    nonResidentRate: 0.10,
    description: "Withholding on directors' fees",
  },
  {
    type: "other",
    label: "Other Payments",
    corporateRate: 0.10,
    individualRate: 0.05,
    nonResidentRate: 0.10,
    description: "Withholding on other qualifying payments",
  },
];

// Recipient types
export type RecipientType = "corporate" | "individual" | "non_resident";

// WHT transaction
export interface WHTTransaction {
  id: string;
  paymentType: WHTPaymentType;
  recipientType: RecipientType;
  recipientName: string;
  recipientTIN?: string;
  grossAmount: number;
  whtRate: number;
  whtAmount: number;
  netAmount: number;
  paymentDate: string;
  description?: string;
}

export interface WHTComputationInput {
  year: number;
  month?: number;
  transactions: WHTTransaction[];
}

export interface WHTComputationResult {
  // Period
  year: number;
  month?: number;
  period: string;
  
  // Summary
  totalGrossPayments: number;
  totalWHTDeducted: number;
  totalNetPayments: number;
  
  // By payment type
  byPaymentType: {
    type: WHTPaymentType;
    label: string;
    grossAmount: number;
    whtAmount: number;
    transactionCount: number;
  }[];
  
  // By recipient type
  byRecipientType: {
    type: RecipientType;
    label: string;
    grossAmount: number;
    whtAmount: number;
    transactionCount: number;
  }[];
  
  // Transactions
  transactions: WHTTransaction[];
  
  // Compliance
  remittanceDeadline: string;
  filingDeadline: string;
}

/**
 * Get WHT rate for a given payment and recipient type
 */
export function getWHTRate(paymentType: WHTPaymentType, recipientType: RecipientType): number {
  const config = WHT_RATE_CONFIG.find((c) => c.type === paymentType);
  if (!config) return 0.10; // Default rate
  
  switch (recipientType) {
    case "corporate":
      return config.corporateRate;
    case "individual":
      return config.individualRate;
    case "non_resident":
      return config.nonResidentRate;
    default:
      return config.corporateRate;
  }
}

/**
 * Calculate WHT on a payment
 */
export function calculateWHT(
  grossAmount: number,
  paymentType: WHTPaymentType,
  recipientType: RecipientType
): {
  grossAmount: number;
  whtRate: number;
  whtAmount: number;
  netAmount: number;
} {
  const whtRate = getWHTRate(paymentType, recipientType);
  const whtAmount = Math.round(grossAmount * whtRate * 100) / 100;
  const netAmount = Math.round((grossAmount - whtAmount) * 100) / 100;
  
  return {
    grossAmount,
    whtRate,
    whtAmount,
    netAmount,
  };
}

/**
 * Create a WHT transaction
 */
export function createWHTTransaction(
  paymentType: WHTPaymentType,
  recipientType: RecipientType,
  recipientName: string,
  grossAmount: number,
  paymentDate: string,
  description?: string,
  recipientTIN?: string
): WHTTransaction {
  const { whtRate, whtAmount, netAmount } = calculateWHT(grossAmount, paymentType, recipientType);
  
  return {
    id: crypto.randomUUID(),
    paymentType,
    recipientType,
    recipientName,
    recipientTIN,
    grossAmount,
    whtRate,
    whtAmount,
    netAmount,
    paymentDate,
    description,
  };
}

/**
 * Get WHT remittance deadline
 * WHT must be remitted within 21 days of deduction
 */
export function getWHTRemittanceDeadline(deductionDate: Date): Date {
  const deadline = new Date(deductionDate);
  deadline.setDate(deadline.getDate() + 21);
  return deadline;
}

/**
 * Compute WHT summary for a period
 */
export function computeWHT(input: WHTComputationInput): WHTComputationResult {
  const { year, month, transactions } = input;
  
  // Summary totals
  let totalGrossPayments = 0;
  let totalWHTDeducted = 0;
  
  // Group by payment type
  const byPaymentTypeMap: Map<WHTPaymentType, { gross: number; wht: number; count: number }> = new Map();
  
  // Group by recipient type
  const byRecipientTypeMap: Map<RecipientType, { gross: number; wht: number; count: number }> = new Map();
  
  for (const tx of transactions) {
    totalGrossPayments += tx.grossAmount;
    totalWHTDeducted += tx.whtAmount;
    
    // By payment type
    const paymentData = byPaymentTypeMap.get(tx.paymentType) || { gross: 0, wht: 0, count: 0 };
    byPaymentTypeMap.set(tx.paymentType, {
      gross: paymentData.gross + tx.grossAmount,
      wht: paymentData.wht + tx.whtAmount,
      count: paymentData.count + 1,
    });
    
    // By recipient type
    const recipientData = byRecipientTypeMap.get(tx.recipientType) || { gross: 0, wht: 0, count: 0 };
    byRecipientTypeMap.set(tx.recipientType, {
      gross: recipientData.gross + tx.grossAmount,
      wht: recipientData.wht + tx.whtAmount,
      count: recipientData.count + 1,
    });
  }
  
  const totalNetPayments = totalGrossPayments - totalWHTDeducted;
  
  // Period label
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const period = month 
    ? `${monthNames[month - 1]} ${year}`
    : `Annual ${year}`;
  
  // Remittance deadline (21st of following month for monthly)
  const deadlineMonth = month ? (month === 12 ? 1 : month + 1) : 1;
  const deadlineYear = month ? (month === 12 ? year + 1 : year) : year + 1;
  const remittanceDate = new Date(deadlineYear, deadlineMonth - 1, 21);
  
  // Map recipient type labels
  const recipientLabels: Record<RecipientType, string> = {
    corporate: "Corporate Entities",
    individual: "Individuals",
    non_resident: "Non-Residents",
  };
  
  return {
    year,
    month,
    period,
    totalGrossPayments,
    totalWHTDeducted,
    totalNetPayments,
    byPaymentType: Array.from(byPaymentTypeMap.entries()).map(([type, data]) => {
      const config = WHT_RATE_CONFIG.find((c) => c.type === type);
      return {
        type,
        label: config?.label || type,
        grossAmount: data.gross,
        whtAmount: data.wht,
        transactionCount: data.count,
      };
    }),
    byRecipientType: Array.from(byRecipientTypeMap.entries()).map(([type, data]) => ({
      type,
      label: recipientLabels[type],
      grossAmount: data.gross,
      whtAmount: data.wht,
      transactionCount: data.count,
    })),
    transactions,
    remittanceDeadline: remittanceDate.toISOString().split("T")[0],
    filingDeadline: remittanceDate.toISOString().split("T")[0],
  };
}

/**
 * Get WHT credit summary (for offsetting against income tax)
 */
export function getWHTCreditSummary(transactions: WHTTransaction[]): {
  totalCredit: number;
  byType: { type: WHTPaymentType; amount: number }[];
} {
  const byTypeMap: Map<WHTPaymentType, number> = new Map();
  let totalCredit = 0;
  
  for (const tx of transactions) {
    totalCredit += tx.whtAmount;
    const existing = byTypeMap.get(tx.paymentType) || 0;
    byTypeMap.set(tx.paymentType, existing + tx.whtAmount);
  }
  
  return {
    totalCredit,
    byType: Array.from(byTypeMap.entries()).map(([type, amount]) => ({ type, amount })),
  };
}
