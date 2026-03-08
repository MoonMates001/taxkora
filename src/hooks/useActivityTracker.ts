import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "activity_session_id";

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function useActivityTracker() {
  const location = useLocation();
  const lastPath = useRef<string>("");
  const userId = useRef<string | null>(null);

  // Get user id once
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      userId.current = data.user?.id ?? null;
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      userId.current = session?.user?.id ?? null;
      if (_event === "SIGNED_IN" && session?.user) {
        trackEvent("login", "/auth", undefined, { method: "email" });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const trackEvent = useCallback(
    async (
      eventType: string,
      pagePath?: string,
      featureName?: string,
      metadata?: Record<string, unknown>
    ) => {
      const uid = userId.current;
      if (!uid) return;

      try {
        await supabase.from("user_activity" as any).insert({
          user_id: uid,
          event_type: eventType,
          page_path: pagePath ?? location.pathname,
          feature_name: featureName ?? null,
          metadata: metadata ?? {},
          session_id: getSessionId(),
        });
      } catch {
        // Silent fail – don't block user
      }
    },
    [location.pathname]
  );

  // Track page views on route change
  useEffect(() => {
    if (location.pathname !== lastPath.current && userId.current) {
      lastPath.current = location.pathname;
      trackEvent("page_view", location.pathname);
    }
  }, [location.pathname, trackEvent]);

  return { trackEvent };
}
