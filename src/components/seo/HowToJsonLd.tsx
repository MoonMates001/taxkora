import { Helmet } from "react-helmet-async";

interface HowToStep {
  name: string;
  text: string;
  image?: string;
  url?: string;
}

interface HowToJsonLdProps {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string;
  estimatedCost?: {
    currency: string;
    value: string;
  };
  image?: string;
}

const HowToJsonLd = ({
  name,
  description,
  steps,
  totalTime,
  estimatedCost,
  image,
}: HowToJsonLdProps) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    image: image || "https://taxkora.com/favicon.png",
    totalTime: totalTime || "PT10M",
    estimatedCost: estimatedCost
      ? {
          "@type": "MonetaryAmount",
          currency: estimatedCost.currency,
          value: estimatedCost.value,
        }
      : undefined,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image,
      url: step.url,
    })),
    tool: [
      {
        "@type": "HowToTool",
        name: "TAXKORA Tax Calculator",
      },
    ],
  };

  // Clean undefined values
  const cleanJsonLd = JSON.parse(JSON.stringify(jsonLd));

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(cleanJsonLd)}</script>
    </Helmet>
  );
};

export default HowToJsonLd;

// Pre-configured HowTo for tax calculation
export const TaxCalculationHowTo = () => (
  <HowToJsonLd
    name="How to Calculate Tax in Nigeria Using TAXKORA"
    description="Step-by-step guide to calculate your Personal Income Tax, Company Income Tax, VAT, and Withholding Tax in Nigeria using TAXKORA's free tax calculator."
    totalTime="PT5M"
    estimatedCost={{ currency: "NGN", value: "0" }}
    steps={[
      {
        name: "Sign Up for Free",
        text: "Create a free TAXKORA account. No credit card required. Get 90 days free trial access to all features.",
        url: "https://taxkora.com/auth",
      },
      {
        name: "Enter Your Income",
        text: "Add your income sources including salary, freelance earnings, business revenue, and investments. TAXKORA supports multiple income categories.",
        url: "https://taxkora.com/dashboard/income",
      },
      {
        name: "Add Your Expenses",
        text: "Record your business or personal expenses. TAXKORA automatically categorizes them for tax deduction purposes.",
        url: "https://taxkora.com/dashboard/expenses",
      },
      {
        name: "Review Tax Computation",
        text: "TAXKORA automatically calculates your PIT, CIT, VAT, and WHT based on current Nigerian tax laws. Review your tax summary and projections.",
        url: "https://taxkora.com/dashboard/tax-computation",
      },
      {
        name: "File Your Returns",
        text: "Use TAXKORA's assisted filing service to submit your tax returns to FIRS/SIRS. Get help with Tax Clearance Certificate (TCC) applications.",
        url: "https://taxkora.com/dashboard/tax-filing",
      },
    ]}
  />
);
