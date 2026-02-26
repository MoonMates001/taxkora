import { CountryTaxConfig } from "../countryTypes";

export const southKoreaConfig: CountryTaxConfig = {
  countryName: "South Korea",
  countryCode: "KR",
  currency: "KRW",
  currencySymbol: "₩",
  locale: "ko-KR",
  pit: {
    type: "progressive",
    brackets: [
      { min: 0, max: 14000000, rate: 0.06, label: "₩0 – ₩14M" },
      { min: 14000000, max: 50000000, rate: 0.15, label: "₩14M – ₩50M" },
      { min: 50000000, max: 88000000, rate: 0.24, label: "₩50M – ₩88M" },
      { min: 88000000, max: 150000000, rate: 0.35, label: "₩88M – ₩150M" },
      { min: 150000000, max: 300000000, rate: 0.38, label: "₩150M – ₩300M" },
      { min: 300000000, max: 500000000, rate: 0.40, label: "₩300M – ₩500M" },
      { min: 500000000, max: 1000000000, rate: 0.42, label: "₩500M – ₩1B" },
      { min: 1000000000, max: Infinity, rate: 0.45, label: "Over ₩1B" },
    ],
    worldwideIncome: true,
    description: "Progressive 6–45% on worldwide income.",
  },
  cit: { standardRate: 0.25, description: "25% top rate; lower rates for smaller profits." },
  wht: { dividends: 0.22, interest: 0.154, royalties: 0.22 },
  exemptions: [
    { id: "pension_exempt", label: "Pension Income Exemptions", description: "Partial exemption on pension income." },
  ],
  reliefs: [
    { id: "earned_income", label: "Earned Income Credit", description: "Tax credit for qualifying earned income.", type: "credit", defaultValue: 0 },
  ],
  taxAuthority: "National Tax Service (NTS)",
  fiscalYear: "January 1 – December 31",
};
