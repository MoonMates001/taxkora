import { Helmet } from "react-helmet-async";

interface WebPageJsonLdProps {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  datePublished?: string;
  dateModified?: string;
}

const WebPageJsonLd = ({
  title,
  description,
  url,
  imageUrl,
  datePublished,
  dateModified,
}: WebPageJsonLdProps) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url: url,
    name: title,
    description: description,
    isPartOf: {
      "@type": "WebSite",
      "@id": "https://taxkora.com/#website",
      url: "https://taxkora.com",
      name: "TAXKORA Nigeria",
      description: "Nigeria's leading tax calculator and compliance platform",
      publisher: {
        "@type": "Organization",
        "@id": "https://taxkora.com/#organization"
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://taxkora.com/blog?search={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      },
      inLanguage: "en-NG"
    },
    primaryImageOfPage: imageUrl ? {
      "@type": "ImageObject",
      url: imageUrl
    } : undefined,
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    breadcrumb: {
      "@id": `${url}#breadcrumb`
    },
    inLanguage: "en-NG",
    potentialAction: [
      {
        "@type": "ReadAction",
        target: [url]
      }
    ]
  };

  // Clean undefined values
  const cleanJsonLd = JSON.parse(JSON.stringify(jsonLd));

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(cleanJsonLd)}
      </script>
    </Helmet>
  );
};

export default WebPageJsonLd;
