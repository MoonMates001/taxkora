import { CountryTaxConfig } from "../countryTypes";

export const czechRepublicConfig: CountryTaxConfig = {
  countryName: "Czech Republic",
  countryCode: "CZ",
  currency: "CZK",
  currencySymbol: "Kč",
  locale: "cs-CZ",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 1935552, rate: 0.15, label: "15% (up to Kč1,935,552)" },
      { min: 1935552, max: Infinity, rate: 0.23, label: "23% (over Kč1,935,552)" },
    ],
    worldwideIncome: true,
    description: "Progressive 15–23% on worldwide income.",
  },
  cit: { standardRate: 0.21, description: "21% corporate income tax rate." },
  wht: { dividends: 0.15, interest: 0.15, royalties: 0.15 },
  exemptions: [
    { id: "research_exempt", label: "Research Exemptions", description: "Income from certain research activities may be exempt." },
  ],
  reliefs: [
    { id: "investment_incentive", label: "Investment Incentives", description: "Tax relief for qualifying investments under Investment Incentives Act.", type: "credit", defaultValue: 0 },
  ],
  taxAuthority: "Finanční správa",
  fiscalYear: "January 1 – December 31",
};
