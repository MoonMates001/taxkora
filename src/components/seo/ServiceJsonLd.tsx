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
      "Accurate computation of Personal Income Tax using country-specific progressive tax brackets for 50+ countries. Includes local reliefs, deductions, and allowances.",
    url: "https://taxkora.com/dashboard/tax-computation",
  },
  {
    name: "Company Income Tax (CIT) Calculation",
    description:
      "Corporate tax calculation with country-specific rates and thresholds. Supports small business concessions, R&D credits, and industry-specific incentives.",
    url: "https://taxkora.com/dashboard/business-tax",
  },
  {
    name: "VAT Management & Filing",
    description:
      "Track VAT/GST input and output transactions with country-specific rates. Calculate monthly or quarterly liability and generate compliant returns.",
    url: "https://taxkora.com/dashboard/vat-returns",
  },
  {
    name: "Withholding Tax (WHT) Management",
    description:
      "Calculate and track Withholding Tax deductions using country-specific WHT rates for dividends, interest, royalties, and professional fees.",
    url: "https://taxkora.com/dashboard/wht-management",
  },
  {
    name: "Professional E-Invoicing",
    description:
      "Create and send professional branded invoices in any currency. Track payments, send automated reminders, and export to PDF.",
    url: "https://taxkora.com/dashboard/invoices",
  },
  {
    name: "Tax Filing Support",
    description:
      "Assisted tax filing with pre-filled forms and review tools. Support for local tax authority submissions across multiple jurisdictions.",
    url: "https://taxkora.com/dashboard/tax-filing",
  },
  {
    name: "Capital Asset Depreciation",
    description:
      "Track capital assets and compute annual depreciation allowances using country-specific capital allowance rules and rates.",
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
    serviceType: "Global Tax Compliance Software",
    provider: {
      "@id": "https://taxkora.com/#organization",
    },
    areaServed: [
      { "@type": "Country", name: "United States" },
      { "@type": "Country", name: "United Kingdom" },
      { "@type": "Country", name: "India" },
      { "@type": "Country", name: "Germany" },
      { "@type": "Country", name: "Nigeria" },
      { "@type": "Country", name: "Canada" },
      { "@type": "Country", name: "Australia" },
      { "@type": "Country", name: "France" },
      { "@type": "Country", name: "Singapore" },
      { "@type": "Country", name: "South Africa" },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "TAXKORA Global Tax Compliance Services",
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
        "Global Businesses",
        "SMEs",
        "Freelancers",
        "Accountants",
        "Entrepreneurs",
        "Self-Employed Professionals",
      ],
    },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: "https://taxkora.com",
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
