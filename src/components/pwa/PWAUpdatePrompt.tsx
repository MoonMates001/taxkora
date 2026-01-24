import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWA } from "@/hooks/usePWA";

const PWAUpdatePrompt = () => {
  const { isUpdateAvailable, updateApp } = usePWA();

  if (!isUpdateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-md z-50 animate-in slide-in-from-top-4 duration-300">
      <div className="bg-primary text-primary-foreground rounded-xl shadow-xl p-4 flex items-center gap-3">
        <RefreshCw className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">A new version is available!</p>
          <p className="text-xs opacity-90">Click to update and get the latest features.</p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={updateApp}
          className="flex-shrink-0"
        >
          Update
        </Button>
      </div>
    </div>
  );
};

export default PWAUpdatePrompt;
