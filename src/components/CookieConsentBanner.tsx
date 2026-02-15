import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Cookie, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const CONSENT_KEY = "taxkora_cookie_consent";

interface CookiePreferences {
  necessary: boolean; // always true
  functional: boolean;
  analytics: boolean;
  consentedAt: string;
}

const getStoredPreferences = (): CookiePreferences | null => {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const savePreferences = (prefs: CookiePreferences) => {
  localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
};

const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [functional, setFunctional] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const prefs = getStoredPreferences();
    if (!prefs) {
      // Small delay to not distract from initial page load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = useCallback(() => {
    const prefs: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      consentedAt: new Date().toISOString(),
    };
    savePreferences(prefs);
    setVisible(false);
  }, []);

  const handleRejectNonEssential = useCallback(() => {
    const prefs: CookiePreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      consentedAt: new Date().toISOString(),
    };
    savePreferences(prefs);
    setVisible(false);
  }, []);

  const handleSavePreferences = useCallback(() => {
    const prefs: CookiePreferences = {
      necessary: true,
      functional,
      analytics,
      consentedAt: new Date().toISOString(),
    };
    savePreferences(prefs);
    setVisible(false);
  }, [functional, analytics]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6 animate-slide-up">
      <div className="container mx-auto max-w-3xl">
        <div className="rounded-2xl border bg-card shadow-xl p-5 md:p-6 relative">
          {/* Close button */}
          <button
            onClick={handleRejectNonEssential}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close cookie banner"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3 mb-4">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Cookie className="w-5 h-5 text-primary" />
            </div>
            <div className="pr-6">
              <h3 className="font-semibold text-foreground text-base mb-1">We value your privacy</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We use cookies to keep you logged in and improve your experience. Analytics cookies are optional.{" "}
                <Link to="/cookies" className="text-primary hover:underline">
                  Read our Cookie Policy
                </Link>
              </p>
            </div>
          </div>

          {/* Customize panel */}
          {showCustomize && (
            <div className="mb-4 p-4 rounded-xl bg-muted/50 border space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium text-foreground text-sm">Essential Cookies</Label>
                  <p className="text-xs text-muted-foreground">Authentication & security — always on</p>
                </div>
                <Switch checked disabled aria-label="Essential cookies (always enabled)" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium text-foreground text-sm">Functional Cookies</Label>
                  <p className="text-xs text-muted-foreground">Theme, preferences & PWA install prompts</p>
                </div>
                <Switch checked={functional} onCheckedChange={setFunctional} aria-label="Functional cookies" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium text-foreground text-sm">Analytics Cookies</Label>
                  <p className="text-xs text-muted-foreground">Anonymous usage statistics via Shown.io</p>
                </div>
                <Switch checked={analytics} onCheckedChange={setAnalytics} aria-label="Analytics cookies" />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleAcceptAll} size="sm" className="flex-1 sm:flex-none">
              Accept All
            </Button>
            <Button onClick={handleRejectNonEssential} variant="outline" size="sm" className="flex-1 sm:flex-none">
              Reject Non-Essential
            </Button>
            {!showCustomize ? (
              <Button
                onClick={() => setShowCustomize(true)}
                variant="ghost"
                size="sm"
                className="flex-1 sm:flex-none gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                Customise
              </Button>
            ) : (
              <Button onClick={handleSavePreferences} variant="secondary" size="sm" className="flex-1 sm:flex-none">
                Save Preferences
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Separator = () => <div className="border-t border-border" />;

export default CookieConsentBanner;
