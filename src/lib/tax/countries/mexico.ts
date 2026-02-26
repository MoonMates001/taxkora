import { CountryTaxConfig } from "../countryTypes";

export const mexicoConfig: CountryTaxConfig = {
  countryName: "Mexico",
  countryCode: "MX",
  currency: "MXN",
  currencySymbol: "$",
  locale: "es-MX",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 8952.49, rate: 0.0192, label: "1.92%" },
      { min: 8952.49, max: 75984.55, rate: 0.0640, label: "6.40%" },
      { min: 75984.55, max: 133536.07, rate: 0.1088, label: "10.88%" },
      { min: 133536.07, max: 155229.80, rate: 0.16, label: "16%" },
      { min: 155229.80, max: 185852.57, rate: 0.1792, label: "17.92%" },
      { min: 185852.57, max: 374837.88, rate: 0.2136, label: "21.36%" },
      { min: 374837.88, max: 590795.99, rate: 0.2352, label: "23.52%" },
      { min: 590795.99, max: 1127926.84, rate: 0.30, label: "30%" },
      { min: 1127926.84, max: 1503902.46, rate: 0.32, label: "32%" },
      { min: 1503902.46, max: 4511707.37, rate: 0.34, label: "34%" },
      { min: 4511707.37, max: Infinity, rate: 0.35, label: "35%" },
    ],
    worldwideIncome: true,
    description: "Progressive 1.92–35% on worldwide income.",
  },
  cit: { standardRate: 0.30, description: "30% corporate income tax rate." },
  wht: { dividends: 0.10, interest: 0.049, royalties: 0.35 },
  exemptions: [
    { id: "pension_exempt", label: "Certain Pensions", description: "Qualified pension income is partially exempt." },
  ],
  reliefs: [
    { id: "employment_subsidy", label: "Employment Subsidy", description: "Tax subsidy for low-income employees.", type: "credit", defaultValue: 0 },
  ],
  taxAuthority: "Servicio de Administración Tributaria (SAT)",
  fiscalYear: "January 1 – December 31",
};
