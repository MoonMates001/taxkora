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
  created_at: string;
  updated_at: string;
}

export const SUBSCRIPTION_PLANS = {
  pit_individual: {
    name: "Individual PIT",
    description: "Personal Income Tax filing for individuals without business",
    amount: 2500,
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

  return {
    subscription,
    allSubscriptions,
    isLoading,
    isSubscriptionActive: isSubscriptionActive(),
    activePlan: getActiveplan(),
    createPendingSubscription,
  };
};
