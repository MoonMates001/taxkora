import { Helmet } from "react-helmet-async";

interface ProductJsonLdProps {
  name: string;
  description: string;
  price: string;
  priceCurrency?: string;
  sku?: string;
  brand?: string;
  image?: string;
  url?: string;
  availability?: string;
  features?: string[];
}

const ProductJsonLd = ({
  name,
  description,
  price,
  priceCurrency = "NGN",
  sku,
  brand = "TAXKORA",
  image = "https://taxkora.com/favicon.png",
  url = "https://taxkora.com",
  availability = "https://schema.org/InStock",
  features = [],
}: ProductJsonLdProps) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image,
    url,
    sku,
    brand: {
      "@type": "Brand",
      name: brand,
    },
    offers: {
      "@type": "Offer",
      price,
      priceCurrency,
      availability,
      priceValidUntil: "2026-12-31",
      seller: {
        "@id": "https://taxkora.com/#organization",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "10000",
      bestRating: "5",
      worstRating: "1",
    },
    additionalProperty: features.map((feature) => ({
      "@type": "PropertyValue",
      name: "Feature",
      value: feature,
    })),
  };

  // Clean undefined/empty values
  const cleanJsonLd = JSON.parse(JSON.stringify(jsonLd));

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(cleanJsonLd)}</script>
    </Helmet>
  );
};

export default ProductJsonLd;

// Pre-configured products for pricing page
export const PricingProducts = () => (
  <>
    <ProductJsonLd
      name="TAXKORA Individual PIT Plan"
      description="Personal income tax compliance for employed individuals. Includes income tracking, PIT computation, tax filing, and TCC support."
      price="2500"
      sku="TAXKORA-PIT-IND"
      features={[
        "Personal income tracking",
        "Multi-source income aggregation",
        "Personal expense categorization",
        "PIT tax computation",
        "Personal tax filing",
        "TCC support",
        "Email support",
      ]}
    />
    <ProductJsonLd
      name="TAXKORA Business PIT Plan"
      description="Complete tax compliance for SMEs, freelancers, and self-employed. Includes invoicing, VAT, WHT, and business tax computation."
      price="7500"
      sku="TAXKORA-PIT-BUS"
      features={[
        "Unlimited professional invoicing",
        "Business income & expense tracking",
        "VAT management & returns",
        "WHT transaction tracking",
        "Capital asset depreciation",
        "Business tax computation",
        "Priority email support",
      ]}
    />
    <ProductJsonLd
      name="TAXKORA Companies Income Tax Plan"
      description="Enterprise tax compliance for incorporated businesses. Includes CIT computation, corporate filing, and dedicated support."
      price="25000"
      sku="TAXKORA-CIT"
      features={[
        "CIT tax computation",
        "Corporate tax filing",
        "Multi-year tax records",
        "Advanced financial reports",
        "Audit trail & compliance logs",
        "Dedicated support",
        "Assisted filing service",
      ]}
    />
  </>
);
