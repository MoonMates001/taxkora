import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import TaxSavingsCalculator from "@/components/landing/TaxSavingsCalculator";
import Pricing from "@/components/landing/Pricing";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import UrgencyBanner from "@/components/landing/UrgencyBanner";
import StickyCtaBar from "@/components/landing/StickyCtaBar";
import ExitIntentPopup from "@/components/landing/ExitIntentPopup";
import SocialProofTicker from "@/components/landing/SocialProofTicker";
import ScrollProgressBar from "@/components/landing/ScrollProgressBar";
import LiveChatTrigger from "@/components/landing/LiveChatTrigger";

const Index = () => {
  return (
    <main className="min-h-screen">
      {/* Engagement components */}
      <ScrollProgressBar />
      <UrgencyBanner />
      <ExitIntentPopup />
      <SocialProofTicker />
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
        <CTA />
      </article>
      <Footer />
    </main>
  );
};

export default Index;
