import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  TrendingDown,
  Calculator,
  Send,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  User,
  Wallet,
  Briefcase,
  Package,
  Receipt,
} from "lucide-react";

const DashboardSidebar = () => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isBusinessAccount = profile?.account_type === "business";

  const businessLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/invoices", label: "Invoices", icon: FileText },
    { href: "/dashboard/income", label: "Income", icon: TrendingUp },
    { href: "/dashboard/expenses", label: "Expenses", icon: TrendingDown },
    { href: "/dashboard/capital-assets", label: "Capital Assets", icon: Package },
    { href: "/dashboard/tax", label: "Personal Tax", icon: Calculator },
    { href: "/dashboard/business-tax", label: "Business Tax", icon: Briefcase },
    { href: "/dashboard/wht", label: "WHT Management", icon: Wallet },
    { href: "/dashboard/vat", label: "VAT Returns", icon: Receipt },
    { href: "/dashboard/filing", label: "Tax Filing", icon: Send },
  ];

  const personalLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/income", label: "Income", icon: Wallet },
    { href: "/dashboard/expenses", label: "Expenditure", icon: TrendingDown },
    { href: "/dashboard/tax", label: "Tax Computation", icon: Calculator },
    { href: "/dashboard/filing", label: "Tax Filing", icon: Send },
  ];

  const links = isBusinessAccount ? businessLinks : personalLinks;

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg shadow-card"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-40 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">T</span>
              </div>
              <span className="font-display font-bold text-xl text-foreground">TAXKORA</span>
            </Link>
          </div>

          {/* Account Type Badge */}
          <div className="px-6 py-4 border-b border-border">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                isBusinessAccount ? "bg-teal-50 text-primary" : "bg-coral-400/10 text-accent"
              }`}
            >
              {isBusinessAccount ? (
                <Building2 className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {isBusinessAccount ? "Business" : "Personal"} Account
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(link.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-border space-y-2">
            <Link
              to="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive("/dashboard/settings")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </Link>

            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
