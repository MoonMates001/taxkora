import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import { SEOHead, BreadcrumbJsonLd } from "@/components/seo";
import { Shield, Lock, Eye, Database, UserCheck, Globe, Mail, FileText, Clock, AlertTriangle } from "lucide-react";
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
    id: "information-we-collect",
    icon: Database,
    title: "1. Information We Collect",
    content: (
      <>
        <p className="mb-4">We collect the following categories of information to provide and improve our services:</p>

        <h4 className="font-semibold text-foreground mb-2">1.1 Information You Provide</h4>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li><strong>Account Information:</strong> Full name, email address, phone number, and password when you create an account.</li>
          <li><strong>Business Profile:</strong> Business name, address, city, state, and account type (personal or business).</li>
          <li><strong>Financial Data:</strong> Income records, expense records, invoice details, tax payment information, VAT transactions, withholding tax details, and capital asset information you enter into the platform.</li>
          <li><strong>Client Information:</strong> Names, email addresses, phone numbers, addresses, and tax identification numbers of your clients that you add for invoicing purposes.</li>
          <li><strong>Support Requests:</strong> Information you provide when contacting customer support, including your name, email, phone, and message content.</li>
        </ul>

        <h4 className="font-semibold text-foreground mb-2">1.2 Information Collected Automatically</h4>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the platform, and interaction patterns.</li>
          <li><strong>Device Information:</strong> Browser type, device type, operating system, and screen resolution.</li>
          <li><strong>Blog Analytics:</strong> Page views, referrer URLs, country of origin, and device type for blog content.</li>
          <li><strong>Referral Tracking:</strong> Referral link clicks, visitor IP addresses (hashed), user agents, and conversion data.</li>
        </ul>

        <h4 className="font-semibold text-foreground mb-2">1.3 Payment Information</h4>
        <p>Payment processing is handled by Flutterwave. We store only the last four digits of your card number and card expiry for display purposes. Full payment card details are never stored on our servers. Card tokens are securely isolated and accessible only through server-side functions.</p>
      </>
    ),
  },
  {
    id: "how-we-use",
    icon: Eye,
    title: "2. How We Use Your Information",
    content: (
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Tax Computation:</strong> Calculate personal income tax (PIT), company income tax (CIT), value-added tax (VAT), and withholding tax (WHT) based on Nigerian tax laws.</li>
        <li><strong>Financial Management:</strong> Generate invoices, track income and expenses, manage capital assets, and provide financial insights.</li>
        <li><strong>Account Management:</strong> Authenticate your identity, manage your subscription, and process payments.</li>
        <li><strong>Communication:</strong> Send onboarding emails, subscription reminders, tax deadline notifications, and referral invitations.</li>
        <li><strong>Service Improvement:</strong> Analyse usage patterns and blog analytics to improve our platform and content.</li>
        <li><strong>Legal Compliance:</strong> Meet our obligations under Nigerian data protection regulations (NDPR) and applicable tax laws.</li>
      </ul>
    ),
  },
  {
    id: "data-protection",
    icon: Lock,
    title: "3. Data Protection & Security",
    content: (
      <>
        <p className="mb-4">We implement multiple layers of security to protect your data:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li><strong>Client-Side Encryption:</strong> Sensitive user data is encrypted on your device before being transmitted and stored, ensuring that critical information remains unreadable even in the unlikely event of a database breach.</li>
          <li><strong>Data Masking:</strong> Personally identifiable information (PII) such as email addresses, phone numbers, and tax identification numbers are masked in database views to prevent unauthorized enumeration.</li>
          <li><strong>Row-Level Security (RLS):</strong> Every database table enforces row-level security policies, ensuring users can only access their own records. Anonymous access is explicitly denied.</li>
          <li><strong>Payment Data Isolation:</strong> Payment tokens and card details are stored in a separate, restricted table accessible only by server-side functions — never exposed to the client application.</li>
          <li><strong>Audit Logging:</strong> Critical actions are recorded in an audit log for accountability and incident investigation.</li>
          <li><strong>HTTPS Encryption:</strong> All data transmitted between your browser and our servers is encrypted using TLS/SSL.</li>
        </ul>
      </>
    ),
  },
  {
    id: "data-sharing",
    icon: Globe,
    title: "4. Data Sharing & Third Parties",
    content: (
      <>
        <p className="mb-4">We do not sell, trade, or rent your personal information. We share data only in the following limited circumstances:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Payment Processing:</strong> Flutterwave processes your payments. They receive only the information necessary to complete transactions and are bound by their own privacy policies.</li>
          <li><strong>Legal Requirements:</strong> We may disclose your information if required by law, court order, or governmental regulation, particularly in relation to tax compliance obligations.</li>
          <li><strong>Service Providers:</strong> We use cloud infrastructure providers to host and deliver our services. These providers process data on our behalf under strict contractual obligations.</li>
          <li><strong>With Your Consent:</strong> We may share information with third parties when you explicitly authorise us to do so, such as when sending referral invitations on your behalf.</li>
        </ul>
      </>
    ),
  },
  {
    id: "your-rights",
    icon: UserCheck,
    title: "5. Your Rights Under NDPR",
    content: (
      <>
        <p className="mb-4">Under the Nigeria Data Protection Regulation (NDPR), you have the following rights:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Right of Access:</strong> Request a copy of the personal data we hold about you.</li>
          <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete personal data via your account settings.</li>
          <li><strong>Right to Erasure:</strong> Request deletion of your personal data, subject to legal retention requirements.</li>
          <li><strong>Right to Data Portability:</strong> Request your data in a structured, commonly used format.</li>
          <li><strong>Right to Object:</strong> Object to the processing of your personal data for specific purposes.</li>
          <li><strong>Right to Withdraw Consent:</strong> Withdraw previously given consent at any time by contacting us.</li>
        </ul>
        <p className="mt-4">To exercise any of these rights, please contact us at <a href="mailto:alphalinkprime@gmail.com" className="text-primary hover:underline">alphalinkprime@gmail.com</a>.</p>
      </>
    ),
  },
  {
    id: "data-retention",
    icon: Clock,
    title: "6. Data Retention",
    content: (
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Account Data:</strong> Retained for as long as your account is active. Upon account deletion, personal data is removed within 30 days, except where retention is required by law.</li>
        <li><strong>Financial Records:</strong> Tax-related financial records may be retained for up to 6 years in accordance with Nigerian tax law requirements under the Federal Inland Revenue Service (FIRS) regulations.</li>
        <li><strong>Audit Logs:</strong> Security and audit logs are retained for 12 months for security and compliance purposes.</li>
        <li><strong>Blog Analytics:</strong> Anonymised analytics data may be retained indefinitely for service improvement.</li>
        <li><strong>Payment Records:</strong> Transaction references and payment histories are retained in line with financial regulatory requirements.</li>
      </ul>
    ),
  },
  {
    id: "cookies",
    icon: FileText,
    title: "7. Cookies & Local Storage",
    content: (
      <>
        <p className="mb-4">TAXKORA uses the following browser storage mechanisms:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Authentication Tokens:</strong> Stored securely to maintain your logged-in session.</li>
          <li><strong>PWA Data:</strong> Service worker caches enable offline access to the application.</li>
          <li><strong>User Preferences:</strong> Theme settings and display preferences stored locally on your device.</li>
        </ul>
        <p className="mt-4">We do not use third-party advertising or tracking cookies.</p>
      </>
    ),
  },
  {
    id: "children",
    icon: AlertTriangle,
    title: "8. Children's Privacy",
    content: (
      <p>TAXKORA is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected personal data from a child without parental consent, we will take steps to delete that information promptly.</p>
    ),
  },
  {
    id: "changes",
    icon: FileText,
    title: "9. Changes to This Policy",
    content: (
      <p>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of material changes by posting the updated policy on this page with a revised "Last Updated" date. We encourage you to review this page periodically. Continued use of TAXKORA after changes constitutes acceptance of the updated policy.</p>
    ),
  },
  {
    id: "contact",
    icon: Mail,
    title: "10. Contact Us",
    content: (
      <>
        <p className="mb-4">If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
        <ul className="space-y-2">
          <li><strong>Email:</strong> <a href="mailto:alphalinkprime@gmail.com" className="text-primary hover:underline">alphalinkprime@gmail.com</a></li>
          <li><strong>Phone:</strong> <a href="tel:+2347077706706" className="text-primary hover:underline">+234 707 770 6706</a></li>
          <li><strong>Address:</strong> Lagos, Nigeria</li>
        </ul>
        <p className="mt-4">For complaints regarding your data protection rights, you may also contact the National Information Technology Development Agency (NITDA) at <a href="https://nitda.gov.ng" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">nitda.gov.ng</a>.</p>
      </>
    ),
  },
];

