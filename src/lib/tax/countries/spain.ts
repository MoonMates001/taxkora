import { CountryTaxConfig } from "../countryTypes";

export const spainConfig: CountryTaxConfig = {
  countryName: "Spain",
  countryCode: "ES",
  currency: "EUR",
  currencySymbol: "€",
  locale: "es-ES",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 12450, rate: 0.19, label: "€0 – €12,450" },
      { min: 12450, max: 20200, rate: 0.24, label: "€12,451 – €20,200" },
      { min: 20200, max: 35200, rate: 0.30, label: "€20,201 – €35,200" },
      { min: 35200, max: 60000, rate: 0.37, label: "€35,201 – €60,000" },
      { min: 60000, max: 300000, rate: 0.45, label: "€60,001 – €300,000" },
      { min: 300000, max: Infinity, rate: 0.47, label: "Over €300,000" },
    ],
    worldwideIncome: true,
    description: "Progressive 19–47% on worldwide income.",
  },
  cit: { standardRate: 0.25, description: "25% standard corporate tax rate." },
  wht: { dividends: 0.19, interest: 0.19, royalties: 0.24 },
  exemptions: [
    { id: "primary_home", label: "Primary Home Gain Exemption", description: "Partial exemption on primary residence capital gains if reinvested." },
  ],
  reliefs: [
    { id: "family", label: "Family Deductions", description: "Tax deductions for family members and dependents.", type: "fixed", defaultValue: 5550 },
  ],
  taxAuthority: "Agencia Tributaria",
  fiscalYear: "January 1 – December 31",
};
