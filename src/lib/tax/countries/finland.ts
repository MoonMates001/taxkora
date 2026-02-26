import { CountryTaxConfig } from "../countryTypes";

export const finlandConfig: CountryTaxConfig = {
  countryName: "Finland",
  countryCode: "FI",
  currency: "EUR",
  currencySymbol: "€",
  locale: "fi-FI",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 20500, rate: 0, label: "€0 – €20,500 (0%)" },
      { min: 20500, max: 30500, rate: 0.06, label: "€20,501 – €30,500" },
      { min: 30500, max: 50400, rate: 0.1725, label: "€30,501 – €50,400" },
      { min: 50400, max: 88200, rate: 0.2125, label: "€50,401 – €88,200" },
      { min: 88200, max: Infinity, rate: 0.3125, label: "Over €88,200" },
    ],
    surcharge: 0.10,
    worldwideIncome: true,
    description: "Progressive state tax 0–31.25% plus ~20% municipal tax; effective up to ~44%.",
  },
  cit: { standardRate: 0.20, description: "20% corporate income tax rate." },
  wht: { dividends: 0.30, interest: 0, royalties: 0.20 },
  exemptions: [
    { id: "capital_income_split", label: "Capital Income Split", description: "Business income can be split between capital and earned income." },
  ],
  reliefs: [
    { id: "rd_incentives", label: "R&D Incentives", description: "Additional R&D cost deductions.", type: "percentage", defaultValue: 1.50 },
  ],
  taxAuthority: "Verohallinto",
  fiscalYear: "January 1 – December 31",
};
