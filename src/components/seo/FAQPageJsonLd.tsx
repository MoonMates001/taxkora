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
    question: "How does TAXKORA calculate taxes for different countries?",
    answer:
      "TAXKORA uses country-specific tax engines for 50+ countries. Each engine includes the latest PIT brackets, CIT rates, VAT/GST rates, and WHT schedules for that jurisdiction. When you set your country of residence in your profile, the platform automatically applies the correct tax rules, currency, and deduction categories.",
  },
  {
    question: "What countries does TAXKORA support?",
    answer:
      "TAXKORA supports 50+ countries including the United States, United Kingdom, India, Germany, Canada, France, Australia, Japan, Brazil, Nigeria, Singapore, South Africa, UAE, and many more across Europe, Asia, Africa, and the Americas. New countries are added regularly.",
  },
  {
    question: "Can I use TAXKORA if I earn income in multiple countries?",
    answer:
      "Yes. While your primary tax computation uses your country of residence, TAXKORA tracks income from multiple sources and helps you understand withholding tax implications for cross-border payments including dividends, interest, and royalties.",
  },
  {
    question: "What types of taxes can TAXKORA calculate?",
    answer:
      "TAXKORA calculates Personal Income Tax (PIT) with progressive brackets, Company Income Tax (CIT), Value Added Tax (VAT/GST), and Withholding Tax (WHT) on dividends, interest, and royalties — all using country-specific rates and rules.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes! TAXKORA offers a generous 90-day free trial with full access to all features. No credit card is required to start. After the trial, choose from Individual, Business, or Enterprise plans based on your needs.",
  },
  {
    question: "How secure is my financial data on TAXKORA?",
    answer:
      "TAXKORA uses bank-level encryption to protect your data. All financial information is encrypted at rest and in transit. We implement Row Level Security so only you can access your data. We never share your information with third parties.",
  },
  {
    question: "Can I generate invoices in different currencies?",
    answer:
      "Yes. TAXKORA supports invoicing in any currency. Your dashboard displays amounts in your local currency based on your country of residence, and you can create invoices for international clients in their preferred currency.",
  },
  {
    question: "Does TAXKORA file taxes directly with tax authorities?",
    answer:
      "TAXKORA provides assisted filing support with pre-filled forms and review tools. The platform generates tax-authority-compliant computations and summaries that you can submit to your local tax authority. Direct e-filing is available in select jurisdictions.",
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
