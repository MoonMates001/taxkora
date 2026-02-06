import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import TaxSavingsCalculator from "@/components/landing/TaxSavingsCalculator";
import Pricing from "@/components/landing/Pricing";
import CustomerSupport from "@/components/landing/CustomerSupport";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import StickyCtaBar from "@/components/landing/StickyCtaBar";
import ExitIntentPopup from "@/components/landing/ExitIntentPopup";
import ScrollProgressBar from "@/components/landing/ScrollProgressBar";
import LiveChatTrigger from "@/components/landing/LiveChatTrigger";
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

      {/* Engagement components */}
      <ScrollProgressBar />
      <ExitIntentPopup />
      <StickyCtaBar />
      <LiveChatTrigger />

      {/* Main content */}
      <Navbar />
      <article>
        <Hero />
        <Features />
        <HowItWorks />
        <TaxSavingsCalculator />
        <Pricing />
        <CustomerSupport />
        <CTA />
      </article>
      <Footer />
    </main>
  );
};

export default Index;
