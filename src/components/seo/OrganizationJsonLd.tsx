import { Helmet } from "react-helmet-async";

const OrganizationJsonLd = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://taxkora.com/#organization",
    name: "TAXKORA",
    alternateName: "TAXKORA Global Tax Calculator",
    url: "https://taxkora.com",
    logo: {
      "@type": "ImageObject",
      url: "https://taxkora.com/favicon.png",
      width: 512,
      height: 512,
    },
    description:
      "Global tax calculator and compliance platform covering 50+ countries. Calculate PIT, CIT, VAT, and WHT with country-specific engines. Trusted by businesses, freelancers, and SMEs worldwide.",
    foundingDate: "2024",
    areaServed: [
      { "@type": "Country", name: "United States" },
      { "@type": "Country", name: "United Kingdom" },
      { "@type": "Country", name: "India" },
      { "@type": "Country", name: "Germany" },
      { "@type": "Country", name: "Nigeria" },
      { "@type": "Country", name: "Canada" },
      { "@type": "Country", name: "France" },
      { "@type": "Country", name: "Australia" },
      { "@type": "Country", name: "Singapore" },
      { "@type": "Country", name: "South Africa" },
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+234-707-770-6706",
        contactType: "customer service",
        email: "alphalinkprime@gmail.com",
        availableLanguage: ["English"],
      },
    ],
    sameAs: [
      "https://twitter.com/taxkora",
      "https://www.facebook.com/taxkora",
      "https://www.linkedin.com/company/taxkora",
      "https://www.instagram.com/taxkora",
    ],
    slogan: "Global Tax Compliance, Simplified",
    knowsAbout: [
      "International Tax Compliance",
      "Personal Income Tax",
      "Company Income Tax",
      "VAT Compliance",
      "Withholding Tax",
      "Multi-Country Tax Filing",
      "Tax Deduction Optimization",
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export default OrganizationJsonLd;
