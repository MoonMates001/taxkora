import { CountryTaxConfig } from "../countryTypes";

export const russiaConfig: CountryTaxConfig = {
  countryName: "Russia",
  countryCode: "RU",
  currency: "RUB",
  currencySymbol: "₽",
  locale: "ru-RU",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 5000000, rate: 0.13, label: "13% (up to ₽5M)" },
      { min: 5000000, max: Infinity, rate: 0.15, label: "15% (over ₽5M)" },
    ],
    worldwideIncome: true,
    description: "Flat 13% up to ₽5M; 15% on excess.",
  },
  cit: { standardRate: 0.20, description: "20% standard corporate tax rate." },
  wht: { dividends: 0.15, interest: 0.20, royalties: 0.20 },
  exemptions: [
    { id: "state_benefits", label: "State Benefits", description: "Certain state benefits and pensions are tax-exempt." },
  ],
  reliefs: [
    { id: "standard", label: "Standard Deduction", description: "Limited standard deductions available.", type: "fixed", defaultValue: 0 },
  ],
  taxAuthority: "Federal Tax Service (FTS)",
  fiscalYear: "January 1 – December 31",
};
