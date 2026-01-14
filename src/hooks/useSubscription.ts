import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export type SubscriptionPlan = "pit_individual" | "pit_business" | "cit";
export type SubscriptionStatus = "active" | "expired" | "cancelled" | "pending";

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  amount: number;
  start_date: string | null;
  end_date: string | null;
  payment_reference: string | null;
  flutterwave_tx_ref: string | null;
  card_token: string | null;
  card_last_four: string | null;
  card_expiry: string | null;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export const SUBSCRIPTION_PLANS = {
  pit_individual: {
    name: "Individual PIT",
    description: "Personal Income Tax filing for individuals without business",
    amount: 2500,
    trialDays: 90, // 3 months
    features: [
      "Annual PIT computation",
      "Tax liability tracking",
      "Payment reminders",
      "Basic tax reports",
    ],
  },
  pit_business: {
    name: "Business PIT",
    description: "Personal Income Tax filing for business owners",
    amount: 7500,
    trialDays: 90, // 3 months
    features: [
      "Full PIT computation with business income",
      "Expense tracking & deductions",
      "Invoice management",
      "VAT & WHT tracking",
      "Comprehensive tax reports",
    ],
  },
  cit: {
    name: "Companies Income Tax",
    description: "Corporate tax filing for registered companies",
    amount: 25000,
    trialDays: 90, // 3 months
    features: [
      "Complete CIT computation",
      "Capital allowance tracking",
      "Multi-year tax planning",
      "Advanced financial reports",
      "Priority support",
    ],
  },
} as const;

export const useSubscription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Subscription | null;
    },
    enabled: !!user?.id,
  });

  const { data: allSubscriptions } = useQuery({
    queryKey: ["all-subscriptions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Subscription[];
    },
    enabled: !!user?.id,
  });

  const createPendingSubscription = useMutation({
    mutationFn: async ({
      plan,
      txRef,
    }: {
      plan: SubscriptionPlan;
      txRef: string;
    }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const planDetails = SUBSCRIPTION_PLANS[plan];

      const { data, error } = await supabase
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan,
          status: "pending",
          amount: planDetails.amount,
          flutterwave_tx_ref: txRef,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["all-subscriptions"] });
    },
    onError: (error) => {
      toast.error("Failed to create subscription: " + error.message);
    },
  });

  // New: Initiate trial with card tokenization
  const initiateTrialWithCard = useMutation({
    mutationFn: async ({ plan, email, name, phone }: { plan: SubscriptionPlan; email: string; name: string; phone?: string }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase.functions.invoke("flutterwave-tokenize", {
        body: { plan, email, name, phone },
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      return data as { status: string; payment_link: string; tx_ref: string };
    },
    onError: (error) => {
      toast.error("Failed to initiate trial: " + error.message);
    },
  });

  // Legacy: Start trial without card (kept for backward compatibility but not used in new flow)
  const startTrialSubscription = useMutation({
    mutationFn: async ({ plan, email, name }: { plan: SubscriptionPlan; email: string; name: string }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const planDetails = SUBSCRIPTION_PLANS[plan];
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + planDetails.trialDays);

      const { data, error } = await supabase
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan,
          status: "active",
          amount: 0, // Trial is free
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
          payment_reference: "TRIAL",
        })
        .select()
        .single();

      if (error) throw error;

      // Send trial welcome email
      try {
        const trialEndDate = endDate.toLocaleDateString("en-NG", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        await supabase.functions.invoke("trial-welcome-email", {
          body: {
            email,
            name: name || email.split("@")[0],
            planName: planDetails.name,
            trialEndDate,
            features: planDetails.features,
          },
        });
      } catch (emailError) {
        console.error("Failed to send trial welcome email:", emailError);
        // Don't fail the trial start if email fails
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["all-subscriptions"] });
      toast.success("Your 3-month free trial has started! Check your email for details.");
    },
    onError: (error) => {
      toast.error("Failed to start trial: " + error.message);
    },
  });

  // Check if user has ever had a subscription (to determine trial eligibility)
  const hasHadSubscription = allSubscriptions && allSubscriptions.length > 0;

  const isSubscriptionActive = (): boolean => {
    if (!subscription) return false;
    if (subscription.status !== "active") return false;
    if (subscription.end_date) {
      return new Date(subscription.end_date) > new Date();
    }
    return true;
  };

  const getActiveplan = (): SubscriptionPlan | null => {
    if (!isSubscriptionActive()) return null;
    return subscription?.plan || null;
  };

  const isTrialSubscription = subscription?.payment_reference === "TRIAL";

  const getDaysRemaining = (): number | null => {
    if (!subscription?.end_date) return null;
    const endDate = new Date(subscription.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return {
    subscription,
    allSubscriptions,
    isLoading,
    isSubscriptionActive: isSubscriptionActive(),
    activePlan: getActiveplan(),
    createPendingSubscription,
    startTrialSubscription,
    initiateTrialWithCard,
    hasHadSubscription,
    isTrialSubscription,
    daysRemaining: getDaysRemaining(),
    hasCardOnFile: !!subscription?.card_token,
  };
};
