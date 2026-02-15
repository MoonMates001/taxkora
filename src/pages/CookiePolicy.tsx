import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import { SEOHead, BreadcrumbJsonLd } from "@/components/seo";
import { Cookie, Shield, Settings, BarChart3, Globe, Clock, UserCheck, Mail } from "lucide-react";
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
    id: "what-are-cookies",
    icon: Cookie,
    title: "1. What Are Cookies?",
    content: (
      <>
        <p className="mb-4">
          Cookies are small text files placed on your device when you visit a website. They help the site remember your preferences, understand how you use the site, and improve your overall experience. Similar technologies include local storage, session storage, and service worker caches.
        </p>
        <p>
          TAXKORA uses cookies and similar technologies to provide essential functionality, maintain your session security, and understand how our platform is used so we can continually improve it.
        </p>
      </>
    ),
  },
  {
    id: "cookies-we-use",
    icon: Settings,
    title: "2. Types of Cookies We Use",
    content: (
      <>
        <h4 className="font-semibold text-foreground mb-2">2.1 Strictly Necessary Cookies</h4>
        <p className="mb-3">These cookies are essential for the platform to function. They cannot be disabled.</p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-semibold text-foreground">Cookie / Storage</th>
                <th className="text-left py-2 pr-4 font-semibold text-foreground">Purpose</th>
                <th className="text-left py-2 font-semibold text-foreground">Duration</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-mono text-xs">sb-*-auth-token</td>
                <td className="py-2 pr-4">Authentication session token — keeps you securely logged in</td>
                <td className="py-2">Session / 7 days</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-mono text-xs">sb-*-auth-token-code-verifier</td>
                <td className="py-2 pr-4">PKCE code verifier for secure OAuth flows</td>
                <td className="py-2">Session</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-mono text-xs">taxkora_cookie_consent</td>
                <td className="py-2 pr-4">Stores your cookie consent preferences</td>
                <td className="py-2">365 days</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="font-semibold text-foreground mb-2">2.2 Functional Cookies</h4>
        <p className="mb-3">These cookies enhance your experience by remembering your preferences.</p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-semibold text-foreground">Cookie / Storage</th>
                <th className="text-left py-2 pr-4 font-semibold text-foreground">Purpose</th>
                <th className="text-left py-2 font-semibold text-foreground">Duration</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-mono text-xs">theme</td>
                <td className="py-2 pr-4">Saves your light/dark mode preference</td>
                <td className="py-2">Persistent</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-mono text-xs">pwa-install-dismissed</td>
                <td className="py-2 pr-4">Remembers if you dismissed the install prompt</td>
                <td className="py-2">30 days</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-mono text-xs">selectedYear</td>
                <td className="py-2 pr-4">Remembers your selected tax year in the dashboard</td>
                <td className="py-2">Session</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="font-semibold text-foreground mb-2">2.3 Analytics Cookies</h4>
        <p className="mb-3">These cookies help us understand how visitors interact with the platform so we can improve it. They are only loaded after you consent.</p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-semibold text-foreground">Cookie / Storage</th>
                <th className="text-left py-2 pr-4 font-semibold text-foreground">Purpose</th>
                <th className="text-left py-2 font-semibold text-foreground">Duration</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 font-mono text-xs">Shown.io analytics</td>
                <td className="py-2 pr-4">Privacy-friendly web analytics — page views, referrers, device types</td>
                <td className="py-2">Session</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="font-semibold text-foreground mb-2">2.4 Service Worker & PWA Storage</h4>
        <p className="mb-3">TAXKORA is a Progressive Web App (PWA). Service workers cache application assets for offline access and faster loading. This data stays on your device and is not transmitted to our servers.</p>
      </>
    ),
  },
  {
    id: "third-party-cookies",
    icon: Globe,
    title: "3. Third-Party Cookies",
    content: (
      <>
        <p className="mb-4">We limit third-party cookies to essential services only:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Flutterwave:</strong> Our payment processor may set cookies during the checkout process to prevent fraud and complete transactions securely. These are governed by <a href="https://flutterwave.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Flutterwave's Privacy Policy</a>.</li>
          <li><strong>Shown.io:</strong> Our privacy-friendly analytics provider uses minimal cookies for aggregated, anonymised usage statistics. No personal data is collected.</li>
        </ul>
        <p className="mt-4">We do <strong>not</strong> use any third-party advertising cookies or retargeting trackers.</p>
      </>
    ),
  },
  {
    id: "managing-cookies",
    icon: UserCheck,
    title: "4. Managing Your Cookie Preferences",
    content: (
      <>
        <p className="mb-4">You have full control over your cookie preferences:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li><strong>Cookie Consent Banner:</strong> When you first visit TAXKORA, a consent banner lets you accept all cookies, reject non-essential cookies, or customise your preferences by category.</li>
          <li><strong>Browser Settings:</strong> Most browsers allow you to block or delete cookies via settings. Note that blocking essential cookies may prevent you from using the platform.</li>
          <li><strong>Clearing Storage:</strong> You can clear local storage, session storage, and service worker caches through your browser's developer tools or settings.</li>
        </ul>

        <h4 className="font-semibold text-foreground mb-2">Browser-Specific Instructions</h4>
        <ul className="list-disc pl-6 space-y-1">
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/en-us/105082" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
          <li><a href="https://support.microsoft.com/en-us/microsoft-edge/manage-cookies-in-microsoft-edge-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
        </ul>
      </>
    ),
  },
  {
    id: "data-retention",
    icon: Clock,
    title: "5. Cookie Data Retention",
    content: (
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Session Cookies:</strong> Deleted when you close your browser.</li>
        <li><strong>Authentication Cookies:</strong> Expire after 7 days or when you log out.</li>
        <li><strong>Consent Cookie:</strong> Retained for 365 days so we don't ask you again on every visit.</li>
        <li><strong>PWA Cache:</strong> Persists until you uninstall the app or clear browser data.</li>
        <li><strong>Preference Cookies:</strong> Persist until cleared manually or the specified expiry.</li>
      </ul>
    ),
  },
  {
    id: "legal-basis",
    icon: Shield,
    title: "6. Legal Basis for Cookies",
    content: (
      <>
        <p className="mb-4">Our use of cookies is based on the following legal grounds under the Nigeria Data Protection Regulation (NDPR):</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Strictly Necessary Cookies:</strong> Legitimate interest — required for the platform to function securely.</li>
          <li><strong>Functional Cookies:</strong> Legitimate interest — enhance user experience without processing personal data externally.</li>
          <li><strong>Analytics Cookies:</strong> Consent — loaded only after you opt in via the cookie consent banner.</li>
        </ul>
      </>
    ),
  },
  {
    id: "changes",
    icon: BarChart3,
    title: "7. Changes to This Cookie Policy",
    content: (
      <p>
        We may update this Cookie Policy to reflect changes in our practices or legal requirements. Material changes will be communicated through a revised "Last Updated" date on this page and, where appropriate, a renewed consent request via the cookie banner. We encourage you to review this page periodically.
      </p>
    ),
  },
  {
    id: "contact",
    icon: Mail,
    title: "8. Contact Us",
    content: (
      <>
        <p className="mb-4">If you have questions about our use of cookies or this policy, please contact us:</p>
        <ul className="space-y-2">
          <li><strong>Email:</strong> <a href="mailto:alphalinkprime@gmail.com" className="text-primary hover:underline">alphalinkprime@gmail.com</a></li>
          <li><strong>Phone:</strong> <a href="tel:+2347077706706" className="text-primary hover:underline">+234 707 770 6706</a></li>
          <li><strong>Address:</strong> Lagos, Nigeria</li>
        </ul>
        <p className="mt-4">
          For complaints regarding data protection, contact the National Information Technology Development Agency (NITDA) at{" "}
          <a href="https://nitda.gov.ng" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">nitda.gov.ng</a>.
        </p>
      </>
    ),
  },
];

