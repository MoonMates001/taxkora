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

const Index = () => {
  return (
    <main className="min-h-screen">
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
