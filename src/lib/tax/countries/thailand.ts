import { CountryTaxConfig } from "../countryTypes";

export const thailandConfig: CountryTaxConfig = {
  countryName: "Thailand",
  countryCode: "TH",
  currency: "THB",
  currencySymbol: "฿",
  locale: "th-TH",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 150000, rate: 0, label: "Exempt (฿0 – ฿150,000)" },
      { min: 150000, max: 300000, rate: 0.05, label: "฿150,001 – ฿300,000" },
      { min: 300000, max: 500000, rate: 0.10, label: "฿300,001 – ฿500,000" },
      { min: 500000, max: 750000, rate: 0.15, label: "฿500,001 – ฿750,000" },
      { min: 750000, max: 1000000, rate: 0.20, label: "฿750,001 – ฿1,000,000" },
      { min: 1000000, max: 2000000, rate: 0.25, label: "฿1M – ฿2M" },
      { min: 2000000, max: 5000000, rate: 0.30, label: "฿2M – ฿5M" },
      { min: 5000000, max: Infinity, rate: 0.35, label: "Over ฿5M" },
    ],
    worldwideIncome: false,
    description: "Progressive 5–35% on Thailand-sourced income.",
  },
  cit: { standardRate: 0.20, description: "20% corporate income tax rate." },
  wht: { dividends: 0.10, interest: 0.15, royalties: 0.15 },
  exemptions: [
    { id: "boi", label: "BOI Incentives", description: "Board of Investment promoted activities enjoy tax holidays." },
  ],
  reliefs: [
    { id: "sme_incentive", label: "SME Incentives", description: "Reduced CIT rates for qualifying SMEs.", type: "percentage", defaultValue: 0 },
  ],
  taxAuthority: "Revenue Department",
  fiscalYear: "January 1 – December 31",
};
