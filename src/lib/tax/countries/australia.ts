import { CountryTaxConfig } from "../countryTypes";

export const australiaConfig: CountryTaxConfig = {
  countryName: "Australia",
  countryCode: "AU",
  currency: "AUD",
  currencySymbol: "A$",
  locale: "en-AU",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 18200, rate: 0, label: "Tax-free threshold (A$0 – A$18,200)" },
      { min: 18200, max: 45000, rate: 0.16, label: "A$18,201 – A$45,000" },
      { min: 45000, max: 135000, rate: 0.30, label: "A$45,001 – A$135,000" },
      { min: 135000, max: 190000, rate: 0.37, label: "A$135,001 – A$190,000" },
      { min: 190000, max: Infinity, rate: 0.45, label: "Over A$190,000" },
    ],
    worldwideIncome: true,
    description: "Progressive 0–45% with tax-free threshold of A$18,200.",
  },
  cit: { standardRate: 0.30, smeRate: 0.25, smeThreshold: 50000000, description: "30% standard; 25% for small business entities." },
  wht: { dividends: 0.30, interest: 0.10, royalties: 0.30 },
  exemptions: [
    { id: "super", label: "Superannuation", description: "Certain superannuation income is tax-exempt." },
  ],
  reliefs: [
    { id: "imputation", label: "Franking/Imputation Credits", description: "Tax credits for company tax already paid on dividends.", type: "credit", defaultValue: 0 },
  ],
  taxAuthority: "Australian Taxation Office (ATO)",
  fiscalYear: "July 1 – June 30",
};
