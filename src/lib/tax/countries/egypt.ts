import { CountryTaxConfig } from "../countryTypes";

export const egyptConfig: CountryTaxConfig = {
  countryName: "Egypt",
  countryCode: "EG",
  currency: "EGP",
  currencySymbol: "E£",
  locale: "ar-EG",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 40000, rate: 0, label: "Exempt (E£0 – E£40,000)" },
      { min: 40000, max: 55000, rate: 0.10, label: "E£40,001 – E£55,000" },
      { min: 55000, max: 70000, rate: 0.15, label: "E£55,001 – E£70,000" },
      { min: 70000, max: 200000, rate: 0.20, label: "E£70,001 – E£200,000" },
      { min: 200000, max: 400000, rate: 0.225, label: "E£200,001 – E£400,000" },
      { min: 400000, max: Infinity, rate: 0.25, label: "Over E£400,000" },
    ],
    worldwideIncome: false,
    description: "Progressive 0–25% on Egyptian-sourced income.",
  },
  cit: { standardRate: 0.225, description: "22.5% corporate income tax rate." },
  wht: { dividends: 0.10, interest: 0.20, royalties: 0.20 },
  exemptions: [
    { id: "free_zones", label: "Free Zones", description: "Entities in free zones enjoy tax exemptions." },
  ],
  reliefs: [
    { id: "investment_law", label: "Investment Law Incentives", description: "Tax deductions for qualifying investments under Investment Law.", type: "percentage", defaultValue: 0 },
  ],
  taxAuthority: "Egyptian Tax Authority (ETA)",
  fiscalYear: "January 1 – December 31",
};
