import { CountryTaxConfig } from "../countryTypes";

export const polandConfig: CountryTaxConfig = {
  countryName: "Poland",
  countryCode: "PL",
  currency: "PLN",
  currencySymbol: "zł",
  locale: "pl-PL",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 30000, rate: 0, label: "Tax-free (zł0 – zł30,000)" },
      { min: 30000, max: 120000, rate: 0.12, label: "zł30,001 – zł120,000 (12%)" },
      { min: 120000, max: Infinity, rate: 0.32, label: "Over zł120,000 (32%)" },
    ],
    worldwideIncome: true,
    description: "Progressive 12–32% with tax-free amount of zł30,000.",
  },
  cit: { standardRate: 0.19, smeRate: 0.09, smeThreshold: 2000000, description: "19% standard; 9% for small taxpayers under €2M revenue." },
  wht: { dividends: 0.19, interest: 0.19, royalties: 0.20 },
  exemptions: [
    { id: "family_benefits", label: "Family Benefits", description: "Family-related state benefits are tax-exempt." },
  ],
  reliefs: [
    { id: "rd_relief", label: "R&D Relief", description: "Additional 100-200% deduction on qualifying R&D costs.", type: "percentage", defaultValue: 2.0 },
  ],
  taxAuthority: "Krajowa Administracja Skarbowa (KAS)",
  fiscalYear: "January 1 – December 31",
};
