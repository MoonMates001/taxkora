import { CountryTaxConfig } from "../countryTypes";

export const austriaConfig: CountryTaxConfig = {
  countryName: "Austria",
  countryCode: "AT",
  currency: "EUR",
  currencySymbol: "€",
  locale: "de-AT",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 12816, rate: 0, label: "€0 – €12,816 (0%)" },
      { min: 12816, max: 20818, rate: 0.20, label: "€12,817 – €20,818" },
      { min: 20818, max: 34513, rate: 0.30, label: "€20,819 – €34,513" },
      { min: 34513, max: 66612, rate: 0.40, label: "€34,514 – €66,612" },
      { min: 66612, max: 99266, rate: 0.48, label: "€66,613 – €99,266" },
      { min: 99266, max: 1000000, rate: 0.50, label: "€99,267 – €1,000,000" },
      { min: 1000000, max: Infinity, rate: 0.55, label: "Over €1,000,000" },
    ],
    worldwideIncome: true,
    description: "Progressive 0–55% on worldwide income.",
  },
  cit: { standardRate: 0.24, description: "24% corporate income tax rate." },
  wht: { dividends: 0.275, interest: 0.25, royalties: 0.20 },
  exemptions: [
    { id: "family_allowance", label: "Family Allowances", description: "State family allowances are tax-exempt." },
  ],
  reliefs: [
    { id: "climate_bonus", label: "Climate Bonus", description: "Annual climate bonus payment.", type: "fixed", defaultValue: 0 },
  ],
  taxAuthority: "Bundesministerium für Finanzen",
  fiscalYear: "January 1 – December 31",
};
