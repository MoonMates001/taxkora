import { CountryTaxConfig } from "../countryTypes";

export const germanyConfig: CountryTaxConfig = {
  countryName: "Germany",
  countryCode: "DE",
  currency: "EUR",
  currencySymbol: "€",
  locale: "de-DE",

  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 11784, rate: 0, label: "Up to €11,784" },
      { min: 11784, max: 17005, rate: 0.14, label: "€11,785 – €17,005" },
      { min: 17005, max: 66760, rate: 0.2397, label: "€17,006 – €66,760" },
      { min: 66760, max: 277825, rate: 0.42, label: "€66,761 – €277,825" },
      { min: 277825, max: Infinity, rate: 0.45, label: "Over €277,825" },
    ],
    surcharge: 0.055,
    surchargeLabel: "Solidarity Surcharge (5.5% of tax)",
    worldwideIncome: true,
    description: "Progressive 0–45% + 5.5% solidarity surcharge on income tax.",
  },

  cit: {
    standardRate: 0.15,
    effectiveRate: 0.30,
    description: "15% federal CIT + 5.5% solidarity surcharge + ~14% trade tax = ~30% effective.",
  },

  wht: {
    dividends: 0.25,
    interest: 0.25,
    royalties: 0.15,
  },

  exemptions: [
    { id: "capital_gains", label: "Certain Capital Gains", description: "Capital gains on shares held >1 year may qualify for partial exemption." },
  ],

  reliefs: [
    { id: "child_allowance", label: "Child Allowance (Kinderfreibetrag)", description: "€6,384 per child tax-free allowance.", type: "fixed", defaultValue: 6384 },
    { id: "church_tax", label: "Church Tax Deduction", description: "Church tax (8–9% of income tax) is deductible.", type: "percentage" },
  ],

  taxAuthority: "Federal Central Tax Office (BZSt)",
  fiscalYear: "January 1 – December 31",
};
