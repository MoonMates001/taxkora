import { CountryTaxConfig } from "../countryTypes";

export const indiaConfig: CountryTaxConfig = {
  countryName: "India",
  countryCode: "IN",
  currency: "INR",
  currencySymbol: "₹",
  locale: "en-IN",

  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 400000, rate: 0, label: "Up to ₹4,00,000" },
      { min: 400000, max: 800000, rate: 0.05, label: "₹4,00,001 – ₹8,00,000" },
      { min: 800000, max: 1200000, rate: 0.10, label: "₹8,00,001 – ₹12,00,000" },
      { min: 1200000, max: 1600000, rate: 0.15, label: "₹12,00,001 – ₹16,00,000" },
      { min: 1600000, max: 2000000, rate: 0.20, label: "₹16,00,001 – ₹20,00,000" },
      { min: 2000000, max: 2400000, rate: 0.25, label: "₹20,00,001 – ₹24,00,000" },
      { min: 2400000, max: Infinity, rate: 0.30, label: "Above ₹24,00,000" },
    ],
    surcharge: 0.04,
    surchargeLabel: "Health & Education Cess (4%)",
    worldwideIncome: true,
    description: "Progressive 0–30% under new regime + 4% health & education cess. Residency >182 days.",
  },

  cit: {
    standardRate: 0.22,
    smeRate: 0.15,
    description: "22% for domestic companies (+ surcharge & cess ~25.17% effective). 15% for new manufacturing companies.",
  },

  wht: {
    dividends: 0.20,
    interest: 0.20,
    royalties: 0.10,
    professionalFees: 0.10,
    rent: 0.10,
  },

  exemptions: [
    { id: "agri_income", label: "Agricultural Income", description: "Income from agricultural operations is fully exempt from tax." },
    { id: "hra", label: "House Rent Allowance", description: "Partial exemption on HRA for salaried employees (old regime)." },
  ],

  reliefs: [
    { id: "sec80c", label: "Section 80C Deductions", description: "Deductions up to ₹1,50,000 for investments in PPF, ELSS, etc. (old regime).", type: "fixed", defaultValue: 150000 },
    { id: "sec80d", label: "Section 80D Health Insurance", description: "Deductions up to ₹25,000 for health insurance premiums.", type: "fixed", defaultValue: 25000 },
    { id: "standard_deduction", label: "Standard Deduction", description: "₹75,000 standard deduction for salaried employees (new regime).", type: "fixed", defaultValue: 75000 },
  ],

  taxAuthority: "Central Board of Direct Taxes (CBDT)",
  fiscalYear: "April 1 – March 31",
};
