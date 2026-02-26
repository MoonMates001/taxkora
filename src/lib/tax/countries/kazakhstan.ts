import { CountryTaxConfig } from "../countryTypes";

export const kazakhstanConfig: CountryTaxConfig = {
  countryName: "Kazakhstan",
  countryCode: "KZ",
  currency: "KZT",
  currencySymbol: "₸",
  locale: "kk-KZ",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: Infinity, rate: 0.10, label: "Flat 10%" },
    ],
    worldwideIncome: true,
    description: "Flat 10% income tax rate.",
  },
  cit: { standardRate: 0.20, description: "20% corporate income tax rate." },
  wht: { dividends: 0.15, interest: 0.15, royalties: 0.15 },
  exemptions: [
    { id: "sez", label: "Special Economic Zones", description: "Tax exemptions for entities in special economic zones." },
  ],
  reliefs: [
    { id: "investment_credit", label: "Investment Credits", description: "Tax preferences for priority investment projects.", type: "credit", defaultValue: 0 },
  ],
  taxAuthority: "State Revenue Committee",
  fiscalYear: "January 1 – December 31",
};
