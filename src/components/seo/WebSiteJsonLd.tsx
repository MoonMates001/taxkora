import { Helmet } from "react-helmet-async";

const WebSiteJsonLd = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://taxkora.com/#website",
    url: "https://taxkora.com",
    name: "TAXKORA Nigeria",
    alternateName: "TAXKORA - Nigeria Tax Calculator",
    description:
      "Nigeria's #1 tax compliance software. Calculate Nigerian tax rates 2026, file personal income tax, company income tax, VAT & withholding tax.",
    publisher: {
      "@id": "https://taxkora.com/#organization",
    },
    potentialAction: [
      {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://taxkora.com/blog?search={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    ],
    inLanguage: "en-NG",
    copyrightYear: new Date().getFullYear(),
    copyrightHolder: {
      "@id": "https://taxkora.com/#organization",
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export default WebSiteJsonLd;
