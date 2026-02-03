import { Helmet } from "react-helmet-async";

interface ArticleJsonLdProps {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  authorName: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  wordCount?: number;
}

const ArticleJsonLd = ({
  title,
  description,
  url,
  imageUrl,
  authorName,
  publishedTime,
  modifiedTime,
  section = "Tax",
  tags = [],
  wordCount,
}: ArticleJsonLdProps) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    "isPartOf": {
      "@id": `${url}#webpage`
    },
    headline: title,
    description: description,
    image: imageUrl ? {
      "@type": "ImageObject",
      "url": imageUrl,
      "width": 1200,
      "height": 630
    } : undefined,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "TAXKORA Nigeria",
      logo: {
        "@type": "ImageObject",
        url: "https://taxkora.com/favicon.png",
        width: 512,
        height: 512,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    articleSection: section,
    keywords: tags.join(", "),
    wordCount: wordCount,
    inLanguage: "en-NG",
    copyrightHolder: {
      "@type": "Organization",
      name: "TAXKORA Nigeria"
    },
    copyrightYear: new Date().getFullYear(),
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

export default ArticleJsonLd;
