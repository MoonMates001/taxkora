import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, User, Mail, Phone, Save } from "lucide-react";

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
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            {isBusinessAccount ? (
              <Building2 className="w-5 h-5 text-primary" />
            ) : (
              <User className="w-5 h-5 text-accent" />
            )}
            {isBusinessAccount ? "Business Profile" : "Personal Profile"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                defaultValue={profile?.full_name || ""}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  defaultValue={profile?.email || ""}
                  placeholder="Enter your email"
                  className="pl-10"
                  disabled
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  defaultValue={profile?.phone || ""}
                  placeholder="Enter your phone number"
                  className="pl-10"
                />
              </div>
            </div>
            {isBusinessAccount && (
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="businessName"
                    defaultValue={profile?.business_name || ""}
                    placeholder="Enter your business name"
                    className="pl-10"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4">
            <Button className="gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

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
