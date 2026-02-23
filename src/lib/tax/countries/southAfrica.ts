import { CountryTaxConfig } from "../countryTypes";

export const southAfricaConfig: CountryTaxConfig = {
  countryName: "South Africa",
  countryCode: "ZA",
  currency: "ZAR",
  currencySymbol: "R",
  locale: "en-ZA",

  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 237100, rate: 0.18, label: "R0 – R237,100" },
      { min: 237100, max: 370500, rate: 0.26, label: "R237,101 – R370,500" },
      { min: 370500, max: 512800, rate: 0.31, label: "R370,501 – R512,800" },
      { min: 512800, max: 673000, rate: 0.36, label: "R512,801 – R673,000" },
      { min: 673000, max: 857900, rate: 0.39, label: "R673,001 – R857,900" },
      { min: 857900, max: 1817000, rate: 0.41, label: "R857,901 – R1,817,000" },
      { min: 1817000, max: Infinity, rate: 0.45, label: "Over R1,817,000" },
    ],
    worldwideIncome: true,
    description: "Progressive 18–45% on worldwide income for residents.",
  },

  cit: {
    standardRate: 0.27,
    smeRate: 0.00,
    smeThreshold: 95750,
    description: "27% standard rate. Small business corporations get progressive rates: 0% on first R95,750.",
  },

  wht: {
    dividends: 0.20,
    interest: 0.15,
    royalties: 0.15,
  },

  exemptions: [
    { id: "small_business", label: "Small Business Relief", description: "Micro businesses with turnover under R1 million qualify for turnover tax." },
    { id: "interest_exemption", label: "Interest Income Exemption", description: "First R23,800 of interest income is exempt (R34,500 for 65+)." },
  ],

  reliefs: [
    { id: "primary_rebate", label: "Primary Rebate", description: "R17,235 tax rebate for all taxpayers.", type: "credit", defaultValue: 17235 },
    { id: "medical_credit", label: "Medical Tax Credit", description: "Monthly credit of R364 for main member + R364 for first dependent.", type: "credit", defaultValue: 4368 },
    { id: "rd_deduction", label: "R&D 150% Deduction", description: "150% deduction on qualifying R&D expenditure.", type: "percentage", defaultValue: 1.50 },
  ],

  taxAuthority: "South African Revenue Service (SARS)",
  fiscalYear: "March 1 – February 28/29",
};
