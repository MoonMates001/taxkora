import { CountryTaxConfig } from "../countryTypes";

export const japanConfig: CountryTaxConfig = {
  countryName: "Japan",
  countryCode: "JP",
  currency: "JPY",
  currencySymbol: "¥",
  locale: "ja-JP",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 1950000, rate: 0.05, label: "¥0 – ¥1,950,000" },
      { min: 1950000, max: 3300000, rate: 0.10, label: "¥1,950,001 – ¥3,300,000" },
      { min: 3300000, max: 6950000, rate: 0.20, label: "¥3,300,001 – ¥6,950,000" },
      { min: 6950000, max: 9000000, rate: 0.23, label: "¥6,950,001 – ¥9,000,000" },
      { min: 9000000, max: 18000000, rate: 0.33, label: "¥9,000,001 – ¥18,000,000" },
      { min: 18000000, max: 40000000, rate: 0.40, label: "¥18,000,001 – ¥40,000,000" },
      { min: 40000000, max: Infinity, rate: 0.45, label: "Over ¥40,000,000" },
    ],
    worldwideIncome: true,
    description: "Progressive 5–45% national tax plus ~10% local inhabitant tax.",
  },
  cit: { standardRate: 0.232, description: "~23.2% national rate; effective ~30% with local taxes." },
  wht: { dividends: 0.20, interest: 0.15, royalties: 0.20 },
  exemptions: [
    { id: "pension_income", label: "Pension Income Exemption", description: "Certain pension income receives favorable deductions." },
  ],
  reliefs: [
    { id: "dependent", label: "Dependent Deduction", description: "Deduction for qualifying dependents.", type: "fixed", defaultValue: 380000 },
  ],
  taxAuthority: "National Tax Agency (NTA)",
  fiscalYear: "January 1 – December 31",
};
