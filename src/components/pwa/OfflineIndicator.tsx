import { WifiOff } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";

const OfflineIndicator = () => {
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-accent text-accent-foreground py-2 px-4 z-50">
      <div className="container mx-auto flex items-center justify-center gap-2 text-sm">
        <WifiOff className="w-4 h-4" />
        <span>You're offline. Some features may be limited.</span>
      </div>
    </div>
  );
};

export default OfflineIndicator;
