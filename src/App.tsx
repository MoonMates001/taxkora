import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import PaymentCallbackPage from "./pages/dashboard/PaymentCallbackPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="income" element={<IncomePage />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="tax" element={<TaxComputationPage />} />
              <Route path="business-tax" element={<BusinessTaxPage />} />
              <Route path="capital-assets" element={<CapitalAssetsPage />} />
              <Route path="wht" element={<WHTManagementPage />} />
              <Route path="vat" element={<VATReturnsPage />} />
              <Route path="payments" element={<TaxPaymentsPage />} />
              <Route path="payment-callback" element={<PaymentCallbackPage />} />
              <Route path="filing" element={<TaxFilingPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
