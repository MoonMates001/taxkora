import { CountryTaxConfig } from "../countryTypes";

export const malaysiaConfig: CountryTaxConfig = {
  countryName: "Malaysia",
  countryCode: "MY",
  currency: "MYR",
  currencySymbol: "RM",
  locale: "ms-MY",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 5000, rate: 0, label: "RM0 – RM5,000" },
      { min: 5000, max: 20000, rate: 0.01, label: "RM5,001 – RM20,000" },
      { min: 20000, max: 35000, rate: 0.03, label: "RM20,001 – RM35,000" },
      { min: 35000, max: 50000, rate: 0.06, label: "RM35,001 – RM50,000" },
      { min: 50000, max: 70000, rate: 0.11, label: "RM50,001 – RM70,000" },
      { min: 70000, max: 100000, rate: 0.19, label: "RM70,001 – RM100,000" },
      { min: 100000, max: 400000, rate: 0.25, label: "RM100,001 – RM400,000" },
      { min: 400000, max: 600000, rate: 0.26, label: "RM400,001 – RM600,000" },
      { min: 600000, max: 2000000, rate: 0.28, label: "RM600,001 – RM2,000,000" },
      { min: 2000000, max: Infinity, rate: 0.30, label: "Over RM2,000,000" },
    ],
    worldwideIncome: false,
    description: "Progressive 0–30% on Malaysian-sourced income.",
  },
  cit: { standardRate: 0.24, description: "24% corporate income tax rate." },
  wht: { dividends: 0, interest: 0.15, royalties: 0.10 },
  exemptions: [
    { id: "islamic_finance", label: "Islamic Finance Exemptions", description: "Income from certain Islamic financial instruments is exempt." },
  ],
  reliefs: [
    { id: "pioneer_status", label: "Pioneer Status", description: "70-100% income tax exemption for promoted industries.", type: "percentage", defaultValue: 0.70 },
  ],
  taxAuthority: "Lembaga Hasil Dalam Negeri (LHDN)",
  fiscalYear: "January 1 – December 31",
};
