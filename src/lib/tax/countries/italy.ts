import { CountryTaxConfig } from "../countryTypes";

export const italyConfig: CountryTaxConfig = {
  countryName: "Italy",
  countryCode: "IT",
  currency: "EUR",
  currencySymbol: "€",
  locale: "it-IT",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 28000, rate: 0.23, label: "€0 – €28,000" },
      { min: 28000, max: 50000, rate: 0.35, label: "€28,001 – €50,000" },
      { min: 50000, max: Infinity, rate: 0.43, label: "Over €50,000" },
    ],
    worldwideIncome: true,
    description: "Progressive 23–43% IRPEF on worldwide income.",
  },
  cit: { standardRate: 0.24, description: "24% IRES plus ~3.9% IRAP; effective ~27.9%." },
  wht: { dividends: 0.26, interest: 0.26, royalties: 0.30 },
  exemptions: [
    { id: "pension_partial", label: "Certain Pension Exemptions", description: "Some pension income receives favorable treatment." },
  ],
  reliefs: [
    { id: "dependent_deduction", label: "Dependent Deductions", description: "Tax credits for dependent family members.", type: "credit", defaultValue: 800 },
  ],
  taxAuthority: "Agenzia delle Entrate",
  fiscalYear: "January 1 – December 31",
};
