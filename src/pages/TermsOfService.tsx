import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import { SEOHead, BreadcrumbJsonLd } from "@/components/seo";
import { FileText, Scale, UserCheck, CreditCard, Shield, AlertTriangle, Ban, Globe, Clock, Mail, Gavel, RefreshCw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Footer = lazy(() => import("@/components/landing/Footer"));

const lastUpdated = "February 15, 2026";

const sections = [
  {
    id: "acceptance",
    icon: Gavel,
    title: "1. Acceptance of Terms",
    content: (
      <>
        <p className="mb-4">By accessing, browsing, or using the TAXKORA platform (the "Service"), including our website, mobile application, and any related services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms").</p>
        <p className="mb-4">If you are using the Service on behalf of a business or other legal entity, you represent that you have the authority to bind that entity to these Terms, in which case "you" refers to that entity.</p>
        <p>If you do not agree with any part of these Terms, you must not access or use the Service. Continued use of the Service following any modifications to these Terms constitutes your acceptance of the updated Terms.</p>
      </>
    ),
  },
  {
    id: "description",
    icon: FileText,
    title: "2. Description of Service",
    content: (
      <>
        <p className="mb-4">TAXKORA is a tax and financial compliance platform designed for Nigerian individuals and businesses. The Service provides the following features:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li><strong>Tax Computation:</strong> Automated calculation of Personal Income Tax (PIT), Company Income Tax (CIT), Value-Added Tax (VAT), and Withholding Tax (WHT) based on current Nigerian tax legislation.</li>
          <li><strong>Income & Expense Tracking:</strong> Tools to record, categorise, and manage your income and business expenses.</li>
          <li><strong>Invoice Management:</strong> Creation, customisation, and tracking of professional invoices for your clients.</li>
          <li><strong>Capital Asset Management:</strong> Tracking and computation of capital allowances on business assets.</li>
          <li><strong>Tax Filing Assistance:</strong> Guidance and preparation tools for tax filing with the Federal Inland Revenue Service (FIRS) and State Internal Revenue Services.</li>
          <li><strong>Tax Payment Tracking:</strong> Recording and monitoring of tax payments and filing deadlines.</li>
          <li><strong>Financial Reporting:</strong> Dashboards and reports providing insights into your financial and tax position.</li>
        </ul>
        <p>The Service is provided for informational and computational purposes. TAXKORA does not provide legal, financial, or professional tax advisory services. You should consult a qualified tax professional for specific tax advice.</p>
      </>
    ),
  },
  {
    id: "eligibility",
    icon: UserCheck,
    title: "3. Eligibility & Account Registration",
    content: (
      <>
        <h4 className="font-semibold text-foreground mb-2">3.1 Eligibility</h4>
        <p className="mb-4">To use the Service, you must be at least 18 years of age and have the legal capacity to enter into a binding agreement. By using the Service, you represent and warrant that you meet these requirements.</p>

        <h4 className="font-semibold text-foreground mb-2">3.2 Account Creation</h4>
        <p className="mb-4">You must create an account to access most features of the Service. When creating an account, you agree to:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Provide accurate, current, and complete registration information.</li>
          <li>Maintain and promptly update your account information to keep it accurate.</li>
          <li>Maintain the security and confidentiality of your password and account credentials.</li>
          <li>Accept responsibility for all activities that occur under your account.</li>
          <li>Notify us immediately of any unauthorised access to or use of your account.</li>
        </ul>

        <h4 className="font-semibold text-foreground mb-2">3.3 Account Security</h4>
        <p>You are solely responsible for safeguarding your account credentials. TAXKORA shall not be liable for any loss or damage arising from your failure to maintain the confidentiality of your account information.</p>
      </>
    ),
  },
  {
    id: "subscription",
    icon: CreditCard,
    title: "4. Subscription Plans & Payments",
    content: (
      <>
        <h4 className="font-semibold text-foreground mb-2">4.1 Subscription Plans</h4>
        <p className="mb-4">TAXKORA offers the following subscription plans:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li><strong>PIT Individual Plan:</strong> For individuals managing personal income tax obligations.</li>
          <li><strong>PIT Business Plan:</strong> For sole proprietors and small businesses managing personal income tax with business activities.</li>
          <li><strong>CIT Plan:</strong> For companies managing corporate income tax, VAT, and WHT obligations.</li>
        </ul>

        <h4 className="font-semibold text-foreground mb-2">4.2 Free Trial</h4>
        <p className="mb-4">New users may be eligible for a free trial period. A valid payment method is required to activate the trial. You will not be charged during the trial period. At the end of the trial, your subscription will automatically convert to a paid plan unless cancelled before the trial expires.</p>

        <h4 className="font-semibold text-foreground mb-2">4.3 Payment Processing</h4>
        <p className="mb-4">All payments are processed securely through Flutterwave, our third-party payment processor. By providing payment information, you authorise us to charge the applicable subscription fees. All amounts are stated and charged in Nigerian Naira (₦).</p>

        <h4 className="font-semibold text-foreground mb-2">4.4 Auto-Renewal</h4>
        <p className="mb-4">Subscriptions automatically renew at the end of each billing period unless you disable auto-renewal or cancel your subscription before the renewal date. You may manage your auto-renewal settings from your account dashboard.</p>

        <h4 className="font-semibold text-foreground mb-2">4.5 Refund Policy</h4>
        <p>Subscription fees are generally non-refundable. However, if you experience a genuine service deficiency, you may contact us within 7 days of payment to request a review. Refunds are granted at our sole discretion on a case-by-case basis.</p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    icon: Shield,
    title: "5. Acceptable Use Policy",
    content: (
      <>
        <p className="mb-4">You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Use the Service for any illegal or unauthorised purpose, including tax evasion or fraud.</li>
          <li>Upload false, misleading, or fraudulent financial information.</li>
          <li>Attempt to gain unauthorised access to any part of the Service, other user accounts, or our systems.</li>
          <li>Interfere with or disrupt the integrity, security, or performance of the Service.</li>
          <li>Use automated tools, bots, or scrapers to access the Service without our express written consent.</li>
          <li>Reverse engineer, decompile, or disassemble any part of the Service.</li>
          <li>Transmit any malware, viruses, or other harmful code through the Service.</li>
          <li>Resell, sublicense, or commercially exploit the Service without authorisation.</li>
          <li>Impersonate any person or entity, or misrepresent your affiliation with any person or entity.</li>
        </ul>
        <p>We reserve the right to suspend or terminate your account if we reasonably believe you have violated this Acceptable Use Policy.</p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    icon: Scale,
    title: "6. Intellectual Property",
    content: (
      <>
        <h4 className="font-semibold text-foreground mb-2">6.1 Our Intellectual Property</h4>
        <p className="mb-4">The Service, including its design, features, content, branding, logos, software, algorithms, and documentation, is owned by TAXKORA and its licensors. All rights, title, and interest in and to the Service are protected by Nigerian and international copyright, trademark, and other intellectual property laws.</p>

        <h4 className="font-semibold text-foreground mb-2">6.2 Limited Licence</h4>
        <p className="mb-4">Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable licence to access and use the Service for your personal or internal business purposes during your active subscription period.</p>

        <h4 className="font-semibold text-foreground mb-2">6.3 Your Content</h4>
        <p>You retain ownership of all data, documents, and content you upload or input into the Service ("Your Content"). By using the Service, you grant us a limited licence to process, store, and display Your Content solely for the purpose of providing the Service to you.</p>
      </>
    ),
  },
  {
    id: "data-accuracy",
    icon: AlertTriangle,
    title: "7. Data Accuracy & Tax Disclaimers",
    content: (
      <>
        <h4 className="font-semibold text-foreground mb-2">7.1 Accuracy of Computations</h4>
        <p className="mb-4">TAXKORA strives to provide accurate tax computations based on current Nigerian tax laws and regulations. However, tax laws are subject to change, and computations are based on the information you provide. We do not guarantee that all computations will be free from errors or that they will reflect the most recent legislative changes at all times.</p>

        <h4 className="font-semibold text-foreground mb-2">7.2 Not Professional Advice</h4>
        <p className="mb-4">The Service is a computational and record-keeping tool. It does not constitute professional tax, legal, or financial advice. You are solely responsible for verifying the accuracy of tax computations and ensuring compliance with applicable tax laws. We strongly recommend consulting a qualified tax advisor or accountant for complex tax matters.</p>

        <h4 className="font-semibold text-foreground mb-2">7.3 User Responsibility</h4>
        <p>You are responsible for the accuracy and completeness of all data you enter into the Service. TAXKORA shall not be liable for any errors, penalties, or losses resulting from inaccurate or incomplete information provided by you.</p>
      </>
    ),
  },
  {
    id: "limitation-liability",
    icon: Ban,
    title: "8. Limitation of Liability",
    content: (
      <>
        <p className="mb-4">To the maximum extent permitted by applicable Nigerian law:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li><strong>No Warranty:</strong> The Service is provided on an "as is" and "as available" basis without warranties of any kind, whether express, implied, or statutory, including warranties of merchantability, fitness for a particular purpose, and non-infringement.</li>
          <li><strong>Limitation of Damages:</strong> TAXKORA, its directors, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, business opportunities, or goodwill arising from your use of the Service.</li>
          <li><strong>Maximum Liability:</strong> Our total aggregate liability for any claims arising out of or related to these Terms or the Service shall not exceed the total amount you paid to TAXKORA in the 12 months preceding the claim.</li>
          <li><strong>Tax Liability:</strong> TAXKORA is not responsible for any tax penalties, interest, or additional assessments imposed by any tax authority, whether or not such liability arises from use of the Service.</li>
        </ul>
      </>
    ),
  },
  {
    id: "termination",
    icon: RefreshCw,
    title: "9. Termination & Suspension",
    content: (
      <>
        <h4 className="font-semibold text-foreground mb-2">9.1 Termination by You</h4>
        <p className="mb-4">You may cancel your subscription and terminate your account at any time through your account settings or by contacting us. Cancellation will take effect at the end of your current billing period. You will retain access to the Service until that time.</p>

        <h4 className="font-semibold text-foreground mb-2">9.2 Termination by Us</h4>
        <p className="mb-4">We may suspend or terminate your access to the Service immediately, without prior notice, if:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>You breach any provision of these Terms.</li>
          <li>Your payment method fails or your subscription lapses.</li>
          <li>We are required to do so by law or regulatory authority.</li>
          <li>We reasonably believe your account has been compromised or is being used fraudulently.</li>
        </ul>

        <h4 className="font-semibold text-foreground mb-2">9.3 Effect of Termination</h4>
        <p>Upon termination, your right to use the Service ceases immediately. We may retain your data for a reasonable period in accordance with our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> and applicable legal requirements, including tax record retention obligations under Nigerian law.</p>
      </>
    ),
  },
  {
    id: "modifications",
    icon: Clock,
    title: "10. Modifications to Terms",
    content: (
      <p>We reserve the right to modify these Terms at any time. Material changes will be communicated by posting the updated Terms on this page with a revised "Last Updated" date. Where required, we may also notify you via email or through the Service. Your continued use of the Service after changes are posted constitutes your acceptance of the modified Terms. If you do not agree to the updated Terms, you must discontinue use of the Service.</p>
    ),
  },
  {
    id: "indemnification",
    icon: Shield,
    title: "11. Indemnification",
    content: (
      <p>You agree to indemnify, defend, and hold harmless TAXKORA, its officers, directors, employees, agents, and affiliates from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising out of or related to: (a) your use of the Service; (b) your violation of these Terms; (c) your violation of any third-party rights; (d) the accuracy or legality of the data you input into the Service; or (e) any tax filings or payments made based on information generated by the Service.</p>
    ),
  },
  {
    id: "governing-law",
    icon: Globe,
    title: "12. Governing Law & Dispute Resolution",
    content: (
      <>
        <h4 className="font-semibold text-foreground mb-2">12.1 Governing Law</h4>
        <p className="mb-4">These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of laws principles.</p>

        <h4 className="font-semibold text-foreground mb-2">12.2 Dispute Resolution</h4>
        <p className="mb-4">Any dispute arising out of or in connection with these Terms shall first be attempted to be resolved through good-faith negotiation between the parties. If the dispute cannot be resolved through negotiation within 30 days, either party may refer the matter to mediation or arbitration in Lagos, Nigeria, in accordance with the Arbitration and Mediation Act 2023.</p>

        <h4 className="font-semibold text-foreground mb-2">12.3 Jurisdiction</h4>
        <p>Subject to the arbitration clause above, the courts of Lagos State, Nigeria shall have exclusive jurisdiction over any legal proceedings arising out of or related to these Terms.</p>
      </>
    ),
  },
  {
    id: "general",
    icon: FileText,
    title: "13. General Provisions",
    content: (
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Entire Agreement:</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and TAXKORA regarding the use of the Service.</li>
        <li><strong>Severability:</strong> If any provision of these Terms is found to be unenforceable or invalid, that provision shall be modified to the minimum extent necessary, and the remaining provisions shall continue in full force and effect.</li>
        <li><strong>Waiver:</strong> Our failure to enforce any right or provision of these Terms shall not constitute a waiver of that right or provision.</li>
        <li><strong>Assignment:</strong> You may not assign or transfer these Terms or your rights under them without our prior written consent. We may assign our rights and obligations under these Terms without restriction.</li>
        <li><strong>Force Majeure:</strong> TAXKORA shall not be liable for any failure or delay in performing its obligations due to circumstances beyond its reasonable control, including natural disasters, government actions, internet outages, or utility failures.</li>
      </ul>
    ),
  },
  {
    id: "contact",
    icon: Mail,
    title: "14. Contact Us",
    content: (
      <>
        <p className="mb-4">If you have any questions or concerns about these Terms, please contact us:</p>
        <ul className="space-y-2">
          <li><strong>Email:</strong> <a href="mailto:alphalinkprime@gmail.com" className="text-primary hover:underline">alphalinkprime@gmail.com</a></li>
          <li><strong>Phone:</strong> <a href="tel:+2347077706706" className="text-primary hover:underline">+234 707 770 6706</a></li>
          <li><strong>Address:</strong> Lagos, Nigeria</li>
        </ul>
      </>
    ),
  },
];

const TermsOfService = () => {
  return (
    <main className="min-h-screen bg-background">
      <SEOHead
        title="Terms of Service | TAXKORA"
        description="Read the Terms of Service for TAXKORA. Understand your rights and obligations when using our Nigerian tax computation and financial compliance platform."
        canonicalUrl="https://taxkora.com/terms"
        noIndex={false}
        keywords={["TAXKORA terms of service", "terms and conditions", "Nigeria tax platform terms", "TAXKORA user agreement"]}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://taxkora.com" },
          { name: "Terms of Service", url: "https://taxkora.com/terms" },
        ]}
      />

      <Navbar />

      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Scale className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Please read these Terms of Service carefully before using the TAXKORA platform. By accessing or using our Service, you agree to be bound by these Terms.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            <strong>Last Updated:</strong> {lastUpdated}
          </p>
        </header>

        <Separator className="mb-10" />

        {/* Quick Navigation */}
        <nav className="mb-10 p-6 rounded-xl border bg-card" aria-label="Table of contents">
          <h2 className="font-semibold text-foreground mb-3">Table of Contents</h2>
          <ol className="grid sm:grid-cols-2 gap-1">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 py-1"
                >
                  <section.icon className="w-3.5 h-3.5 shrink-0" />
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <div className="flex items-start gap-3 mb-4">
                <div className="mt-0.5 shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <section.icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground">{section.title}</h2>
              </div>
              <div className="text-muted-foreground leading-relaxed pl-12">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <Separator className="my-12" />

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="q1">
              <AccordionTrigger>Can I cancel my subscription at any time?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes. You can cancel your subscription at any time from your account dashboard. Your access will continue until the end of your current billing period. No refunds are issued for partial billing periods.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2">
              <AccordionTrigger>Is TAXKORA a substitute for a tax advisor?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                No. TAXKORA is a computational and record-keeping tool, not a replacement for professional tax advice. We strongly recommend consulting a qualified tax professional for complex or uncertain tax matters.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q3">
              <AccordionTrigger>What happens to my data if my account is terminated?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Upon termination, your personal data will be handled in accordance with our Privacy Policy. Financial records may be retained for up to 6 years as required by Nigerian tax law. You may request a copy of your data before account closure.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q4">
              <AccordionTrigger>Which Nigerian laws govern these Terms?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                These Terms are governed by the laws of the Federal Republic of Nigeria. Disputes are resolved through negotiation first, then arbitration in Lagos under the Arbitration and Mediation Act 2023. The courts of Lagos State have exclusive jurisdiction for any legal proceedings.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q5">
              <AccordionTrigger>Am I liable for inaccurate tax computations?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                TAXKORA computations are based on the data you provide and current tax regulations. You are responsible for verifying the accuracy of all computations and ensuring your tax compliance. TAXKORA is not liable for penalties or losses resulting from inaccurate data entry or changes in tax law.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Back link */}
        <div className="text-center">
          <Link to="/" className="text-sm text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
      </article>

      <Suspense fallback={<div className="min-h-[200px]" />}>
        <Footer />
      </Suspense>
    </main>
  );
};

export default TermsOfService;
