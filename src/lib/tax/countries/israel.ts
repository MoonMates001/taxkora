import { CountryTaxConfig } from "../countryTypes";

export const israelConfig: CountryTaxConfig = {
  countryName: "Israel",
  countryCode: "IL",
  currency: "ILS",
  currencySymbol: "₪",
  locale: "he-IL",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 84120, rate: 0.10, label: "₪0 – ₪84,120" },
      { min: 84120, max: 120720, rate: 0.14, label: "₪84,121 – ₪120,720" },
      { min: 120720, max: 193800, rate: 0.20, label: "₪120,721 – ₪193,800" },
      { min: 193800, max: 269280, rate: 0.31, label: "₪193,801 – ₪269,280" },
      { min: 269280, max: 560280, rate: 0.35, label: "₪269,281 – ₪560,280" },
      { min: 560280, max: 721560, rate: 0.47, label: "₪560,281 – ₪721,560" },
      { min: 721560, max: Infinity, rate: 0.50, label: "Over ₪721,560" },
    ],
    worldwideIncome: true,
    description: "Progressive 10–50% on worldwide income.",
  },
  cit: { standardRate: 0.23, description: "23% corporate income tax rate." },
  wht: { dividends: 0.25, interest: 0.25, royalties: 0.25 },
  exemptions: [
    { id: "tech_incentives", label: "Technology Incentives", description: "Preferred enterprises enjoy reduced rates." },
  ],
  reliefs: [
    { id: "rd_credit", label: "R&D Credits", description: "Government grants and credits for R&D activities.", type: "credit", defaultValue: 0 },
  ],
  taxAuthority: "Israel Tax Authority",
  fiscalYear: "January 1 – December 31",
};
