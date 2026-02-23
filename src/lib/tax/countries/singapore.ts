import { CountryTaxConfig } from "../countryTypes";

export const singaporeConfig: CountryTaxConfig = {
  countryName: "Singapore",
  countryCode: "SG",
  currency: "SGD",
  currencySymbol: "S$",
  locale: "en-SG",

  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 20000, rate: 0, label: "Up to S$20,000" },
      { min: 20000, max: 30000, rate: 0.02, label: "S$20,001 – S$30,000" },
      { min: 30000, max: 40000, rate: 0.035, label: "S$30,001 – S$40,000" },
      { min: 40000, max: 80000, rate: 0.07, label: "S$40,001 – S$80,000" },
      { min: 80000, max: 120000, rate: 0.115, label: "S$80,001 – S$120,000" },
      { min: 120000, max: 160000, rate: 0.15, label: "S$120,001 – S$160,000" },
      { min: 160000, max: 200000, rate: 0.18, label: "S$160,001 – S$200,000" },
      { min: 200000, max: 240000, rate: 0.19, label: "S$200,001 – S$240,000" },
      { min: 240000, max: 280000, rate: 0.195, label: "S$240,001 – S$280,000" },
      { min: 280000, max: 320000, rate: 0.20, label: "S$280,001 – S$320,000" },
      { min: 320000, max: 500000, rate: 0.22, label: "S$320,001 – S$500,000" },
      { min: 500000, max: 1000000, rate: 0.23, label: "S$500,001 – S$1,000,000" },
      { min: 1000000, max: Infinity, rate: 0.24, label: "Over S$1,000,000" },
    ],
    worldwideIncome: false,
    description: "Progressive 0–24%. Territorial system — foreign-sourced income not taxed unless remitted.",
  },

  cit: {
    standardRate: 0.17,
    description: "17% flat rate. Partial tax exemption: 75% on first S$10,000, 50% on next S$190,000.",
  },

  wht: {
    dividends: 0,
    interest: 0.15,
    royalties: 0.10,
    technicalFees: 0.15,
  },

  exemptions: [
    { id: "foreign_income", label: "Foreign-Sourced Income", description: "Foreign income not remitted to Singapore is generally not taxed." },
    { id: "capital_gains", label: "Capital Gains", description: "No capital gains tax in Singapore." },
  ],

  reliefs: [
    { id: "earned_income", label: "Earned Income Relief", description: "Up to S$1,000 for individuals below 55.", type: "fixed", defaultValue: 1000 },
    { id: "cpf", label: "CPF Contributions", description: "Mandatory CPF contributions are tax-deductible up to cap.", type: "fixed" },
    { id: "partial_exemption", label: "Partial Tax Exemption (CIT)", description: "75% exemption on first S$10,000 + 50% on next S$190,000 of chargeable income.", type: "fixed" },
  ],

  taxAuthority: "Inland Revenue Authority of Singapore (IRAS)",
  fiscalYear: "Company's chosen financial year-end",
};
