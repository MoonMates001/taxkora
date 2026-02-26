import { CountryTaxConfig } from "../countryTypes";

export const belgiumConfig: CountryTaxConfig = {
  countryName: "Belgium",
  countryCode: "BE",
  currency: "EUR",
  currencySymbol: "€",
  locale: "fr-BE",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 15820, rate: 0.25, label: "€0 – €15,820" },
      { min: 15820, max: 27920, rate: 0.40, label: "€15,821 – €27,920" },
      { min: 27920, max: 48320, rate: 0.45, label: "€27,921 – €48,320" },
      { min: 48320, max: Infinity, rate: 0.50, label: "Over €48,320" },
    ],
    worldwideIncome: true,
    description: "Progressive 25–50% on worldwide income.",
  },
  cit: { standardRate: 0.25, description: "25% corporate income tax rate." },
  wht: { dividends: 0.30, interest: 0.30, royalties: 0.30 },
  exemptions: [
    { id: "allowances", label: "Certain Allowances", description: "Various social allowances are tax-exempt." },
  ],
  reliefs: [
    { id: "notional_interest", label: "Notional Interest Deduction", description: "Deduction based on equity to encourage self-financing.", type: "percentage", defaultValue: 0 },
  ],
  taxAuthority: "SPF Finances",
  fiscalYear: "January 1 – December 31",
};
