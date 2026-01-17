import { useState, useEffect } from "react";
import { CheckCircle2, UserPlus, FileCheck, Zap } from "lucide-react";

interface Notification {
  id: number;
  type: "signup" | "filing" | "savings";
  name: string;
  location: string;
  message: string;
  time: string;
}

const notifications: Notification[] = [
  { id: 1, type: "signup", name: "Chinedu O.", location: "Lagos", message: "just started their free trial", time: "2 min ago" },
  { id: 2, type: "filing", name: "Amaka N.", location: "Abuja", message: "filed their Q4 taxes successfully", time: "5 min ago" },
  { id: 3, type: "savings", name: "Ibrahim M.", location: "Kano", message: "saved ₦145,000 on tax deductions", time: "8 min ago" },
  { id: 4, type: "signup", name: "Folake A.", location: "Lagos", message: "just started their free trial", time: "12 min ago" },
  { id: 5, type: "filing", name: "Emeka C.", location: "Port Harcourt", message: "computed their annual CIT", time: "15 min ago" },
  { id: 6, type: "savings", name: "Hauwa B.", location: "Kaduna", message: "discovered ₦89,000 in missed deductions", time: "18 min ago" },
  { id: 7, type: "signup", name: "Tunde K.", location: "Ibadan", message: "joined from a friend's referral", time: "22 min ago" },
  { id: 8, type: "filing", name: "Ngozi E.", location: "Enugu", message: "submitted their VAT returns", time: "25 min ago" },
];

const SocialProofTicker = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Initial delay before first notification
    const initialDelay = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      // Start exit animation
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % notifications.length);
        setIsAnimating(false);
      }, 300);
    }, 6000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const notification = notifications[currentIndex];
  
  const getIcon = () => {
    switch (notification.type) {
      case "signup":
        return <UserPlus className="w-4 h-4 text-primary" />;
      case "filing":
        return <FileCheck className="w-4 h-4 text-green-500" />;
      case "savings":
        return <Zap className="w-4 h-4 text-coral-500" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case "signup":
        return "bg-primary/10";
      case "filing":
        return "bg-green-500/10";
      case "savings":
        return "bg-coral-500/10";
    }
  };

  return (
    <div 
      className={`fixed bottom-20 left-4 z-40 max-w-sm transition-all duration-300 ${
        isAnimating ? "opacity-0 translate-x-[-20px]" : "opacity-100 translate-x-0"
      }`}
    >
      <div className="bg-card rounded-xl shadow-xl border border-border p-4 flex items-start gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getBgColor()}`}>
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground text-sm">{notification.name}</span>
            <span className="text-xs text-muted-foreground">{notification.location}</span>
          </div>
          <p className="text-sm text-muted-foreground">{notification.message}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            <span className="text-xs text-muted-foreground">{notification.time}</span>
          </div>
        </div>

        {/* Close button */}
        <button 
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground/50 hover:text-muted-foreground text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default SocialProofTicker;
