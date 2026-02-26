import { CountryTaxConfig } from "../countryTypes";

export const colombiaConfig: CountryTaxConfig = {
  countryName: "Colombia",
  countryCode: "CO",
  currency: "COP",
  currencySymbol: "$",
  locale: "es-CO",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 46229600, rate: 0, label: "Exempt (0 UVT – 1090)" },
      { min: 46229600, max: 72069480, rate: 0.19, label: "19%" },
      { min: 72069480, max: 168162120, rate: 0.28, label: "28%" },
      { min: 168162120, max: 296050080, rate: 0.33, label: "33%" },
      { min: 296050080, max: 554268360, rate: 0.35, label: "35%" },
      { min: 554268360, max: Infinity, rate: 0.39, label: "39%" },
    ],
    worldwideIncome: true,
    description: "Progressive 0–39% on worldwide income for residents.",
  },
  cit: { standardRate: 0.35, description: "35% corporate income tax rate." },
  wht: { dividends: 0.10, interest: 0.20, royalties: 0.20 },
  exemptions: [
    { id: "free_trade", label: "Free Trade Zones", description: "Companies in free trade zones enjoy 20% CIT rate." },
  ],
  reliefs: [
    { id: "investment_deduction", label: "Investment Deductions", description: "Deductions for qualifying asset investments.", type: "percentage", defaultValue: 0 },
  ],
  taxAuthority: "Dirección de Impuestos y Aduanas Nacionales (DIAN)",
  fiscalYear: "January 1 – December 31",
};
