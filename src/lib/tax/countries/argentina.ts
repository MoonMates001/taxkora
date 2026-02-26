import { CountryTaxConfig } from "../countryTypes";

export const argentinaConfig: CountryTaxConfig = {
  countryName: "Argentina",
  countryCode: "AR",
  currency: "ARS",
  currencySymbol: "$",
  locale: "es-AR",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 1735718, rate: 0.05, label: "5%" },
      { min: 1735718, max: 3471436, rate: 0.09, label: "9%" },
      { min: 3471436, max: 5207154, rate: 0.12, label: "12%" },
      { min: 5207154, max: 6942872, rate: 0.15, label: "15%" },
      { min: 6942872, max: 10414308, rate: 0.19, label: "19%" },
      { min: 10414308, max: 13885744, rate: 0.23, label: "23%" },
      { min: 13885744, max: 20828616, rate: 0.27, label: "27%" },
      { min: 20828616, max: 31242924, rate: 0.31, label: "31%" },
      { min: 31242924, max: Infinity, rate: 0.35, label: "35%" },
    ],
    worldwideIncome: true,
    description: "Progressive 5–35% on worldwide income.",
  },
  cit: { standardRate: 0.35, smeRate: 0.25, smeThreshold: 0, description: "25–35% graduated corporate tax rates." },
  wht: { dividends: 0.07, interest: 0.35, royalties: 0.28 },
  exemptions: [
    { id: "agricultural", label: "Agricultural Exemptions", description: "Certain agricultural activities enjoy tax preferences." },
  ],
  reliefs: [
    { id: "inflation_adjustment", label: "Inflation Adjustments", description: "Indexing of tax brackets and deductions for inflation.", type: "fixed", defaultValue: 0 },
  ],
  taxAuthority: "AFIP (Administración Federal de Ingresos Públicos)",
  fiscalYear: "January 1 – December 31",
};
