import { CountryTaxConfig } from "../countryTypes";

export const chinaConfig: CountryTaxConfig = {
  countryName: "China",
  countryCode: "CN",
  currency: "CNY",
  currencySymbol: "¥",
  locale: "zh-CN",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 36000, rate: 0.03, label: "¥0 – ¥36,000" },
      { min: 36000, max: 144000, rate: 0.10, label: "¥36,001 – ¥144,000" },
      { min: 144000, max: 300000, rate: 0.20, label: "¥144,001 – ¥300,000" },
      { min: 300000, max: 420000, rate: 0.25, label: "¥300,001 – ¥420,000" },
      { min: 420000, max: 660000, rate: 0.30, label: "¥420,001 – ¥660,000" },
      { min: 660000, max: 960000, rate: 0.35, label: "¥660,001 – ¥960,000" },
      { min: 960000, max: Infinity, rate: 0.45, label: "Over ¥960,000" },
    ],
    worldwideIncome: true,
    description: "Progressive 3–45% on worldwide income for residents (>183 days).",
  },
  cit: { standardRate: 0.25, description: "25% standard corporate income tax rate." },
  wht: { dividends: 0.10, interest: 0.10, royalties: 0.10 },
  exemptions: [
    { id: "agricultural", label: "Agricultural Income", description: "Certain agricultural income is exempt from PIT." },
  ],
  reliefs: [
    { id: "rd_super", label: "R&D Super Deduction", description: "200% deduction on qualifying R&D expenditure.", type: "percentage", defaultValue: 2.0 },
  ],
  taxAuthority: "State Taxation Administration (STA)",
  fiscalYear: "January 1 – December 31",
};
