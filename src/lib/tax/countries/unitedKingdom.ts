import { CountryTaxConfig } from "../countryTypes";

export const unitedKingdomConfig: CountryTaxConfig = {
  countryName: "United Kingdom",
  countryCode: "GB",
  currency: "GBP",
  currencySymbol: "£",
  locale: "en-GB",

  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 12570, rate: 0, label: "Personal Allowance (£0 – £12,570)" },
      { min: 12570, max: 50270, rate: 0.20, label: "Basic Rate (£12,571 – £50,270)" },
      { min: 50270, max: 125140, rate: 0.40, label: "Higher Rate (£50,271 – £125,140)" },
      { min: 125140, max: Infinity, rate: 0.45, label: "Additional Rate (over £125,140)" },
    ],
    worldwideIncome: true,
    description: "Progressive 20–45% with personal allowance of £12,570.",
  },

  cit: {
    standardRate: 0.25,
    smeRate: 0.19,
    smeThreshold: 250000,
    description: "25% main rate. Small profits rate of 19% for companies with profits under £50,000, marginal relief up to £250,000.",
  },

  wht: {
    dividends: 0.20,
    interest: 0.20,
    royalties: 0.20,
  },

  exemptions: [
    { id: "isa", label: "ISA Savings Income", description: "Income and gains within Individual Savings Accounts (ISAs) are tax-free." },
    { id: "trading_allowance", label: "Trading Allowance", description: "First £1,000 of trading income is tax-free." },
  ],

  reliefs: [
    { id: "personal_allowance", label: "Personal Allowance", description: "Tax-free allowance of £12,570.", type: "fixed", defaultValue: 12570 },
    { id: "marriage_allowance", label: "Marriage Allowance", description: "Transfer £1,260 of personal allowance to spouse.", type: "fixed", defaultValue: 1260 },
  ],

  taxAuthority: "HM Revenue & Customs (HMRC)",
  fiscalYear: "April 6 – April 5",
};
