import { CountryTaxConfig } from "../countryTypes";

export const portugalConfig: CountryTaxConfig = {
  countryName: "Portugal",
  countryCode: "PT",
  currency: "EUR",
  currencySymbol: "€",
  locale: "pt-PT",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 7703, rate: 0.145, label: "€0 – €7,703" },
      { min: 7703, max: 11623, rate: 0.21, label: "€7,704 – €11,623" },
      { min: 11623, max: 16472, rate: 0.265, label: "€11,624 – €16,472" },
      { min: 16472, max: 21321, rate: 0.285, label: "€16,473 – €21,321" },
      { min: 21321, max: 27146, rate: 0.35, label: "€21,322 – €27,146" },
      { min: 27146, max: 39791, rate: 0.37, label: "€27,147 – €39,791" },
      { min: 39791, max: 51997, rate: 0.435, label: "€39,792 – €51,997" },
      { min: 51997, max: 81199, rate: 0.45, label: "€51,998 – €81,199" },
      { min: 81199, max: Infinity, rate: 0.48, label: "Over €81,199" },
    ],
    worldwideIncome: true,
    description: "Progressive 14.5–48% on worldwide income.",
  },
  cit: { standardRate: 0.21, description: "21% standard corporate income tax rate." },
  wht: { dividends: 0.28, interest: 0.28, royalties: 0.25 },
  exemptions: [
    { id: "nhr", label: "Non-Habitual Resident Regime", description: "Special 20% flat rate for qualifying NHR taxpayers." },
  ],
  reliefs: [
    { id: "rd_incentives", label: "R&D Incentives (SIFIDE)", description: "Tax credits for qualifying R&D activities.", type: "credit", defaultValue: 0 },
  ],
  taxAuthority: "Autoridade Tributária e Aduaneira (AT)",
  fiscalYear: "January 1 – December 31",
};
