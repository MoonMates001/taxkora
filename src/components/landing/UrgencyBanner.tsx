import { useState, useEffect } from "react";
import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const UrgencyBanner = () => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 30 });

  useEffect(() => {
    // Check if dismissed this session
    const dismissed = sessionStorage.getItem("urgencyBannerDismissed");
    if (dismissed) setIsDismissed(true);
  }, []);

  useEffect(() => {
    // Countdown timer
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("urgencyBannerDismissed", "true");
  };

  if (isDismissed) return null;

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="bg-gradient-to-r from-coral-600 via-coral-500 to-coral-600 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
      
      <div className="container relative mx-auto px-4 py-2.5">
        <div className="flex items-center justify-center gap-4 text-sm">
          {/* Timer */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-medium">Limited time offer ends in:</span>
            <div className="flex gap-1 font-mono font-bold">
              <span className="bg-white/20 rounded px-1.5 py-0.5">{pad(timeLeft.hours)}</span>
              <span>:</span>
              <span className="bg-white/20 rounded px-1.5 py-0.5">{pad(timeLeft.minutes)}</span>
              <span>:</span>
              <span className="bg-white/20 rounded px-1.5 py-0.5">{pad(timeLeft.seconds)}</span>
            </div>
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
