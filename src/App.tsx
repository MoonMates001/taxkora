import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import InvoicesPage from "./pages/dashboard/InvoicesPage";
import IncomePage from "./pages/dashboard/IncomePage";
import ExpensesPage from "./pages/dashboard/ExpensesPage";
import TaxComputationPage from "./pages/dashboard/TaxComputationPage";
import TaxFilingPage from "./pages/dashboard/TaxFilingPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import BusinessTaxPage from "./pages/dashboard/BusinessTaxPage";
import CapitalAssetsPage from "./pages/dashboard/CapitalAssetsPage";
import WHTManagementPage from "./pages/dashboard/WHTManagementPage";
import VATReturnsPage from "./pages/dashboard/VATReturnsPage";
import TaxPaymentsPage from "./pages/dashboard/TaxPaymentsPage";
import SubscriptionPage from "./pages/dashboard/SubscriptionPage";
import TrialCallbackPage from "./pages/dashboard/TrialCallbackPage";
import PaymentCallbackPage from "./pages/dashboard/PaymentCallbackPage";
import ReferralsPage from "./pages/dashboard/ReferralsPage";
import BlogManagementPage from "./pages/dashboard/BlogManagementPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import InstallApp from "./pages/InstallApp";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import SupportPage from "./pages/SupportPage";
import CookiePolicy from "./pages/CookiePolicy";
import CookieConsentBanner from "./components/CookieConsentBanner";
import PWAInstallPrompt from "./components/pwa/PWAInstallPrompt";
import PWAUpdatePrompt from "./components/pwa/PWAUpdatePrompt";
import OfflineIndicator from "./components/pwa/OfflineIndicator";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PWAInstallPrompt />
      <PWAUpdatePrompt />
      <OfflineIndicator />
      <BrowserRouter>
        <CookieConsentBanner />
        <AuthProvider>
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
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
