import { Helmet } from "react-helmet-async";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQPageJsonLdProps {
  faqs?: FAQItem[];
}

const defaultFAQs: FAQItem[] = [
  {
    question: "How to calculate tax in Nigeria?",
    answer:
      "To calculate tax in Nigeria, you need to determine your taxable income and apply the relevant tax rates. For Personal Income Tax (PIT), Nigeria uses progressive rates from 7% to 24%. For Company Income Tax (CIT), rates are 0% for small companies (turnover ≤₦25m), 20% for medium (₦25m-₦100m), and 30% for large companies. TAXKORA provides a free Nigeria tax calculator online that automatically computes your PIT, CIT, VAT (7.5%), PAYE, and Withholding Tax.",
  },
  {
    question: "What are the Nigeria tax rates for 2026?",
    answer:
      "Nigeria tax rates 2026 include: Personal Income Tax (PIT) at progressive rates of 7%, 11%, 15%, 19%, 21%, and 24%; Company Income Tax (CIT) at 0%, 20%, or 30% based on turnover; VAT at 7.5%; Withholding Tax (WHT) at 5-10% depending on payment type; and PAYE following PIT brackets. Use TAXKORA's free Nigeria tax calculator to compute your exact tax liability.",
  },
  {
    question: "Do freelancers pay tax in Nigeria?",
    answer:
      "Yes, freelancers in Nigeria are required to pay Personal Income Tax (PIT) on their earnings. Freelancers must file annual tax returns with their State Inland Revenue Service (SIRS). They can claim tax relief deductions including consolidated relief allowance (CRA), pension contributions, and rent relief. TAXKORA helps Nigerian freelancers calculate their tax, track expenses, and stay compliant with filing requirements.",
  },
  {
    question: "What is the VAT rate in Nigeria 2026?",
    answer:
      "The VAT rate in Nigeria for 2026 is 7.5%. VAT-registered businesses must file monthly returns by the 21st of the following month. TAXKORA automatically calculates your VAT liability, tracks input and output VAT, and helps with VAT registration and compliance in Nigeria.",
  },
  {
    question: "How to get a Tax Identification Number (TIN) in Nigeria?",
    answer:
      "To get a TIN in Nigeria, register through the Joint Tax Board (JTB) TIN Registration portal or visit any Federal Inland Revenue Service (FIRS) office. For individuals, you need a valid ID and BVN. For companies, you need your CAC registration documents. TAXKORA helps Nigerian businesses manage their TIN and stay compliant with tax filing requirements.",
  },
  {
    question: "What are the withholding tax rates in Nigeria?",
    answer:
      "Withholding Tax (WHT) rates in Nigeria vary by payment type: Dividends (10%), Interest (10%), Royalties (10%), Rent (10%), Professional/Consulting Fees (10% for companies, 5% for individuals), and Construction Contracts (5%). WHT must be remitted to FIRS by the 21st of the month. TAXKORA calculates WHT automatically and generates NRS-compliant schedules.",
  },
  {
    question: "What is the minimum taxable income in Nigeria?",
    answer:
      "In Nigeria, individuals earning below the minimum wage (currently ₦70,000/month or ₦840,000/year) are exempt from Personal Income Tax. The Consolidated Relief Allowance (CRA) of ₦200,000 or 1% of gross income (whichever is higher) plus 20% of gross income is deducted before tax calculation. TAXKORA's Nigeria tax calculator automatically applies all statutory reliefs.",
  },
  {
    question: "How to file personal tax returns in Nigeria?",
    answer:
      "To file personal tax returns in Nigeria: 1) Obtain your TIN, 2) Calculate your taxable income after reliefs, 3) Complete the appropriate FIRS/SIRS tax return form, 4) Pay any tax due via designated bank channels, 5) Submit returns by March 31st of the following year. TAXKORA automates tax computation and helps you file returns accurately and on time.",
  },
  {
    question: "What are the Company Income Tax rates in Nigeria?",
    answer:
      "Company Income Tax (CIT) rates in Nigeria are based on annual turnover: Small companies (≤₦25m) pay 0%, Medium companies (₦25m-₦100m) pay 20%, and Large companies (>₦100m) pay 30%. Companies must file returns within 6 months of their financial year-end. TAXKORA helps Nigerian companies calculate CIT, track allowable deductions, and maintain compliance.",
  },
  {
    question: "What are tax compliance requirements for SMEs in Nigeria?",
    answer:
      "Nigerian SMEs must: 1) Register for TIN with FIRS, 2) Register for VAT if turnover exceeds ₦25m, 3) File monthly VAT returns, 4) Remit WHT deductions monthly, 5) File annual income tax returns, 6) Keep proper books and records for 6 years. TAXKORA provides a complete tax compliance solution for Nigerian SMEs and startups with automated calculations, reminders, and filing support.",
  },
];

const FAQPageJsonLd = ({ faqs = defaultFAQs }: FAQPageJsonLdProps) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://taxkora.com/#faq",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export default FAQPageJsonLd;
