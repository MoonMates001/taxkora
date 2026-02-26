import { CountryTaxConfig } from "../countryTypes";

export const netherlandsConfig: CountryTaxConfig = {
  countryName: "Netherlands",
  countryCode: "NL",
  currency: "EUR",
  currencySymbol: "€",
  locale: "nl-NL",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 75518, rate: 0.3693, label: "Box 1: €0 – €75,518 (36.93%)" },
      { min: 75518, max: Infinity, rate: 0.495, label: "Box 1: Over €75,518 (49.5%)" },
    ],
    worldwideIncome: true,
    description: "Box system: Box 1 employment 9.32–49.5%, Box 2 substantial interest 26.9%, Box 3 savings.",
  },
  cit: { standardRate: 0.258, smeRate: 0.19, smeThreshold: 200000, description: "19% up to €200K; 25.8% above." },
  wht: { dividends: 0.15, interest: 0, royalties: 0.15 },
  exemptions: [
    { id: "pension_partial", label: "Partial Pension Exemption", description: "Pension contributions are deductible from Box 1 income." },
  ],
  reliefs: [
    { id: "innovation_box", label: "Innovation Box Regime", description: "Effective 9% rate on qualifying IP income.", type: "percentage", defaultValue: 0.09 },
  ],
  taxAuthority: "Belastingdienst",
  fiscalYear: "January 1 – December 31",
};
