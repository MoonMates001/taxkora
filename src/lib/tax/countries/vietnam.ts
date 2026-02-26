import { CountryTaxConfig } from "../countryTypes";

export const vietnamConfig: CountryTaxConfig = {
  countryName: "Vietnam",
  countryCode: "VN",
  currency: "VND",
  currencySymbol: "₫",
  locale: "vi-VN",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 60000000, rate: 0.05, label: "₫0 – ₫60M" },
      { min: 60000000, max: 120000000, rate: 0.10, label: "₫60M – ₫120M" },
      { min: 120000000, max: 216000000, rate: 0.15, label: "₫120M – ₫216M" },
      { min: 216000000, max: 384000000, rate: 0.20, label: "₫216M – ₫384M" },
      { min: 384000000, max: 624000000, rate: 0.25, label: "₫384M – ₫624M" },
      { min: 624000000, max: 960000000, rate: 0.30, label: "₫624M – ₫960M" },
      { min: 960000000, max: Infinity, rate: 0.35, label: "Over ₫960M" },
    ],
    worldwideIncome: true,
    description: "Progressive 5–35% on worldwide income.",
  },
  cit: { standardRate: 0.20, description: "20% standard corporate income tax rate." },
  wht: { dividends: 0.05, interest: 0.05, royalties: 0.10 },
  exemptions: [
    { id: "high_tech", label: "High-Tech Incentives", description: "High-tech enterprises enjoy preferential CIT rates." },
  ],
  reliefs: [
    { id: "tax_holiday", label: "Tax Holidays", description: "4-year CIT exemption + 50% reduction for qualifying investments.", type: "percentage", defaultValue: 0 },
  ],
  taxAuthority: "General Department of Taxation",
  fiscalYear: "January 1 – December 31",
};
