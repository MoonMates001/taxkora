import { Helmet } from "react-helmet-async";

interface Service {
  name: string;
  description: string;
  url?: string;
}

interface ServiceJsonLdProps {
  services?: Service[];
}

const defaultServices: Service[] = [
  {
    name: "Personal Income Tax (PIT) Calculation",
    description:
      "Accurate computation of Personal Income Tax using Nigeria's progressive tax rates (7% to 24%). Includes Consolidated Relief Allowance (CRA), pension deductions, and rent relief calculations.",
    url: "https://taxkora.com/dashboard/tax-computation",
  },
  {
    name: "Company Income Tax (CIT) Calculation",
    description:
      "Corporate tax calculation based on company turnover. 0% for small companies (≤₦25m), 20% for medium (₦25m-₦100m), and 30% for large companies (>₦100m).",
    url: "https://taxkora.com/dashboard/business-tax",
  },
  {
    name: "VAT Management & Filing",
    description:
      "Track VAT input and output transactions, calculate monthly VAT liability at 7.5%, and file returns to FIRS. NRS-compliant monthly VAT return generation.",
    url: "https://taxkora.com/dashboard/vat-returns",
  },
  {
    name: "Withholding Tax (WHT) Management",
    description:
      "Calculate and track Withholding Tax deductions on payments. Supports all WHT categories including dividends, interest, royalties, rent, and professional fees.",
    url: "https://taxkora.com/dashboard/wht-management",
  },
  {
    name: "Professional E-Invoicing",
    description:
      "Create and send professional branded invoices. Track payments, send automated reminders, and export to PDF. Unlimited invoicing with VAT calculation.",
    url: "https://taxkora.com/dashboard/invoices",
  },
  {
    name: "Tax Filing & TCC Support",
    description:
      "Assisted tax filing service with pre-filled forms and review tools. Support for Tax Clearance Certificate (TCC) generation and FIRS/SIRS submissions.",
    url: "https://taxkora.com/dashboard/tax-filing",
  },
  {
    name: "Capital Asset Depreciation",
    description:
      "Track capital assets and compute annual depreciation allowances. Optimize tax deductions with proper capital allowance calculations per Nigerian tax law.",
    url: "https://taxkora.com/dashboard/capital-assets",
  },
  {
    name: "Income & Expense Tracking",
    description:
      "Categorize business transactions automatically with smart categories. Upload receipts, generate financial reports, and maintain audit-ready records.",
    url: "https://taxkora.com/dashboard/expenses",
  },
];

const ServiceJsonLd = ({ services = defaultServices }: ServiceJsonLdProps) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://taxkora.com/#service",
    serviceType: "Tax Compliance Software",
    provider: {
      "@id": "https://taxkora.com/#organization",
    },
    areaServed: {
      "@type": "Country",
      name: "Nigeria",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "TAXKORA Tax Compliance Services",
      itemListElement: services.map((service, index) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.name,
          description: service.description,
          url: service.url,
        },
        position: index + 1,
      })),
    },
    audience: {
      "@type": "Audience",
      audienceType: [
        "Nigerian Businesses",
        "Nigerian SMEs",
        "Nigerian Freelancers",
        "Nigerian Accountants",
        "Nigerian Entrepreneurs",
        "Self-Employed Nigerians",
      ],
    },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: "https://taxkora.com",
      servicePhone: "+234-707-770-6706",
      availableLanguage: ["English"],
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export default ServiceJsonLd;
