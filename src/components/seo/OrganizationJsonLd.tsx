import { Helmet } from "react-helmet-async";

const OrganizationJsonLd = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://taxkora.com/#organization",
    name: "TAXKORA",
    alternateName: "TAXKORA Nigeria Tax Calculator",
    url: "https://taxkora.com",
    logo: {
      "@type": "ImageObject",
      url: "https://taxkora.com/favicon.png",
      width: 512,
      height: 512,
    },
    description:
      "Nigeria's leading tax calculator and compliance platform. Calculate Nigerian tax rates 2026 including Personal Income Tax (PIT), Company Income Tax (CIT), VAT at 7.5%, PAYE, and Withholding Tax (WHT). Serving Nigerian businesses, freelancers, and SMEs across Lagos, Abuja, Port Harcourt, and all 36 states.",
    foundingDate: "2024",
    foundingLocation: {
      "@type": "Place",
      name: "Lagos, Nigeria",
    },
    areaServed: {
      "@type": "Country",
      name: "Nigeria",
      "@id": "https://www.wikidata.org/wiki/Q1033",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+234-707-770-6706",
        contactType: "customer service",
        email: "alphalinkprime@gmail.com",
        areaServed: "NG",
        availableLanguage: ["English", "Yoruba", "Igbo", "Hausa"],
      },
      {
        "@type": "ContactPoint",
        telephone: "+234-707-770-6706",
        contactType: "technical support",
        email: "alphalinkprime@gmail.com",
        areaServed: "NG",
        availableLanguage: ["English"],
      },
    ],
    sameAs: [
      "https://twitter.com/taxkora",
      "https://www.facebook.com/taxkora",
      "https://www.linkedin.com/company/taxkora",
      "https://www.instagram.com/taxkora",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lagos",
      addressRegion: "Lagos State",
      addressCountry: "NG",
      postalCode: "100001",
    },
    slogan: "Nigeria Tax Calculator - Calculate Your Tax Instantly",
    knowsAbout: [
      "Nigerian Tax Law",
      "Personal Income Tax Nigeria",
      "Company Income Tax Nigeria",
      "VAT Nigeria",
      "Withholding Tax Nigeria",
      "FIRS Compliance",
      "Tax Filing Nigeria",
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export default OrganizationJsonLd;
