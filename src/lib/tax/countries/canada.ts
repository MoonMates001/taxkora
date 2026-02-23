import { CountryTaxConfig } from "../countryTypes";

export const canadaConfig: CountryTaxConfig = {
  countryName: "Canada",
  countryCode: "CA",
  currency: "CAD",
  currencySymbol: "C$",
  locale: "en-CA",

  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 55867, rate: 0.15, label: "Up to C$55,867" },
      { min: 55867, max: 111733, rate: 0.205, label: "C$55,868 – C$111,733" },
      { min: 111733, max: 154906, rate: 0.26, label: "C$111,734 – C$154,906" },
      { min: 154906, max: 220000, rate: 0.29, label: "C$154,907 – C$220,000" },
      { min: 220000, max: Infinity, rate: 0.33, label: "Over C$220,000" },
    ],
    worldwideIncome: true,
    description: "Progressive 15–33% federal + provincial rates (varies by province).",
  },

  cit: {
    standardRate: 0.15,
    effectiveRate: 0.26,
    smeRate: 0.09,
    smeThreshold: 500000,
    description: "15% federal + ~11% provincial = ~26% combined. Small business rate of 9% on first C$500,000.",
  },

  wht: {
    dividends: 0.25,
    interest: 0.25,
    royalties: 0.25,
  },

  exemptions: [
    { id: "principal_residence", label: "Primary Residence Capital Gains", description: "Capital gains on sale of principal residence are fully exempt." },
    { id: "tfsa", label: "Tax-Free Savings Account", description: "Investment income and gains within TFSA are tax-free." },
  ],

  reliefs: [
    { id: "basic_personal", label: "Basic Personal Amount", description: "Federal basic personal amount of C$15,705.", type: "fixed", defaultValue: 15705 },
    { id: "child_benefit", label: "Canada Child Benefit", description: "Tax-free monthly payment for families with children under 18.", type: "credit" },
    { id: "rrsp", label: "RRSP Deduction", description: "Contributions to Registered Retirement Savings Plan are deductible.", type: "fixed" },
  ],

  taxAuthority: "Canada Revenue Agency (CRA)",
  fiscalYear: "January 1 – December 31",
};
