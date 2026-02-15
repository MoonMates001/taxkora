import { lazy, Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";

// Eagerly load the landing page for fast LCP
import Index from "./pages/Index";

// Lazy-load non-critical shell components to reduce initial JS
const Toaster = lazy(() => import("@/components/ui/toaster").then(m => ({ default: m.Toaster })));
const Sonner = lazy(() => import("@/components/ui/sonner").then(m => ({ default: m.Toaster })));
const CookieConsentBanner = lazy(() => import("./components/CookieConsentBanner"));
const PWAInstallPrompt = lazy(() => import("./components/pwa/PWAInstallPrompt"));
const PWAUpdatePrompt = lazy(() => import("./components/pwa/PWAUpdatePrompt"));
const OfflineIndicator = lazy(() => import("./components/pwa/OfflineIndicator"));

// Lazy-load all other pages to break critical request chains
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DashboardLayout = lazy(() => import("./components/dashboard/DashboardLayout"));
const DashboardOverview = lazy(() => import("./pages/dashboard/DashboardOverview"));
const InvoicesPage = lazy(() => import("./pages/dashboard/InvoicesPage"));
const IncomePage = lazy(() => import("./pages/dashboard/IncomePage"));
const ExpensesPage = lazy(() => import("./pages/dashboard/ExpensesPage"));
const TaxComputationPage = lazy(() => import("./pages/dashboard/TaxComputationPage"));
const TaxFilingPage = lazy(() => import("./pages/dashboard/TaxFilingPage"));
const SettingsPage = lazy(() => import("./pages/dashboard/SettingsPage"));
const BusinessTaxPage = lazy(() => import("./pages/dashboard/BusinessTaxPage"));
const CapitalAssetsPage = lazy(() => import("./pages/dashboard/CapitalAssetsPage"));
const WHTManagementPage = lazy(() => import("./pages/dashboard/WHTManagementPage"));
const VATReturnsPage = lazy(() => import("./pages/dashboard/VATReturnsPage"));
const TaxPaymentsPage = lazy(() => import("./pages/dashboard/TaxPaymentsPage"));
const SubscriptionPage = lazy(() => import("./pages/dashboard/SubscriptionPage"));
const TrialCallbackPage = lazy(() => import("./pages/dashboard/TrialCallbackPage"));
const PaymentCallbackPage = lazy(() => import("./pages/dashboard/PaymentCallbackPage"));
const ReferralsPage = lazy(() => import("./pages/dashboard/ReferralsPage"));
const BlogManagementPage = lazy(() => import("./pages/dashboard/BlogManagementPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const InstallApp = lazy(() => import("./pages/InstallApp"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));

const queryClient = new QueryClient();

const LazyFallback = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0F172A", color: "#fff" }}>
    <p style={{ fontFamily: "system-ui, sans-serif", color: "#94a3b8" }}>Loading...</p>
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Suspense fallback={null}>
        <Toaster />
        <Sonner />
        <PWAInstallPrompt />
        <PWAUpdatePrompt />
        <OfflineIndicator />
      </Suspense>
      <BrowserRouter>
        <Suspense fallback={null}>
          <CookieConsentBanner />
        </Suspense>
        <AuthProvider>
          <Suspense fallback={<LazyFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/install" element={<InstallApp />} />
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardOverview />} />
                <Route path="subscription" element={<SubscriptionPage />} />
                <Route path="trial-callback" element={<TrialCallbackPage />} />
                <Route path="payment-callback" element={<PaymentCallbackPage />} />
                <Route path="invoices" element={<InvoicesPage />} />
                <Route path="income" element={<IncomePage />} />
                <Route path="expenses" element={<ExpensesPage />} />
                <Route path="tax" element={<TaxComputationPage />} />
                <Route path="business-tax" element={<BusinessTaxPage />} />
                <Route path="capital-assets" element={<CapitalAssetsPage />} />
                <Route path="wht" element={<WHTManagementPage />} />
                <Route path="vat" element={<VATReturnsPage />} />
                <Route path="payments" element={<TaxPaymentsPage />} />
                <Route path="filing" element={<TaxFilingPage />} />
                <Route path="referrals" element={<ReferralsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="blog" element={<BlogManagementPage />} />
              </Route>
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