const faqItems = [
  {
    q: "Does TAXKORA use advertising or tracking cookies?",
    a: "No. We do not use any advertising cookies, retargeting pixels, or cross-site tracking. Our analytics are privacy-friendly and anonymised.",
  },
  {
    q: "What happens if I reject all cookies?",
    a: "Essential cookies for authentication and security will still function — they are required for the platform to work. Analytics cookies will not be loaded, meaning we won't collect any usage data from your visit.",
  },
  {
    q: "Can I change my cookie preferences later?",
    a: "Yes. You can update your preferences at any time by clicking the cookie settings icon in the bottom-left corner of any page, or by clearing your browser cookies and revisiting the site.",
  },
  {
    q: "Does TAXKORA share cookie data with third parties?",
    a: "No cookie data is shared with advertisers or data brokers. Only our payment processor (Flutterwave) and analytics provider (Shown.io) may set cookies as described in this policy.",
  },
  {
    q: "Are cookies used differently on mobile vs desktop?",
    a: "The same cookie policy applies across all devices. If you use the TAXKORA PWA (installed on your home screen), service worker caches will additionally store app assets for offline access.",
  },
];

const CookiePolicy = () => {
  return (
    <main className="min-h-screen bg-background">
      <SEOHead
        title="Cookie Policy | TAXKORA"
        description="Learn how TAXKORA uses cookies and similar technologies. Understand your choices and how to manage cookie preferences on our Nigerian tax compliance platform."
        canonicalUrl="https://taxkora.com/cookies"
        noIndex={false}
        keywords={["TAXKORA cookie policy", "cookies Nigeria", "NDPR cookies", "tax platform cookies"]}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://taxkora.com" },
          { name: "Cookie Policy", url: "https://taxkora.com/cookies" },
        ]}
      />

      <Navbar />

      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Cookie className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Cookie Policy
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            This policy explains how TAXKORA uses cookies and similar technologies, what data they collect, and how you can control them.
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
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`q${i + 1}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Related Links */}
        <div className="p-6 rounded-xl border bg-card mb-10">
          <h3 className="font-semibold text-foreground mb-3">Related Policies</h3>
          <div className="flex flex-wrap gap-4">
            <Link to="/privacy" className="text-sm text-primary hover:underline">Privacy Policy</Link>
            <Link to="/terms" className="text-sm text-primary hover:underline">Terms of Service</Link>
            <Link to="/support" className="text-sm text-primary hover:underline">Customer Support</Link>
          </div>
        </div>

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

export default CookiePolicy;
