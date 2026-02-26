import { CountryTaxConfig } from "../countryTypes";

export const bangladeshConfig: CountryTaxConfig = {
  countryName: "Bangladesh",
  countryCode: "BD",
  currency: "BDT",
  currencySymbol: "৳",
  locale: "bn-BD",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 350000, rate: 0, label: "Exempt (৳0 – ৳350,000)" },
      { min: 350000, max: 450000, rate: 0.05, label: "৳350,001 – ৳450,000" },
      { min: 450000, max: 750000, rate: 0.10, label: "৳450,001 – ৳750,000" },
      { min: 750000, max: 1150000, rate: 0.15, label: "৳750,001 – ৳1,150,000" },
      { min: 1150000, max: 1650000, rate: 0.20, label: "৳1,150,001 – ৳1,650,000" },
      { min: 1650000, max: Infinity, rate: 0.25, label: "Over ৳1,650,000" },
    ],
    worldwideIncome: true,
    description: "Progressive 0–30% with tax-free threshold of ৳350,000.",
  },
  cit: { standardRate: 0.275, description: "27.5% for listed; 30% for non-listed companies." },
  wht: { dividends: 0.20, interest: 0.20, royalties: 0.20 },
  exemptions: [
    { id: "export_sector", label: "Export Sector Exemptions", description: "Export-oriented industries enjoy tax holidays." },
  ],
  reliefs: [
    { id: "tax_holiday", label: "Tax Holidays", description: "Tax exemption for specified industries and zones.", type: "percentage", defaultValue: 0 },
  ],
  taxAuthority: "National Board of Revenue (NBR)",
  fiscalYear: "July 1 – June 30",
};
