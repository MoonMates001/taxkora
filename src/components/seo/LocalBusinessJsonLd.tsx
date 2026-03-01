import { Helmet } from "react-helmet-async";

const LocalBusinessJsonLd = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://taxkora.com/#localbusiness",
    name: "TAXKORA Nigeria - Tax Calculator & Compliance",
    image: "https://taxkora.com/favicon.png",
    url: "https://taxkora.com",
    telephone: "+234-707-770-6706",
    email: "alphalinkprime@gmail.com",
    priceRange: "₦₦",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lagos",
      addressRegion: "Lagos State",
      addressCountry: "NG",
      postalCode: "100001",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 6.5244,
      longitude: 3.3792,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    areaServed: [
      { "@type": "State", name: "Lagos" },
      { "@type": "State", name: "Abuja FCT" },
      { "@type": "State", name: "Rivers" },
      { "@type": "State", name: "Kano" },
      { "@type": "State", name: "Oyo" },
      { "@type": "State", name: "Delta" },
      { "@type": "State", name: "Kaduna" },
      { "@type": "State", name: "Enugu" },
      { "@type": "State", name: "Anambra" },
      { "@type": "State", name: "Ogun" },
      { "@type": "Country", name: "Nigeria" },
    ],
    serviceType: [
      "Nigeria Tax Calculator",
      "Tax Compliance Software",
      "E-Invoicing Nigeria",
      "FIRS Filing",
      "VAT Filing Nigeria",
      "WHT Management",
      "Personal Income Tax Calculator",
      "Company Income Tax Calculator",
    ],
    paymentAccepted: ["Cash", "Bank Transfer", "Credit Card", "Debit Card"],
    currenciesAccepted: "NGN",
    hasMap: "https://www.google.com/maps?q=Lagos,Nigeria",
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export default LocalBusinessJsonLd;
