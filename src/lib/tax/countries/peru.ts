import { CountryTaxConfig } from "../countryTypes";

export const peruConfig: CountryTaxConfig = {
  countryName: "Peru",
  countryCode: "PE",
  currency: "PEN",
  currencySymbol: "S/",
  locale: "es-PE",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 24150, rate: 0.08, label: "8% (up to 5 UIT)" },
      { min: 24150, max: 96600, rate: 0.14, label: "14% (5–20 UIT)" },
      { min: 96600, max: 169050, rate: 0.17, label: "17% (20–35 UIT)" },
      { min: 169050, max: 217350, rate: 0.20, label: "20% (35–45 UIT)" },
      { min: 217350, max: Infinity, rate: 0.30, label: "30% (over 45 UIT)" },
    ],
    worldwideIncome: true,
    description: "Progressive 8–30% on worldwide income.",
  },
  cit: { standardRate: 0.295, description: "29.5% corporate income tax rate." },
  wht: { dividends: 0.05, interest: 0.30, royalties: 0.30 },
  exemptions: [
    { id: "amazon", label: "Amazon Region Exemptions", description: "Tax incentives for businesses in Amazon region." },
  ],
  reliefs: [
    { id: "accelerated_depreciation", label: "Accelerated Depreciation", description: "Accelerated depreciation for qualifying assets.", type: "percentage", defaultValue: 0 },
  ],
  taxAuthority: "Superintendencia Nacional de Aduanas y de Administración Tributaria (SUNAT)",
  fiscalYear: "January 1 – December 31",
};
