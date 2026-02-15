import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ReferralLinkClick {
  id: string;
  referral_code: string;
  referrer_id: string;
  visitor_ip: string | null;
  user_agent: string | null;
  referrer_url: string | null;
  converted: boolean;
  converted_user_id: string | null;
  created_at: string;
}

export const useReferralAnalytics = () => {
  const { user } = useAuth();

  const { data: linkClicks = [], isLoading } = useQuery({
    queryKey: ["referral-link-clicks", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("referral_link_clicks")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ReferralLinkClick[];
    },
    enabled: !!user?.id,
  });

  const totalClicks = linkClicks.length;
  const convertedClicks = linkClicks.filter((c) => c.converted).length;
  const conversionRate = totalClicks > 0 ? (convertedClicks / totalClicks) * 100 : 0;

  // Clicks in the last 7 days
  const recentClicks = linkClicks.filter((c) => {
    const clickDate = new Date(c.created_at);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return clickDate >= sevenDaysAgo;
  }).length;

  // Clicks in the last 30 days
  const monthlyClicks = linkClicks.filter((c) => {
    const clickDate = new Date(c.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return clickDate >= thirtyDaysAgo;
  }).length;

  // Referral source breakdown
  const sourceBreakdown = linkClicks.reduce<Record<string, number>>((acc, click) => {
    let source = "Direct";
    if (click.referrer_url) {
      try {
        const url = new URL(click.referrer_url);
        if (url.hostname.includes("whatsapp") || url.hostname.includes("wa.me")) source = "WhatsApp";
        else if (url.hostname.includes("twitter") || url.hostname.includes("t.co") || url.hostname.includes("x.com")) source = "Twitter/X";
        else if (url.hostname.includes("facebook") || url.hostname.includes("fb.com")) source = "Facebook";
        else if (url.hostname.includes("linkedin")) source = "LinkedIn";
        else source = url.hostname;
      } catch {
        source = "Other";
      }
    }
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  return {
    linkClicks,
    isLoading,
    totalClicks,
    convertedClicks,
    conversionRate,
    recentClicks,
    monthlyClicks,
    sourceBreakdown,
  };
};
