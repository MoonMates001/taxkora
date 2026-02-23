import { CountryTaxConfig } from "../countryTypes";

export const uaeConfig: CountryTaxConfig = {
  countryName: "United Arab Emirates",
  countryCode: "AE",
  currency: "AED",
  currencySymbol: "د.إ",
  locale: "ar-AE",

  pit: {
    type: "flat",
    brackets: [
      { min: 0, max: Infinity, rate: 0, label: "No Personal Income Tax" },
    ],
    worldwideIncome: false,
    description: "No personal income tax for individuals.",
  },

  cit: {
    standardRate: 0.09,
    smeRate: 0,
    smeThreshold: 375000,
    description: "9% on taxable income exceeding AED 375,000. 0% on first AED 375,000. Free zone entities may qualify for 0%.",
  },

  wht: {
    dividends: 0,
    interest: 0,
    royalties: 0,
  },

  exemptions: [
    { id: "free_zone", label: "Free Zone Exemptions", description: "Qualifying income of free zone entities taxed at 0% (conditional)." },
    { id: "small_business", label: "Small Business Relief", description: "Businesses with revenue under AED 3 million may elect small business relief." },
  ],

  reliefs: [],

  taxAuthority: "Federal Tax Authority (FTA)",
  fiscalYear: "Financial year as per company's constitution",
};
