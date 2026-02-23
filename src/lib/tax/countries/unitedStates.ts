import { CountryTaxConfig } from "../countryTypes";

export const unitedStatesConfig: CountryTaxConfig = {
  countryName: "United States",
  countryCode: "US",
  currency: "USD",
  currencySymbol: "$",
  locale: "en-US",

  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 11600, rate: 0.10, label: "Up to $11,600" },
      { min: 11600, max: 47150, rate: 0.12, label: "$11,601 – $47,150" },
      { min: 47150, max: 100525, rate: 0.22, label: "$47,151 – $100,525" },
      { min: 100525, max: 191950, rate: 0.24, label: "$100,526 – $191,950" },
      { min: 191950, max: 243725, rate: 0.32, label: "$191,951 – $243,725" },
      { min: 243725, max: 609350, rate: 0.35, label: "$243,726 – $609,350" },
      { min: 609350, max: Infinity, rate: 0.37, label: "Over $609,350" },
    ],
    worldwideIncome: true,
    description: "Progressive 10–37%, worldwide taxation for citizens and residents.",
  },

  cit: {
    standardRate: 0.21,
    effectiveRate: 0.26,
    description: "21% federal corporate tax rate. State taxes average 4–8%, bringing effective rate to ~25–28%.",
  },

  wht: {
    dividends: 0.30,
    interest: 0.30,
    royalties: 0.30,
  },

  exemptions: [
    { id: "muni_bonds", label: "Municipal Bond Interest", description: "Interest from state and local government bonds is exempt from federal tax." },
    { id: "fringe_benefits", label: "Certain Fringe Benefits", description: "Employer-provided health insurance, retirement contributions, and certain fringe benefits." },
  ],

  reliefs: [
    { id: "child_credit", label: "Child Tax Credit", description: "Up to $2,000 per qualifying child under 17.", type: "credit", defaultValue: 2000 },
    { id: "eitc", label: "Earned Income Tax Credit", description: "Refundable credit for low-to-moderate income workers.", type: "credit" },
    { id: "mortgage_interest", label: "Mortgage Interest Deduction", description: "Deduct interest on mortgage up to $750,000.", type: "fixed" },
    { id: "standard_deduction", label: "Standard Deduction", description: "Standard deduction of $14,600 for single filers (2024).", type: "fixed", defaultValue: 14600 },
  ],

  taxAuthority: "Internal Revenue Service (IRS)",
  fiscalYear: "January 1 – December 31 (calendar year)",
};
