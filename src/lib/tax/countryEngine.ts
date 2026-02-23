/**
 * Generic Country Tax Computation Engine
 * Computes PIT and CIT using country-specific configurations
 */

import { CountryTaxConfig, CountryPITResult, CountryCITResult } from "./countryTypes";

/**
 * Compute Personal Income Tax for any country using its config
 */
export function computeCountryPIT(
  config: CountryTaxConfig,
  grossIncome: number,
  deductions: number = 0
): CountryPITResult {
  const taxableIncome = Math.max(0, grossIncome - deductions);

  if (taxableIncome === 0) {
    return {
      country: config.countryName,
      currency: config.currency,
      grossIncome,
      totalDeductions: deductions,
      taxableIncome: 0,
      taxByBracket: [],
      baseTax: 0,
      surcharge: 0,
      totalTax: 0,
      effectiveRate: 0,
      isExempt: true,
    };
  }

  const taxByBracket: CountryPITResult["taxByBracket"] = [];
  let remainingIncome = taxableIncome;
  let baseTax = 0;

  for (const bracket of config.pit.brackets) {
    if (remainingIncome <= 0) break;

    const bracketWidth = bracket.max === Infinity
      ? remainingIncome
      : Math.min(remainingIncome, bracket.max - bracket.min);

    const incomeInBracket = Math.max(0, bracketWidth);
    const taxInBracket = incomeInBracket * bracket.rate;

    if (incomeInBracket > 0) {
      taxByBracket.push({
        bracket: bracket.label,
        rate: bracket.rate * 100,
        income: incomeInBracket,
        tax: taxInBracket,
      });
    }

    baseTax += taxInBracket;
    remainingIncome -= incomeInBracket;
  }

  // Apply surcharge (if applicable)
  const surcharge = config.pit.surcharge
    ? baseTax * config.pit.surcharge
    : 0;

  const totalTax = baseTax + surcharge;
  const effectiveRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0;

  return {
    country: config.countryName,
    currency: config.currency,
    grossIncome,
    totalDeductions: deductions,
    taxableIncome,
    taxByBracket,
    baseTax,
    surcharge,
    totalTax,
    effectiveRate,
    isExempt: totalTax === 0,
  };
}

/**
 * Compute Companies Income Tax for any country using its config
 */
export function computeCountryCIT(
  config: CountryTaxConfig,
  grossRevenue: number,
  allowableExpenses: number = 0
): CountryCITResult {
  const taxableProfit = Math.max(0, grossRevenue - allowableExpenses);

  // Determine if SME rate applies
  const isSME = config.cit.smeRate !== undefined &&
    config.cit.smeThreshold !== undefined &&
    taxableProfit <= config.cit.smeThreshold;

  const citRate = isSME ? (config.cit.smeRate ?? config.cit.standardRate) : config.cit.standardRate;
  const citPayable = taxableProfit * citRate;
  const effectiveRate = grossRevenue > 0 ? (citPayable / grossRevenue) * 100 : 0;

  return {
    country: config.countryName,
    currency: config.currency,
    grossRevenue,
    allowableExpenses,
    taxableProfit,
    citRate: citRate * 100,
    citPayable,
    effectiveRate,
    isSME,
  };
}

/**
 * Format currency for a given country config
 */
export function formatCountryCurrency(amount: number, config: CountryTaxConfig): string {
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
