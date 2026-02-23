import { CountryTaxConfig } from "../countryTypes";

export const saudiArabiaConfig: CountryTaxConfig = {
  countryName: "Saudi Arabia",
  countryCode: "SA",
  currency: "SAR",
  currencySymbol: "﷼",
  locale: "ar-SA",

  pit: {
    type: "flat",
    brackets: [
      { min: 0, max: Infinity, rate: 0, label: "No PIT for Saudi nationals" },
    ],
    worldwideIncome: false,
    description: "No personal income tax for Saudi citizens. Zakat (2.5%) applies instead. Non-residents taxed at 20% on Saudi-source income.",
  },

  cit: {
    standardRate: 0.20,
    description: "20% CIT on foreign-owned companies. Saudi/GCC-owned entities pay 2.5% Zakat instead of CIT.",
  },

  wht: {
    dividends: 0.05,
    interest: 0.05,
    royalties: 0.15,
    technicalFees: 0.05,
    rent: 0.05,
  },

  exemptions: [
    { id: "zakat", label: "Zakat for Nationals", description: "Saudi nationals pay 2.5% Zakat on net worth instead of CIT." },
    { id: "industrial", label: "Industrial Incentives", description: "Certain industrial projects may qualify for tax incentives." },
  ],

  reliefs: [
    { id: "depreciation", label: "Accelerated Depreciation", description: "Accelerated depreciation rates available for qualifying assets.", type: "percentage" },
  ],

  taxAuthority: "Zakat, Tax and Customs Authority (ZATCA)",
  fiscalYear: "Hijri calendar or Gregorian (company choice)",
};
