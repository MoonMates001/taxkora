import { CountryTaxConfig } from "../countryTypes";

export const romaniaConfig: CountryTaxConfig = {
  countryName: "Romania",
  countryCode: "RO",
  currency: "RON",
  currencySymbol: "lei",
  locale: "ro-RO",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: Infinity, rate: 0.10, label: "Flat 10%" },
    ],
    worldwideIncome: true,
    description: "Flat 10% income tax rate.",
  },
  cit: { standardRate: 0.16, description: "16% standard; 1-3% micro-enterprise turnover tax." },
  wht: { dividends: 0.08, interest: 0.16, royalties: 0.16 },
  exemptions: [
    { id: "micro", label: "Micro-Enterprise Regime", description: "1-3% turnover tax for companies under €500K revenue." },
  ],
  reliefs: [
    { id: "rd_super", label: "R&D Super Deduction", description: "50% additional deduction on qualifying R&D expenses.", type: "percentage", defaultValue: 1.50 },
  ],
  taxAuthority: "Agenția Națională de Administrare Fiscală (ANAF)",
  fiscalYear: "January 1 – December 31",
};
