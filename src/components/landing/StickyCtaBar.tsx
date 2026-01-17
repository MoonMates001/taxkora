import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, X, Clock, Users } from "lucide-react";

const StickyCtaBar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero section (~500px)
      if (window.scrollY > 500 && !isDismissed) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDismissed]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="bg-primary/95 backdrop-blur-lg border-t border-primary-foreground/10 shadow-2xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Left side - urgency message */}
            <div className="flex items-center gap-4 text-primary-foreground">
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-coral-400" />
                <span><strong className="text-coral-400">127 people</strong> started their trial today</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-coral-400" />
                <span>90-day free trial • No credit card</span>
              </div>
            </div>

            {/* Right side - CTA */}
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="accent" size="sm" className="group whitespace-nowrap">
                  Start Free Trial Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <button 
                onClick={() => setIsDismissed(true)}
                className="p-1.5 text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyCtaBar;
