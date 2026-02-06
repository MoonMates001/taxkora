import { Helmet } from "react-helmet-async";

const SoftwareApplicationJsonLd = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": "https://taxkora.com/#software",
    name: "TAXKORA Nigeria Tax Calculator",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Tax Calculator Software",
    operatingSystem: "Web Browser, Android, iOS",
    availableOnDevice: ["Desktop", "Mobile", "Tablet"],
    countriesSupported: "Nigeria",
    provider: {
      "@id": "https://taxkora.com/#organization",
    },
    offers: [
      {
        "@type": "Offer",
        name: "Individual PIT Plan",
        price: "2500",
        priceCurrency: "NGN",
        priceValidUntil: "2026-12-31",
        description:
          "Personal income tax compliance for employed individuals",
        eligibleRegion: {
          "@type": "Country",
          name: "Nigeria",
        },
        availability: "https://schema.org/InStock",
        hasFreeTrialPeriod: true,
        freeTrialPeriodValue: {
          "@type": "QuantitativeValue",
          value: 90,
          unitCode: "DAY",
        },
      },
      {
        "@type": "Offer",
        name: "Business PIT Plan",
        price: "7500",
        priceCurrency: "NGN",
        priceValidUntil: "2026-12-31",
        description: "Complete tax compliance for SMEs, freelancers, and self-employed",
        eligibleRegion: {
          "@type": "Country",
          name: "Nigeria",
        },
        availability: "https://schema.org/InStock",
        hasFreeTrialPeriod: true,
        freeTrialPeriodValue: {
          "@type": "QuantitativeValue",
          value: 90,
          unitCode: "DAY",
        },
      },
      {
        "@type": "Offer",
        name: "Companies Income Tax Plan",
        price: "25000",
        priceCurrency: "NGN",
        priceValidUntil: "2026-12-31",
        description:
          "Enterprise tax compliance for incorporated businesses",
        eligibleRegion: {
          "@type": "Country",
          name: "Nigeria",
        },
        availability: "https://schema.org/InStock",
        hasFreeTrialPeriod: true,
        freeTrialPeriodValue: {
          "@type": "QuantitativeValue",
          value: 90,
          unitCode: "DAY",
        },
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "10000",
      bestRating: "5",
      worstRating: "1",
      reviewCount: "8500",
    },
    featureList: [
      "Nigeria Tax Calculator Online 2026",
      "Personal Income Tax Calculator Nigeria",
      "Company Income Tax Calculator Nigeria",
      "VAT Calculator Nigeria (7.5%)",
      "PAYE Tax Rates Calculator Nigeria",
      "Withholding Tax Calculator Nigeria",
      "Tax Relief & Deductions Calculator Nigeria",
      "Freelancer Tax Calculator Nigeria",
      "Small Business Tax Calculator Nigeria",
      "FIRS/NRS Compliant Tax Filing",
      "Tax Identification Number (TIN) Guide",
      "Nigerian Tax Deadlines Tracker",
      "Capital Allowance Computation",
      "Professional E-Invoicing",
      "Income & Expense Tracking",
    ],
    screenshot: "https://taxkora.com/favicon.png",
    softwareHelp: "https://taxkora.com/blog",
    releaseNotes: "https://taxkora.com/blog",
    permissions: "Internet access required",
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export default SoftwareApplicationJsonLd;
