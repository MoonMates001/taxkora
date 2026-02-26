import { CountryTaxConfig } from "../countryTypes";

export const switzerlandConfig: CountryTaxConfig = {
  countryName: "Switzerland",
  countryCode: "CH",
  currency: "CHF",
  currencySymbol: "CHF",
  locale: "de-CH",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 14500, rate: 0, label: "CHF 0 – CHF 14,500 (0%)" },
      { min: 14500, max: 31600, rate: 0.0077, label: "CHF 14,501 – CHF 31,600" },
      { min: 31600, max: 41400, rate: 0.0088, label: "CHF 31,601 – CHF 41,400" },
      { min: 41400, max: 55200, rate: 0.0266, label: "CHF 41,401 – CHF 55,200" },
      { min: 55200, max: 72800, rate: 0.0299, label: "CHF 55,201 – CHF 72,800" },
      { min: 72800, max: 78100, rate: 0.0522, label: "CHF 72,801 – CHF 78,100" },
      { min: 78100, max: 103600, rate: 0.0633, label: "CHF 78,101 – CHF 103,600" },
      { min: 103600, max: 134600, rate: 0.0783, label: "CHF 103,601 – CHF 134,600" },
      { min: 134600, max: 176000, rate: 0.0883, label: "CHF 134,601 – CHF 176,000" },
      { min: 176000, max: 755200, rate: 0.11, label: "CHF 176,001 – CHF 755,200" },
      { min: 755200, max: Infinity, rate: 0.115, label: "Over CHF 755,200" },
    ],
    worldwideIncome: true,
    description: "Progressive federal rates plus cantonal/municipal taxes; effective 12–21%.",
  },
  cit: { standardRate: 0.145, description: "~14.5% federal; effective 12–21% including cantonal taxes." },
  wht: { dividends: 0.35, interest: 0.35, royalties: 0 },
  exemptions: [
    { id: "private_capital_gains", label: "Private Capital Gains", description: "Capital gains on private movable assets are generally tax-free." },
  ],
  reliefs: [
    { id: "rd_deduction", label: "R&D Deductions", description: "Cantonal R&D super-deductions up to 150%.", type: "percentage", defaultValue: 1.50 },
  ],
  taxAuthority: "Federal Tax Administration (FTA)",
  fiscalYear: "January 1 – December 31",
};
