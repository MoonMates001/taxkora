import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { X, Gift, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

const ExitIntentPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if already shown in this session
    const shown = sessionStorage.getItem("exitIntentShown");
    if (shown) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when mouse moves to top of viewport (exit intent)
      if (e.clientY <= 5 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem("exitIntentShown", "true");
      }
    };

    // Also trigger after 45 seconds of inactivity (mobile fallback)
    const timeout = setTimeout(() => {
      if (!hasShown) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem("exitIntentShown", "true");
      }
    }, 45000);

    document.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(timeout);
    };
  }, [hasShown]);

  if (!isVisible) return null;

  const benefits = [
    "90-day extended free trial",
    "Priority onboarding support",
    "Free tax consultation call",
    "Early access to new features"
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm animate-fade-in"
        onClick={() => setIsVisible(false)}
      />

      {/* Popup */}
      <div className="relative bg-card rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-scale-in border border-border overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-coral-500/20 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        {/* Close button */}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="relative text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-gradient-to-br from-coral-500 to-coral-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Gift className="w-8 h-8 text-white" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-coral-500/10 rounded-full text-coral-500 text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            Exclusive Offer
          </div>

          {/* Headline */}
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Wait! Don't Leave Empty-Handed
          </h3>

          <p className="text-muted-foreground mb-6">
            Start your tax compliance journey with these exclusive benefits—only for new users!
          </p>

          {/* Benefits */}
          <div className="text-left space-y-3 mb-8">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm text-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link to="/auth" className="block">
            <Button variant="accent" size="xl" className="w-full group">
              Claim Your Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <button 
            onClick={() => setIsVisible(false)}
            className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            No thanks, I'll pay full price later
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitIntentPopup;
