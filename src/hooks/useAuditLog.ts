import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Json } from "@/integrations/supabase/types";

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: Json | null;
  new_data: Json | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export type AuditAction = 
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'login'
  | 'logout'
  | 'decrypt'
  | 'share';

export const useAuditLog = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch audit logs for current user
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["audit-logs", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as AuditLog[];
    },
    enabled: !!user?.id,
  });

  // Log an audit event
  const logEvent = useMutation({
    mutationFn: async ({
      action,
      tableName,
      recordId,
      oldData,
      newData,
    }: {
      action: AuditAction;
      tableName: string;
      recordId?: string;
      oldData?: Json;
      newData?: Json;
    }) => {
      if (!user?.id) return null;

      // Use the database function to log the event
      const { data, error } = await supabase.rpc("log_audit_event", {
        p_user_id: user.id,
        p_action: action,
        p_table_name: tableName,
        p_record_id: recordId ?? null,
        p_old_data: oldData ?? null,
        p_new_data: newData ?? null,
        p_ip_address: null, // Could be obtained from request in edge function
        p_user_agent: navigator.userAgent,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });

  // Get logs by action type
  const getLogsByAction = (action: AuditAction): AuditLog[] => {
    return auditLogs?.filter(log => log.action === action) ?? [];
  };

  // Get logs by table
  const getLogsByTable = (tableName: string): AuditLog[] => {
    return auditLogs?.filter(log => log.table_name === tableName) ?? [];
  };

  // Get recent activity summary
  const getActivitySummary = () => {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentLogs = auditLogs ?? [];
    
    return {
      last24h: recentLogs.filter(log => new Date(log.created_at) > last24h).length,
      last7d: recentLogs.filter(log => new Date(log.created_at) > last7d).length,
      total: recentLogs.length,
      byAction: recentLogs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  };

  return {
    auditLogs,
    isLoading,
    logEvent,
    getLogsByAction,
    getLogsByTable,
    getActivitySummary,
  };
};
