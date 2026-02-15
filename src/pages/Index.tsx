import { lazy, Suspense } from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import {
  SEOHead,
  OrganizationJsonLd,
  WebSiteJsonLd,
  SoftwareApplicationJsonLd,
  FAQPageJsonLd,
  ServiceJsonLd,
  LocalBusinessJsonLd,
  TaxCalculationHowTo,
  PricingProducts,
  BreadcrumbJsonLd,
} from "@/components/seo";

// Lazy-load below-fold sections to reduce initial bundle and unblock main thread
const Features = lazy(() => import("@/components/landing/Features"));
const HowItWorks = lazy(() => import("@/components/landing/HowItWorks"));
const TaxSavingsCalculator = lazy(() => import("@/components/landing/TaxSavingsCalculator"));
const Pricing = lazy(() => import("@/components/landing/Pricing"));
const CustomerSupport = lazy(() => import("@/components/landing/CustomerSupport"));
const CTA = lazy(() => import("@/components/landing/CTA"));
const Footer = lazy(() => import("@/components/landing/Footer"));

// Lazy-load engagement widgets (non-critical)
const StickyCtaBar = lazy(() => import("@/components/landing/StickyCtaBar"));
const ExitIntentPopup = lazy(() => import("@/components/landing/ExitIntentPopup"));
const ScrollProgressBar = lazy(() => import("@/components/landing/ScrollProgressBar"));
const LiveChatTrigger = lazy(() => import("@/components/landing/LiveChatTrigger"));

const SectionFallback = () => <div className="min-h-[200px]" />;

const Index = () => {
  return (
    <main className="min-h-screen">
      {/* Complete SEO Schema */}
      <SEOHead
        title="TAXKORA - Nigeria Tax Calculator 2026 | PIT, CIT, VAT & WHT Compliance"
        description="Nigeria's #1 tax compliance software. Calculate Nigerian tax rates 2026, file personal income tax, company income tax, VAT & withholding tax. Free tax calculator for Nigerian businesses and freelancers. FIRS/NRS compliant."
        canonicalUrl="https://taxkora.com"
        ogType="website"
        keywords={[
          "Nigeria tax rates 2026",
          "Nigerian tax rates",
          "how to calculate tax in Nigeria",
          "Nigeria tax calculator online",
          "tax filing requirements in Nigeria",
          "Personal Income Tax Nigeria",
          "Company Income Tax Nigeria",
          "VAT Nigeria",
          "Withholding Tax Nigeria",
          "PAYE tax rates Nigeria",
          "freelancer tax Nigeria",
          "small business tax Nigeria",
          "FIRS Nigeria",
          "tax compliance SME Nigeria",
        ]}
      />
      <BreadcrumbJsonLd
        items={[{ name: "Home", url: "https://taxkora.com" }]}
      />
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <SoftwareApplicationJsonLd />
      <FAQPageJsonLd />
      <ServiceJsonLd />
      <LocalBusinessJsonLd />
      <TaxCalculationHowTo />
      <PricingProducts />

      {/* Engagement components - lazy loaded */}
      <Suspense fallback={null}>
        <ScrollProgressBar />
        <ExitIntentPopup />
        <StickyCtaBar />
        <LiveChatTrigger />
      </Suspense>

      {/* Critical above-fold content */}
      <Navbar />
      <article>
        <Hero />
        <Suspense fallback={<SectionFallback />}>
          <Features />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <HowItWorks />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <TaxSavingsCalculator />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Pricing />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <CustomerSupport />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <CTA />
        </Suspense>
      </article>
      <Suspense fallback={<SectionFallback />}>
        <Footer />
      </Suspense>
    </main>
  );
};

export default Index;
