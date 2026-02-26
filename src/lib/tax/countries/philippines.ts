import { CountryTaxConfig } from "../countryTypes";

export const philippinesConfig: CountryTaxConfig = {
  countryName: "Philippines",
  countryCode: "PH",
  currency: "PHP",
  currencySymbol: "₱",
  locale: "en-PH",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 250000, rate: 0, label: "Exempt (₱0 – ₱250,000)" },
      { min: 250000, max: 400000, rate: 0.15, label: "₱250,001 – ₱400,000" },
      { min: 400000, max: 800000, rate: 0.20, label: "₱400,001 – ₱800,000" },
      { min: 800000, max: 2000000, rate: 0.25, label: "₱800,001 – ₱2,000,000" },
      { min: 2000000, max: 8000000, rate: 0.30, label: "₱2,000,001 – ₱8,000,000" },
      { min: 8000000, max: Infinity, rate: 0.35, label: "Over ₱8,000,000" },
    ],
    worldwideIncome: true,
    description: "Progressive 0–35% under TRAIN law.",
  },
  cit: { standardRate: 0.25, smeRate: 0.20, smeThreshold: 5000000, description: "25% standard; 20% for SMEs with net taxable income ≤₱5M." },
  wht: { dividends: 0.15, interest: 0.20, royalties: 0.20 },
  exemptions: [
    { id: "peza", label: "PEZA Incentives", description: "Enterprises in economic zones enjoy income tax holidays." },
  ],
  reliefs: [
    { id: "investment_incentive", label: "Investment Incentives", description: "Tax incentives under CREATE Act.", type: "percentage", defaultValue: 0 },
  ],
  taxAuthority: "Bureau of Internal Revenue (BIR)",
  fiscalYear: "January 1 – December 31",
};
