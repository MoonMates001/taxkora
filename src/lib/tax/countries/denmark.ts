import { CountryTaxConfig } from "../countryTypes";

export const denmarkConfig: CountryTaxConfig = {
  countryName: "Denmark",
  countryCode: "DK",
  currency: "DKK",
  currencySymbol: "kr",
  locale: "da-DK",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 46700, rate: 0, label: "Personal allowance (kr0 – kr46,700)" },
      { min: 46700, max: 568900, rate: 0.3724, label: "Bottom bracket (~37.24%)" },
      { min: 568900, max: Infinity, rate: 0.559, label: "Top bracket (~55.9%)" },
    ],
    worldwideIncome: true,
    description: "Progressive up to 55.9% including municipal and church tax.",
  },
  cit: { standardRate: 0.22, description: "22% corporate income tax rate." },
  wht: { dividends: 0.27, interest: 0.22, royalties: 0.22 },
  exemptions: [
    { id: "pension_savings", label: "Pension Savings", description: "Contributions to approved pension schemes are deductible." },
  ],
  reliefs: [
    { id: "employment_allowance", label: "Employment Allowance", description: "Deduction of 10.65% of earned income (capped).", type: "percentage", defaultValue: 0.1065 },
  ],
  taxAuthority: "Skattestyrelsen",
  fiscalYear: "January 1 – December 31",
};
