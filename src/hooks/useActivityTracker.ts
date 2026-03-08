import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from "@capacitor/core";

const SESSION_KEY = "activity_session_id";

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function getDeviceInfo() {
  const ua = navigator.userAgent;
  const isNativeApp = Capacitor.isNativePlatform();
  const nativePlatform = Capacitor.getPlatform(); // 'android' | 'ios' | 'web'

  let deviceType: "mobile" | "tablet" | "desktop" = "desktop";
  if (/Mobi|Android/i.test(ua)) {
    deviceType = /Tablet|iPad/i.test(ua) ? "tablet" : "mobile";
  } else if (/iPad/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua))) {
    deviceType = "tablet";
  }

  return {
    device_type: deviceType,
    platform: isNativeApp ? nativePlatform : "web",
    is_native_app: isNativeApp,
    user_agent: ua.substring(0, 256),
  };
}

export function useActivityTracker() {
  const location = useLocation();
  const lastPath = useRef<string>("");
  const userId = useRef<string | null>(null);

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

      const deviceInfo = getDeviceInfo();

      try {
        await supabase.from("user_activity" as any).insert({
          user_id: uid,
          event_type: eventType,
          page_path: pagePath ?? location.pathname,
          feature_name: featureName ?? null,
          metadata: { ...deviceInfo, ...(metadata ?? {}) },
          session_id: getSessionId(),
        });
      } catch {
        // Silent fail
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
