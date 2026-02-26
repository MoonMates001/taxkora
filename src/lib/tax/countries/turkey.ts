import { CountryTaxConfig } from "../countryTypes";

export const turkeyConfig: CountryTaxConfig = {
  countryName: "Turkey",
  countryCode: "TR",
  currency: "TRY",
  currencySymbol: "₺",
  locale: "tr-TR",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 110000, rate: 0.15, label: "₺0 – ₺110,000" },
      { min: 110000, max: 230000, rate: 0.20, label: "₺110,001 – ₺230,000" },
      { min: 230000, max: 580000, rate: 0.27, label: "₺230,001 – ₺580,000" },
      { min: 580000, max: 3000000, rate: 0.35, label: "₺580,001 – ₺3,000,000" },
      { min: 3000000, max: Infinity, rate: 0.40, label: "Over ₺3,000,000" },
    ],
    worldwideIncome: true,
    description: "Progressive 15–40% on worldwide income.",
  },
  cit: { standardRate: 0.25, description: "25% corporate income tax rate." },
  wht: { dividends: 0.10, interest: 0.10, royalties: 0.20 },
  exemptions: [
    { id: "tech_zone", label: "Tech Zone Exemptions", description: "Income from technology development zones may be exempt." },
  ],
  reliefs: [
    { id: "investment_incentive", label: "Investment Incentives", description: "Tax reductions for qualifying investments.", type: "percentage", defaultValue: 0 },
  ],
  taxAuthority: "Revenue Administration (GİB)",
  fiscalYear: "January 1 – December 31",
};
