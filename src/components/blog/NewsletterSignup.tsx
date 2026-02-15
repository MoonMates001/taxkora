import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface NewsletterSignupProps {
  variant?: "inline" | "card";
  source?: string;
}

const NewsletterSignup = ({ variant = "card", source = "blog" }: NewsletterSignupProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: trimmed.toLowerCase(), source });

      if (error) {
        if (error.code === "23505") {
          toast.info("You're already subscribed!");
        } else {
          throw error;
        }
      } else {
        toast.success("You're subscribed! 🎉");
      }
      setEmail("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          required
          maxLength={255}
        />
        <Button type="submit" disabled={isSubmitting} size="sm">
          {isSubmitting ? "..." : "Subscribe"}
        </Button>
      </form>
    );
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
        <Mail className="w-6 h-6 text-primary" />
      </div>
      <h3 className="font-display text-xl font-bold text-foreground mb-2">
        Stay Updated on Nigerian Tax Changes
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Get the latest tax tips, compliance deadlines, and FIRS updates delivered to your inbox. No spam, ever.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          required
          maxLength={255}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>
      <p className="text-xs text-muted-foreground mt-3">
        Unsubscribe anytime. We respect your privacy.
      </p>
    </div>
  );
};

export default NewsletterSignup;
