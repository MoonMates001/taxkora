/**
 * Nigeria Tax Act 2025/2026 - VAT Computation Module
 * Value Added Tax (VAT) at 7.5%
 */

import { VAT_RATE } from "./constants";

// VAT-exempt goods and services
export const VAT_EXEMPT_ITEMS = [
  "medical_pharmaceutical",
  "basic_food_items",
  "books_educational",
  "baby_products",
  "agricultural_inputs",
  "exports",
  "diplomatic_purchases",
  "humanitarian_goods",
] as const;

export type VATExemptCategory = typeof VAT_EXEMPT_ITEMS[number];

// VAT-able services categories
export const VATABLE_SERVICES = [
  "professional_services",
  "telecommunications",
  "banking_financial",
  "insurance",
  "entertainment",
  "hospitality",
  "construction",
  "transportation",
  "advertising",
  "consulting",
  "it_services",
  "other_services",
] as const;

export type VATableServiceCategory = typeof VATABLE_SERVICES[number];

// VAT transaction types
export type VATTransactionType = "output" | "input";

export interface VATTransaction {
  id: string;
  description: string;
  amount: number;
  vatAmount: number;
  transactionType: VATTransactionType;
  category: string;
  isExempt: boolean;
  exemptReason?: string;
  date: string;
}

export interface VATComputationInput {
  year: number;
  month?: number; // If not provided, compute annual
  outputTransactions: VATTransaction[];
  inputTransactions: VATTransaction[];
}

export interface VATComputationResult {
  // Period
  year: number;
  month?: number;
  period: string;
  
  // Output VAT (VAT collected from sales)
  totalOutputSales: number;
  exemptOutputSales: number;
  taxableOutputSales: number;
  outputVAT: number;
  
  // Input VAT (VAT paid on purchases)
  totalInputPurchases: number;
  exemptInputPurchases: number;
  taxableInputPurchases: number;
  inputVAT: number;
  
  // Net VAT
  netVATPayable: number;
  isRefundDue: boolean;
  
  // Breakdown
  outputBreakdown: { category: string; amount: number; vat: number }[];
  inputBreakdown: { category: string; amount: number; vat: number }[];
  
  // Compliance
  vatRate: number;
  filingDeadline: string;
  paymentDeadline: string;
}

/**
 * Calculate VAT on a transaction amount
 */
export function calculateVAT(amount: number, isVATInclusive: boolean = false): {
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
} {
  if (isVATInclusive) {
    // VAT is included in the amount - extract it
    const netAmount = amount / (1 + VAT_RATE);
    const vatAmount = amount - netAmount;
    return {
      netAmount: Math.round(netAmount * 100) / 100,
      vatAmount: Math.round(vatAmount * 100) / 100,
      grossAmount: amount,
    };
  } else {
    // VAT is added on top
    const vatAmount = amount * VAT_RATE;
    return {
      netAmount: amount,
      vatAmount: Math.round(vatAmount * 100) / 100,
      grossAmount: Math.round((amount + vatAmount) * 100) / 100,
    };
  }
}

/**
 * Check if an item is VAT-exempt
 */
export function isVATExempt(category: string): boolean {
  return VAT_EXEMPT_ITEMS.includes(category as VATExemptCategory);
}

/**
 * Get VAT filing deadline for a given month
 * VAT returns are due on or before the 21st day of the following month
 */
export function getVATFilingDeadline(year: number, month: number): Date {
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return new Date(nextYear, nextMonth - 1, 21);
}

/**
 * Compute VAT for a period
 */
export function computeVAT(input: VATComputationInput): VATComputationResult {
  const { year, month, outputTransactions, inputTransactions } = input;
  
  // Calculate output VAT (collected from sales)
  let totalOutputSales = 0;
  let exemptOutputSales = 0;
  let outputVAT = 0;
  const outputByCategory: Map<string, { amount: number; vat: number }> = new Map();
  
  for (const tx of outputTransactions) {
    totalOutputSales += tx.amount;
    
    if (tx.isExempt) {
      exemptOutputSales += tx.amount;
    } else {
      outputVAT += tx.vatAmount;
      const existing = outputByCategory.get(tx.category) || { amount: 0, vat: 0 };
      outputByCategory.set(tx.category, {
        amount: existing.amount + tx.amount,
        vat: existing.vat + tx.vatAmount,
      });
    }
  }
  
  // Calculate input VAT (paid on purchases - recoverable)
  let totalInputPurchases = 0;
  let exemptInputPurchases = 0;
  let inputVAT = 0;
  const inputByCategory: Map<string, { amount: number; vat: number }> = new Map();
  
  for (const tx of inputTransactions) {
    totalInputPurchases += tx.amount;
    
    if (tx.isExempt) {
      exemptInputPurchases += tx.amount;
    } else {
      inputVAT += tx.vatAmount;
      const existing = inputByCategory.get(tx.category) || { amount: 0, vat: 0 };
      inputByCategory.set(tx.category, {
        amount: existing.amount + tx.amount,
        vat: existing.vat + tx.vatAmount,
      });
    }
  }
  
  // Net VAT payable
  const netVATPayable = outputVAT - inputVAT;
  const isRefundDue = netVATPayable < 0;
  
  // Period label
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const period = month 
    ? `${monthNames[month - 1]} ${year}`
    : `Annual ${year}`;
  
  // Filing/payment deadlines
  const deadlineDate = month 
    ? getVATFilingDeadline(year, month)
    : new Date(year + 1, 0, 31); // Annual: Jan 31 of next year
  
  return {
    year,
    month,
    period,
    totalOutputSales,
    exemptOutputSales,
    taxableOutputSales: totalOutputSales - exemptOutputSales,
    outputVAT,
    totalInputPurchases,
    exemptInputPurchases,
    taxableInputPurchases: totalInputPurchases - exemptInputPurchases,
    inputVAT,
    netVATPayable: Math.abs(netVATPayable),
    isRefundDue,
    outputBreakdown: Array.from(outputByCategory.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      vat: data.vat,
    })),
    inputBreakdown: Array.from(inputByCategory.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      vat: data.vat,
    })),
    vatRate: VAT_RATE,
    filingDeadline: deadlineDate.toISOString().split("T")[0],
    paymentDeadline: deadlineDate.toISOString().split("T")[0],
  };
}
