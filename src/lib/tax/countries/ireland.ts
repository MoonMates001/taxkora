import { CountryTaxConfig } from "../countryTypes";

export const irelandConfig: CountryTaxConfig = {
  countryName: "Ireland",
  countryCode: "IE",
  currency: "EUR",
  currencySymbol: "€",
  locale: "en-IE",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 42000, rate: 0.20, label: "€0 – €42,000 (20%)" },
      { min: 42000, max: Infinity, rate: 0.40, label: "Over €42,000 (40%)" },
    ],
    worldwideIncome: true,
    description: "Progressive 20–40% plus USC and PRSI.",
  },
  cit: { standardRate: 0.125, description: "12.5% on trading income; 25% on non-trading income." },
  wht: { dividends: 0.25, interest: 0.20, royalties: 0.20 },
  exemptions: [
    { id: "ip_exemption", label: "IP Income Partial Exemption", description: "Knowledge Development Box provides 10% rate on qualifying IP income." },
  ],
  reliefs: [
    { id: "rd_credit", label: "R&D Tax Credit", description: "25% tax credit on qualifying R&D expenditure.", type: "credit", defaultValue: 0 },
  ],
  taxAuthority: "Revenue Commissioners",
  fiscalYear: "January 1 – December 31",
};
