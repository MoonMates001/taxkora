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
  priceCurrency = "USD",
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
      priceValidUntil: "2027-12-31",
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

  const cleanJsonLd = JSON.parse(JSON.stringify(jsonLd));

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(cleanJsonLd)}</script>
    </Helmet>
  );
};

export default ProductJsonLd;

export const PricingProducts = () => (
  <>
    <ProductJsonLd
      name="TAXKORA Individual Plan"
      description="Personal income tax compliance for individuals worldwide. Includes multi-country tax computation, income tracking, and tax reports."
      price="5"
      sku="TAXKORA-INDIVIDUAL"
      features={[
        "Personal income tax computation",
        "Multi-country tax support (50+)",
        "Income & expense tracking",
        "Tax liability tracking",
        "Payment reminders",
        "Basic tax reports",
      ]}
    />
    <ProductJsonLd
      name="TAXKORA Business Plan"
      description="Complete tax compliance for SMEs, freelancers, and self-employed professionals worldwide. Includes invoicing, VAT, WHT, and business tax computation."
      price="15"
      sku="TAXKORA-BUSINESS"
      features={[
        "Unlimited professional invoicing",
        "VAT & WHT management",
        "Capital asset depreciation",
        "Business tax computation",
        "Advanced analytics & reports",
        "Priority support",
      ]}
    />
    <ProductJsonLd
      name="TAXKORA Enterprise Plan"
      description="Enterprise tax compliance for incorporated businesses worldwide. Includes CIT computation, corporate filing, and dedicated support."
      price="50"
      sku="TAXKORA-ENTERPRISE"
      features={[
        "CIT computation",
        "Corporate tax filing",
        "Multi-year tax planning",
        "Audit trail & compliance logs",
        "Dedicated support",
        "Assisted filing service",
      ]}
    />
  </>
);
