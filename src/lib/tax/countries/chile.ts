import { CountryTaxConfig } from "../countryTypes";

export const chileConfig: CountryTaxConfig = {
  countryName: "Chile",
  countryCode: "CL",
  currency: "CLP",
  currencySymbol: "$",
  locale: "es-CL",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 8775000, rate: 0, label: "Exempt" },
      { min: 8775000, max: 19500000, rate: 0.04, label: "4%" },
      { min: 19500000, max: 32500000, rate: 0.08, label: "8%" },
      { min: 32500000, max: 45500000, rate: 0.135, label: "13.5%" },
      { min: 45500000, max: 58500000, rate: 0.23, label: "23%" },
      { min: 58500000, max: 78000000, rate: 0.304, label: "30.4%" },
      { min: 78000000, max: Infinity, rate: 0.40, label: "40%" },
    ],
    worldwideIncome: true,
    description: "Progressive 0–40% on worldwide income.",
  },
  cit: { standardRate: 0.27, description: "27% first category tax (CIT)." },
  wht: { dividends: 0.35, interest: 0.35, royalties: 0.30 },
  exemptions: [
    { id: "regional", label: "Regional Incentives", description: "Tax incentives for investments in extreme regions." },
  ],
  reliefs: [
    { id: "integrated_system", label: "Integrated Tax System", description: "CIT credits against final PIT liability.", type: "credit", defaultValue: 0 },
  ],
  taxAuthority: "Servicio de Impuestos Internos (SII)",
  fiscalYear: "January 1 – December 31",
};
