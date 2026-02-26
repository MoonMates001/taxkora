import { CountryTaxConfig } from "../countryTypes";

export const norwayConfig: CountryTaxConfig = {
  countryName: "Norway",
  countryCode: "NO",
  currency: "NOK",
  currencySymbol: "kr",
  locale: "nb-NO",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 208050, rate: 0.22, label: "Flat rate 22%" },
      { min: 208050, max: 292850, rate: 0.239, label: "Step 1: +1.7%" },
      { min: 292850, max: 670000, rate: 0.262, label: "Step 2: +4%" },
      { min: 670000, max: 937900, rate: 0.352, label: "Step 3: +13.2%" },
      { min: 937900, max: 1350000, rate: 0.362, label: "Step 4: +16.2%" },
      { min: 1350000, max: Infinity, rate: 0.382, label: "Step 5: +17.2%" },
    ],
    worldwideIncome: true,
    description: "22% flat + bracket surtax up to 38.2%.",
  },
  cit: { standardRate: 0.22, description: "22% corporate income tax rate." },
  wht: { dividends: 0.25, interest: 0, royalties: 0 },
  exemptions: [
    { id: "capital_gains_partial", label: "Certain Capital Gains", description: "Participation exemption for qualifying shareholdings." },
  ],
  reliefs: [
    { id: "skattefunn", label: "SkatteFUNN R&D", description: "19-20% tax credit on qualifying R&D expenses.", type: "credit", defaultValue: 0 },
  ],
  taxAuthority: "Skatteetaten",
  fiscalYear: "January 1 – December 31",
};
