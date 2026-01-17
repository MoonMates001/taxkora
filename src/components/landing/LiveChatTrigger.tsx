import { useState, useEffect } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const LiveChatTrigger = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Show helpful message after 15 seconds
    const timeout = setTimeout(() => {
      if (!hasInteracted) {
        setShowPulse(true);
      }
    }, 15000);

    return () => clearTimeout(timeout);
  }, [hasInteracted]);

  const quickQuestions = [
    "How does the free trial work?",
    "What taxes can TAXKORA help with?",
    "Is my data secure?",
    "Can I import existing data?"
  ];

  return (
    <>
      {/* Chat bubble trigger */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setHasInteracted(true);
          setShowPulse(false);
        }}
        className={`fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          isOpen 
            ? "bg-muted text-muted-foreground hover:bg-muted/90" 
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            {showPulse && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-coral-500"></span>
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-40 right-4 z-50 w-80 sm:w-96 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-primary p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-semibold text-primary-foreground">TAXKORA Assistant</div>
                <div className="text-xs text-primary-foreground/70 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Online • Typically replies instantly
                </div>
              </div>
            </div>
          </div>

          {/* Chat content */}
          <div className="p-4 max-h-80 overflow-y-auto">
            {/* Bot message */}
            <div className="flex gap-3 mb-4">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-secondary rounded-2xl rounded-tl-sm p-3 max-w-[80%]">
                <p className="text-sm text-foreground">
                  Hi there! 👋 I'm here to help you understand how TAXKORA can simplify your tax compliance. What would you like to know?
                </p>
              </div>
            </div>

            {/* Quick questions */}
            <div className="space-y-2">
              {quickQuestions.map((question, i) => (
                <Link 
                  key={i}
                  to="/auth"
                  className="block w-full text-left p-3 bg-background border border-border rounded-xl text-sm text-foreground hover:border-primary/30 hover:bg-primary/5 transition-colors"
                >
                  {question}
                </Link>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your question..."
                className="flex-1 px-4 py-2 rounded-full border border-border bg-background text-sm focus:outline-none focus:border-primary"
                onFocus={() => {
                  // Redirect to auth on focus (engagement)
                }}
              />
              <Link to="/auth">
                <Button size="icon" className="rounded-full">
                  <Send className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Sign up to chat with our AI tax advisor
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveChatTrigger;
