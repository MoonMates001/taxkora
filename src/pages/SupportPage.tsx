import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import { SEOHead, BreadcrumbJsonLd } from "@/components/seo";
import {
  Mail, Phone, MapPin, MessageSquare, Clock, Send, Loader2,
  HelpCircle, Trash2, Shield, AlertTriangle, BookOpen, CreditCard,
  Settings, FileText
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCreateSupportTicket } from "@/hooks/useSupportTickets";
import { z } from "zod";

const Footer = lazy(() => import("@/components/landing/Footer"));

const supportSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().max(20).optional(),
  subject: z.string().trim().min(5, "Subject must be at least 5 characters").max(200),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
  category: z.string().optional(),
});

const categories = [
  { value: "general", label: "General Inquiry" },
  { value: "billing", label: "Billing & Payments" },
  { value: "technical", label: "Technical Support" },
  { value: "tax-advice", label: "Tax Guidance" },
  { value: "account-deletion", label: "Account Deletion" },
  { value: "data-request", label: "Data Request (NDPR)" },
  { value: "partnership", label: "Partnership" },
  { value: "feedback", label: "Feedback" },
];

const contactMethods = [
  {
    icon: Mail,
    title: "Email Support",
    value: "alphalinkprime@gmail.com",
    href: "mailto:alphalinkprime@gmail.com",
    description: "Response within 24 hours",
  },
  {
    icon: Phone,
    title: "Phone Support",
    value: "+234 707 770 6706",
    href: "tel:+2347077706706",
    description: "Mon–Fri, 9 am – 6 pm WAT",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp",
    value: "+234 707 770 6706",
    href: "https://wa.me/2347077706706",
    description: "Quick responses via WhatsApp",
  },
  {
    icon: MapPin,
    title: "Office",
    value: "Lagos, Nigeria",
    href: "#",
    description: "Visit us in person",
  },
];

const faqItems = [
  {
    id: "faq-1",
    icon: CreditCard,
    question: "How do I upgrade or change my subscription plan?",
    answer:
      "Navigate to Dashboard → Subscription to view your current plan and upgrade options. You can switch between PIT Individual, PIT Business, and CIT plans at any time. Changes take effect immediately, and your billing will be prorated.",
  },
  {
    id: "faq-2",
    icon: Settings,
    question: "How do I reset my password?",
    answer:
      'On the login page, click "Forgot Password" and enter your registered email address. You\'ll receive a secure link to create a new password. The link expires after 1 hour for security purposes.',
  },
  {
    id: "faq-3",
    icon: FileText,
    question: "Can I export my financial data?",
    answer:
      "Yes. You can generate and download PDF invoices directly from the Invoices page. Tax computation summaries can also be exported. For a complete data export under your NDPR rights, contact our support team.",
  },
  {
    id: "faq-4",
    icon: Shield,
    question: "How is my financial data protected?",
    answer:
      "We use client-side encryption, row-level security, data masking, and payment data isolation. All data in transit is encrypted via TLS/SSL. Payment processing is handled by Flutterwave — we never store full card details. See our Privacy Policy for full details.",
  },
  {
    id: "faq-5",
    icon: BookOpen,
    question: "Are TAXKORA's tax computations legally binding?",
    answer:
      "No. TAXKORA is a computational tool, not a licensed tax advisory firm. Computations are based on current Nigerian tax legislation and the data you provide. We strongly recommend verifying results with a qualified tax professional before filing.",
  },
  {
    id: "faq-6",
    icon: HelpCircle,
    question: "What happens when my subscription expires?",
    answer:
      "When your subscription expires, you retain read-only access to your data but cannot create new records or generate computations. You can renew at any time to restore full access. Your data is never deleted due to subscription expiry.",
  },
  {
    id: "faq-7",
    icon: AlertTriangle,
    question: "I found a bug — how do I report it?",
    answer:
      'Use the support form on this page and select "Technical Support" as the category. Include as much detail as possible: the page you were on, what you expected to happen, and what actually happened. Screenshots are very helpful.',
  },
];

const SupportPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    category: "general",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const createTicket = useCreateSupportTicket();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = supportSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    await createTicket.mutateAsync({
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone,
      subject: result.data.subject,
      message: result.data.message,
      category: result.data.category,
    });
    setFormData({ name: "", email: "", phone: "", subject: "", message: "", category: "general" });
  };

  const handleDeletionRequest = async () => {
    const result = supportSchema.safeParse({
      ...formData,
      subject: "Account & Data Deletion Request",
      message: `I would like to request the deletion of my account and all associated data in accordance with the Nigeria Data Protection Regulation (NDPR). My registered email address is: ${formData.email || "[please provide your email]"}.`,
      category: "account-deletion",
      name: formData.name || "Account Holder",
    });

    if (!result.success) {
      setErrors({ email: "Please enter your registered email address above to proceed." });
      // Scroll to form
      document.getElementById("support-form")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    await createTicket.mutateAsync({
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone,
      subject: "Account & Data Deletion Request",
      message: `I would like to request the deletion of my account and all associated data in accordance with the Nigeria Data Protection Regulation (NDPR). My registered email address is: ${result.data.email}.`,
      category: "account-deletion",
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <SEOHead
        title="Customer Support | TAXKORA"
        description="Get help with TAXKORA. Contact our support team, browse FAQs, or request account deletion. We're here to assist with tax computation, billing, and data requests."
        canonicalUrl="https://taxkora.com/support"
        noIndex={false}
        keywords={["TAXKORA support", "customer support Nigeria", "tax help", "account deletion request", "NDPR data request"]}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://taxkora.com" },
          { name: "Customer Support", url: "https://taxkora.com/support" },
        ]}
      />

      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 max-w-5xl">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Customer Support
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Have a question, need help, or want to make a data request? We're here for you. Browse our FAQs or reach out directly — our team responds within 24 hours.
          </p>
        </header>

        {/* Contact Methods */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Contact Us
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.href}
                target={method.href.startsWith("http") ? "_blank" : undefined}
                rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group flex flex-col items-center text-center gap-3 p-6 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <method.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {method.title}
                  </h3>
                  <p className="text-primary font-medium text-sm">{method.value}</p>
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {method.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <Separator className="mb-16" />

        {/* Support Form */}
        <section id="support-form" className="mb-16 scroll-mt-24">
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Send Us a Message
          </h2>
          <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email Address *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+234 XXX XXX XXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Subject *</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="How can we help?"
                  className={errors.subject ? "border-destructive" : ""}
                />
                {errors.subject && <p className="text-sm text-destructive mt-1">{errors.subject}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Message *</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your question or issue in detail..."
                  rows={5}
                  className={errors.message ? "border-destructive" : ""}
                />
                {errors.message && <p className="text-sm text-destructive mt-1">{errors.message}</p>}
              </div>

              <Button type="submit" size="lg" className="w-full group" disabled={createTicket.isPending}>
                {createTicket.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </section>

        <Separator className="mb-16" />

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-left">
                  <span className="flex items-center gap-2">
                    <item.icon className="w-4 h-4 text-primary shrink-0" />
                    {item.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pl-6">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <Separator className="mb-16" />

        {/* Account Deletion Request */}
        <section id="delete-account" className="mb-16 scroll-mt-24">
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 shrink-0 w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-destructive" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Request Account & Data Deletion
                </h2>
                <p className="text-muted-foreground mb-4">
                  Under the Nigeria Data Protection Regulation (NDPR), you have the right to request deletion of your account and all associated personal data. Please note:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                  <li>Your account and personal data will be permanently deleted within <strong>30 days</strong> of a verified request.</li>
                  <li>Financial records may be retained for up to <strong>6 years</strong> as required by Nigerian tax law (FIRS regulations).</li>
                  <li>Active subscriptions will be <strong>cancelled immediately</strong> upon account deletion. No refunds are issued for remaining subscription periods.</li>
                  <li>This action is <strong>irreversible</strong> — all income, expense, invoice, and tax computation data will be permanently removed.</li>
                  <li>We will send a confirmation email once your request has been processed.</li>
                </ul>

                <div className="flex flex-col sm:flex-row gap-3">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2">
                        <Trash2 className="w-4 h-4" />
                        Request Account Deletion
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will submit a request to permanently delete your TAXKORA account and all associated data. Please ensure you have entered your <strong>name</strong> and <strong>registered email address</strong> in the support form above before proceeding.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeletionRequest}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Yes, Submit Deletion Request
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button variant="outline" asChild className="gap-2">
                    <a href="mailto:alphalinkprime@gmail.com?subject=Account%20%26%20Data%20Deletion%20Request&body=I%20would%20like%20to%20request%20the%20deletion%20of%20my%20TAXKORA%20account%20and%20all%20associated%20data.%0A%0ARegistered%20email%3A%20%0AAccount%20name%3A%20%0A%0APlease%20confirm%20when%20this%20has%20been%20processed.">
                      <Mail className="w-4 h-4" />
                      Request via Email Instead
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Links */}
        <div className="text-center space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/" className="text-primary hover:underline">← Back to Home</Link>
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="min-h-[200px]" />}>
        <Footer />
      </Suspense>
    </main>
  );
};

export default SupportPage;
