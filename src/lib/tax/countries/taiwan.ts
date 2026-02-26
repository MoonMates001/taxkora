import { CountryTaxConfig } from "../countryTypes";

export const taiwanConfig: CountryTaxConfig = {
  countryName: "Taiwan",
  countryCode: "TW",
  currency: "TWD",
  currencySymbol: "NT$",
  locale: "zh-TW",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 560000, rate: 0.05, label: "NT$0 – NT$560,000" },
      { min: 560000, max: 1260000, rate: 0.12, label: "NT$560,001 – NT$1,260,000" },
      { min: 1260000, max: 2520000, rate: 0.20, label: "NT$1,260,001 – NT$2,520,000" },
      { min: 2520000, max: 4720000, rate: 0.30, label: "NT$2,520,001 – NT$4,720,000" },
      { min: 4720000, max: Infinity, rate: 0.40, label: "Over NT$4,720,000" },
    ],
    worldwideIncome: true,
    description: "Progressive 5–40% on worldwide income.",
  },
  cit: { standardRate: 0.20, description: "20% corporate income tax rate." },
  wht: { dividends: 0.21, interest: 0.20, royalties: 0.20 },
  exemptions: [
    { id: "tech_income", label: "Technology Income", description: "Certain technology sector income qualifies for exemptions." },
  ],
  reliefs: [
    { id: "rd_credit", label: "R&D Tax Credits", description: "Tax credits for qualifying R&D activities.", type: "credit", defaultValue: 0 },
  ],
  taxAuthority: "National Taxation Bureau",
  fiscalYear: "January 1 – December 31",
};
