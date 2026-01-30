import { useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const UrgencyBanner = () => {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("urgencyBannerDismissed");
    if (dismissed) setIsDismissed(true);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("urgencyBannerDismissed", "true");
  };

  if (isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-coral-600 via-coral-500 to-coral-600 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
      
      <div className="container relative mx-auto px-4 py-2.5">
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">Start your 90-day free trial today — no credit card required!</span>
          </div>

          {/* CTA */}
          <Link to="/auth" className="hidden md:block">
            <Button variant="secondary" size="sm" className="text-coral-600 hover:text-coral-700 h-7 text-xs font-semibold">
              Get Started
            </Button>
          </Link>

          {/* Close */}
          <button 
            onClick={handleDismiss}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UrgencyBanner;
