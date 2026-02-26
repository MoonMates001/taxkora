import { CountryTaxConfig } from "../countryTypes";

export const brazilConfig: CountryTaxConfig = {
  countryName: "Brazil",
  countryCode: "BR",
  currency: "BRL",
  currencySymbol: "R$",
  locale: "pt-BR",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 26963.20, rate: 0, label: "Exempt (up to R$26,963)" },
      { min: 26963.20, max: 33919.80, rate: 0.075, label: "7.5%" },
      { min: 33919.80, max: 45012.60, rate: 0.15, label: "15%" },
      { min: 45012.60, max: 55976.16, rate: 0.225, label: "22.5%" },
      { min: 55976.16, max: Infinity, rate: 0.275, label: "27.5%" },
    ],
    worldwideIncome: true,
    description: "Progressive 0–27.5% on worldwide income for residents.",
  },
  cit: { standardRate: 0.34, description: "15% IRPJ + 10% surcharge + 9% CSLL = ~34% combined." },
  wht: { dividends: 0, interest: 0.15, royalties: 0.15 },
  exemptions: [
    { id: "simples", label: "Simples Nacional", description: "Simplified regime for small businesses with reduced rates." },
  ],
  reliefs: [
    { id: "education", label: "Education Deduction", description: "Annual deduction for education expenses.", type: "fixed", defaultValue: 3561.50 },
    { id: "medical", label: "Medical Deductions", description: "Unlimited deduction for qualifying medical expenses.", type: "percentage", defaultValue: 1.0 },
  ],
  taxAuthority: "Receita Federal do Brasil",
  fiscalYear: "January 1 – December 31",
};
