import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { addDays, format } from "date-fns";

export interface Referral {
  id: string;
  referrer_id: string;
  referred_user_id: string | null;
  referral_code: string;
  referred_email: string | null;
  status: "pending" | "signed_up" | "subscribed";
  reward_claimed: boolean;
  created_at: string;
  completed_at: string | null;
  updated_at: string;
}

const REFERRALS_REQUIRED = 10;
const REWARD_DAYS = 365; // 1 year free

export const useReferrals = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get user's referral code (create if doesn't exist)
  const { data: userReferralCode, isLoading: isLoadingCode } = useQuery({
    queryKey: ["referral-code", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Check if user already has a referral code
      const { data: existingReferral, error: fetchError } = await supabase
        .from("referrals")
        .select("referral_code")
        .eq("referrer_id", user.id)
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingReferral) {
        return existingReferral.referral_code;
      }

      // Generate new referral code
      const { data: codeData, error: codeError } = await supabase
        .rpc("generate_referral_code");

      if (codeError) throw codeError;

      // Create initial referral entry with the code
      const { data: newReferral, error: insertError } = await supabase
        .from("referrals")
        .insert({
          referrer_id: user.id,
          referral_code: codeData,
          status: "pending",
        })
        .select("referral_code")
        .single();

      if (insertError) throw insertError;

      return newReferral.referral_code;
    },
    enabled: !!user?.id,
  });

  // Get all referrals for the user
  const { data: referrals, isLoading: isLoadingReferrals } = useQuery({
    queryKey: ["referrals", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Referral[];
    },
    enabled: !!user?.id,
  });

  // Get referral by code (for signup flow)
  const getReferralByCode = async (code: string) => {
    const { data, error } = await supabase
      .from("referrals")
      .select("*")
      .eq("referral_code", code)
      .maybeSingle();

    if (error) throw error;
    return data as Referral | null;
  };

  // Send referral invite
  const sendInvite = useMutation({
    mutationFn: async (email: string) => {
      if (!user?.id || !userReferralCode) {
        throw new Error("User not authenticated or referral code not available");
      }

      // Check if invite already sent to this email
      const existingInvites = referrals?.filter(
        (r) => r.referred_email === email
      );
      if (existingInvites && existingInvites.length > 0) {
        throw new Error("Invite already sent to this email");
      }

      // Check if user has reached limit
      const completedReferrals = referrals?.filter(
        (r) => r.status === "subscribed"
      ).length || 0;
      if (completedReferrals >= REFERRALS_REQUIRED) {
        throw new Error("You have already completed your referral goal!");
      }

      // Create new referral entry
      const { data, error } = await supabase
        .from("referrals")
        .insert({
          referrer_id: user.id,
          referral_code: userReferralCode,
          referred_email: email,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      // Send invite email via edge function
      await supabase.functions.invoke("send-referral-invite", {
        body: {
          email,
          referralCode: userReferralCode,
          referrerName: user.user_metadata?.full_name || user.email,
        },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referrals"] });
      toast.success("Referral invite sent!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send invite");
    },
  });

  // Complete referral when user signs up
  const completeReferral = useMutation({
    mutationFn: async ({
      referralCode,
      referredUserId,
    }: {
      referralCode: string;
      referredUserId: string;
    }) => {
      const { data, error } = await supabase
        .from("referrals")
        .update({
          referred_user_id: referredUserId,
          status: "signed_up",
        })
        .eq("referral_code", referralCode)
        .eq("status", "pending")
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referrals"] });
    },
  });

  // Mark referral as subscribed when referred user subscribes
  const markReferralSubscribed = useMutation({
    mutationFn: async (referredUserId: string) => {
      const { data, error } = await supabase
        .from("referrals")
        .update({
          status: "subscribed",
          completed_at: new Date().toISOString(),
        })
        .eq("referred_user_id", referredUserId)
        .eq("status", "signed_up")
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referrals"] });
    },
  });

  // Claim referral reward - grants 1 year free subscription
  const claimReward = useMutation({
    mutationFn: async (plan: "pit_individual" | "pit_business") => {
      if (!user?.id) throw new Error("User not authenticated");

      // Calculate the new end date (1 year from now)
      const startDate = new Date();
      const endDate = addDays(startDate, REWARD_DAYS);

      // Create a new subscription with the reward
      const { data: subscription, error: subError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan: plan,
          status: "active",
          amount: 0,
          start_date: format(startDate, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
          payment_reference: "REFERRAL_REWARD",
        })
        .select()
        .single();

      if (subError) throw subError;

      // Mark all referrals as reward claimed
      const { error: updateError } = await supabase
        .from("referrals")
        .update({ reward_claimed: true })
        .eq("referrer_id", user.id)
        .eq("status", "subscribed");

      if (updateError) throw updateError;

      return subscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referrals"] });
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("🎉 Congratulations! Your 1-year free subscription has been activated!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to claim reward");
    },
  });

  // Calculate stats
  const completedReferrals = referrals?.filter(
    (r) => r.status === "subscribed"
  ).length || 0;
  const pendingReferrals = referrals?.filter(
    (r) => r.status === "pending" || r.status === "signed_up"
  ).length || 0;
  const progress = Math.min((completedReferrals / REFERRALS_REQUIRED) * 100, 100);
  const hasEarnedReward = completedReferrals >= REFERRALS_REQUIRED;
  const rewardClaimed = referrals?.some((r) => r.reward_claimed) || false;
  const remainingToEarn = Math.max(REFERRALS_REQUIRED - completedReferrals, 0);

  // Generate share URL
  const getShareUrl = () => {
    if (!userReferralCode) return "";
    return `${window.location.origin}/auth?ref=${userReferralCode}`;
  };

  return {
    userReferralCode,
    referrals,
    isLoading: isLoadingCode || isLoadingReferrals,
    sendInvite,
    completeReferral,
    markReferralSubscribed,
    getReferralByCode,
    claimReward,
    completedReferrals,
    pendingReferrals,
    progress,
    hasEarnedReward,
    rewardClaimed,
    remainingToEarn,
    referralsRequired: REFERRALS_REQUIRED,
    rewardDays: REWARD_DAYS,
    getShareUrl,
  };
};
