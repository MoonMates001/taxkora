import { CountryTaxConfig } from "../countryTypes";

export const franceConfig: CountryTaxConfig = {
  countryName: "France",
  countryCode: "FR",
  currency: "EUR",
  currencySymbol: "€",
  locale: "fr-FR",

  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 11294, rate: 0, label: "Up to €11,294" },
      { min: 11294, max: 28797, rate: 0.11, label: "€11,295 – €28,797" },
      { min: 28797, max: 82341, rate: 0.30, label: "€28,798 – €82,341" },
      { min: 82341, max: 177106, rate: 0.41, label: "€82,342 – €177,106" },
      { min: 177106, max: Infinity, rate: 0.45, label: "Over €177,106" },
    ],
    worldwideIncome: true,
    description: "Progressive 0–45%. Family quotient system divides income by household parts.",
  },

  cit: {
    standardRate: 0.25,
    smeRate: 0.15,
    smeThreshold: 42500,
    description: "25% standard rate. Reduced 15% rate on first €42,500 of profits for qualifying SMEs.",
  },

  wht: {
    dividends: 0.30,
    interest: 0.128,
    royalties: 0.30,
  },

  exemptions: [
    { id: "family_allowances", label: "Family Allowances", description: "State family allowances are exempt from income tax." },
    { id: "pea", label: "PEA Investment", description: "Gains within Plan d'Épargne en Actions are tax-free after 5 years." },
  ],

  reliefs: [
    { id: "family_quotient", label: "Family Quotient System", description: "Income divided by number of 'parts' based on family size.", type: "percentage" },
    { id: "employment_expense", label: "Employment Expense Deduction", description: "10% flat deduction on employment income (capped at €14,171).", type: "percentage", defaultValue: 0.10 },
  ],

  taxAuthority: "Direction Générale des Finances Publiques (DGFiP)",
  fiscalYear: "January 1 – December 31",
};
