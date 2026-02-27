import { Helmet } from "react-helmet-async";

const LocalBusinessJsonLd = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://taxkora.com/#localbusiness",
    name: "TAXKORA – Global Tax Compliance Platform",
    image: "https://taxkora.com/favicon.png",
    url: "https://taxkora.com",
    telephone: "+234-707-770-6706",
    email: "alphalinkprime@gmail.com",
    areaServed: [
      { "@type": "Country", name: "United States" },
      { "@type": "Country", name: "United Kingdom" },
      { "@type": "Country", name: "India" },
      { "@type": "Country", name: "Germany" },
      { "@type": "Country", name: "Nigeria" },
      { "@type": "Country", name: "Canada" },
      { "@type": "Country", name: "France" },
      { "@type": "Country", name: "Australia" },
      { "@type": "Country", name: "Japan" },
      { "@type": "Country", name: "Brazil" },
    ],
    serviceType: [
      "Global Tax Calculator",
      "Tax Compliance Software",
      "E-Invoicing",
      "VAT Filing",
      "WHT Management",
      "Personal Income Tax Calculator",
      "Company Income Tax Calculator",
      "Multi-Country Tax Filing",
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export default LocalBusinessJsonLd;