const PrivacyPolicy = () => {
  return (
    <main className="min-h-screen bg-background">
      <SEOHead
        title="Privacy Policy | TAXKORA"
        description="Learn how TAXKORA collects, uses, and protects your personal and financial data. We are committed to NDPR compliance and data security."
        canonicalUrl="https://taxkora.com/privacy"
        noIndex={false}
        keywords={["TAXKORA privacy policy", "Nigeria data protection", "NDPR compliance", "tax data security"]}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://taxkora.com" },
          { name: "Privacy Policy", url: "https://taxkora.com/privacy" },
        ]}
      />

      <Navbar />

      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Your privacy matters to us. This policy explains how TAXKORA collects, uses, stores, and protects your personal and financial information.
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
              <AccordionTrigger>Does TAXKORA sell my data to third parties?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                No. We never sell, trade, or rent your personal or financial information. Data is shared only with payment processors for transaction completion and as required by law.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2">
              <AccordionTrigger>How is my financial data protected?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Your data is protected through client-side encryption, row-level security, data masking, payment data isolation, and TLS encryption in transit. We follow industry best practices to ensure your financial information remains secure.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q3">
              <AccordionTrigger>Can I delete my account and all my data?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes. You can request account deletion by contacting us at alphalinkprime@gmail.com. Your personal data will be removed within 30 days, though certain financial records may be retained as required by Nigerian tax law.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q4">
              <AccordionTrigger>Is TAXKORA compliant with Nigerian data protection laws?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes. We are committed to compliance with the Nigeria Data Protection Regulation (NDPR) and the Nigeria Data Protection Act (NDPA). We implement appropriate technical and organisational measures to protect your data.
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

export default PrivacyPolicy;
