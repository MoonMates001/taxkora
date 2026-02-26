import { CountryTaxConfig } from "../countryTypes";

export const swedenConfig: CountryTaxConfig = {
  countryName: "Sweden",
  countryCode: "SE",
  currency: "SEK",
  currencySymbol: "kr",
  locale: "sv-SE",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 614000, rate: 0.32, label: "Municipal tax (~32%)" },
      { min: 614000, max: Infinity, rate: 0.52, label: "State + municipal (~52%)" },
    ],
    worldwideIncome: true,
    description: "~32% municipal tax; additional 20% state tax above SEK 614,000.",
  },
  cit: { standardRate: 0.206, description: "20.6% corporate income tax rate." },
  wht: { dividends: 0.30, interest: 0, royalties: 0 },
  exemptions: [
    { id: "primary_home", label: "Primary Home Capital Gains", description: "Reduced rate on primary home sales gains." },
  ],
  reliefs: [
    { id: "job_tax", label: "Job Tax Deduction", description: "Automatic deduction for employment income.", type: "fixed", defaultValue: 0 },
  ],
  taxAuthority: "Skatteverket",
  fiscalYear: "January 1 – December 31",
};
