import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminNotification {
  id: string;
  type: "new_ticket" | "new_signup";
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
}

export function useAdminRealtimeNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel("admin-realtime-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_tickets" },
        (payload) => {
          const ticket = payload.new as { id: string; subject: string; name: string; category: string };
          const notif: AdminNotification = {
            id: `ticket-${ticket.id}`,
            type: "new_ticket",
            title: "New Support Ticket",
            description: `${ticket.name}: ${ticket.subject}`,
            timestamp: new Date(),
            read: false,
          };
          setNotifications((prev) => [notif, ...prev].slice(0, 50));
          setUnreadCount((c) => c + 1);
          toast.info(`New ticket from ${ticket.name}`, {
            description: ticket.subject,
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "profiles" },
        (payload) => {
          const profile = payload.new as { id: string; full_name: string | null; email: string | null; account_type: string };
          const name = profile.full_name || profile.email || "New user";
          const notif: AdminNotification = {
            id: `signup-${profile.id}`,
            type: "new_signup",
            title: "New User Signup",
            description: `${name} (${profile.account_type})`,
            timestamp: new Date(),
            read: false,
          };
          setNotifications((prev) => [notif, ...prev].slice(0, 50));
          setUnreadCount((c) => c + 1);
          toast.info("New user signup", { description: name });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return { notifications, unreadCount, markAllRead, clearAll };
}
