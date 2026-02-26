import { CountryTaxConfig } from "../countryTypes";

export const greeceConfig: CountryTaxConfig = {
  countryName: "Greece",
  countryCode: "GR",
  currency: "EUR",
  currencySymbol: "€",
  locale: "el-GR",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 10000, rate: 0.09, label: "€0 – €10,000" },
      { min: 10000, max: 20000, rate: 0.22, label: "€10,001 – €20,000" },
      { min: 20000, max: 30000, rate: 0.28, label: "€20,001 – €30,000" },
      { min: 30000, max: 40000, rate: 0.36, label: "€30,001 – €40,000" },
      { min: 40000, max: Infinity, rate: 0.44, label: "Over €40,000" },
    ],
    worldwideIncome: true,
    description: "Progressive 9–44% on worldwide income.",
  },
  cit: { standardRate: 0.22, description: "22% corporate income tax rate." },
  wht: { dividends: 0.05, interest: 0.15, royalties: 0.20 },
  exemptions: [
    { id: "shipping", label: "Shipping Regime", description: "Greek-flagged shipping companies enjoy special tax treatment." },
  ],
  reliefs: [
    { id: "investment_incentive", label: "Investment Incentives", description: "Tax incentives under development law.", type: "percentage", defaultValue: 0 },
  ],
  taxAuthority: "Independent Authority for Public Revenue (AADE)",
  fiscalYear: "January 1 – December 31",
};
