import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, User } from "lucide-react";
import { BusinessProfileForm } from "@/components/settings/BusinessProfileForm";
import { InvoiceCustomizationForm } from "@/components/settings/InvoiceCustomizationForm";

const SettingsPage = () => {
  const { profile } = useAuth();
  const isBusinessAccount = profile?.account_type === "business";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Section */}
      <BusinessProfileForm />

      {/* Invoice Customization - Only for business accounts */}
      {isBusinessAccount && <InvoiceCustomizationForm />}

      {/* Account Type */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display">Account Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`flex items-center gap-4 p-4 rounded-xl ${
              isBusinessAccount ? "bg-teal-50" : "bg-coral-400/10"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                isBusinessAccount ? "bg-primary" : "bg-accent"
              }`}
            >
              {isBusinessAccount ? (
                <Building2 className="w-7 h-7 text-primary-foreground" />
              ) : (
                <User className="w-7 h-7 text-accent-foreground" />
              )}
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-foreground">
                {isBusinessAccount ? "Business Account" : "Personal Account"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {isBusinessAccount
                  ? "Access to invoicing, business tax computation, and filing"
                  : "Access to personal income tracking and tax filing"}
              </p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm mt-4">
            To change your account type, please contact support.
          </p>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="shadow-card border-destructive/20">
        <CardHeader>
          <CardTitle className="font-display text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-destructive/20 rounded-lg">
            <div>
              <h4 className="font-semibold text-foreground">Delete Account</h4>
              <p className="text-muted-foreground text-sm">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
