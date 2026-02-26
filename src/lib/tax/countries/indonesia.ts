import { CountryTaxConfig } from "../countryTypes";

export const indonesiaConfig: CountryTaxConfig = {
  countryName: "Indonesia",
  countryCode: "ID",
  currency: "IDR",
  currencySymbol: "Rp",
  locale: "id-ID",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 60000000, rate: 0.05, label: "Rp0 – Rp60M" },
      { min: 60000000, max: 250000000, rate: 0.15, label: "Rp60M – Rp250M" },
      { min: 250000000, max: 500000000, rate: 0.25, label: "Rp250M – Rp500M" },
      { min: 500000000, max: 5000000000, rate: 0.30, label: "Rp500M – Rp5B" },
      { min: 5000000000, max: Infinity, rate: 0.35, label: "Over Rp5B" },
    ],
    worldwideIncome: true,
    description: "Progressive 5–35% on worldwide income.",
  },
  cit: { standardRate: 0.22, description: "22% standard corporate tax rate." },
  wht: { dividends: 0.20, interest: 0.20, royalties: 0.20 },
  exemptions: [
    { id: "religious_charity", label: "Religious Charities", description: "Donations to approved religious bodies are deductible." },
  ],
  reliefs: [
    { id: "sme_incentive", label: "SME Incentives", description: "50% CIT reduction for SMEs with turnover under Rp50B.", type: "percentage", defaultValue: 0.50 },
  ],
  taxAuthority: "Direktorat Jenderal Pajak (DJP)",
  fiscalYear: "January 1 – December 31",
};
