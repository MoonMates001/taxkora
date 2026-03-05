import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  created_at: string;
  ip_address: string | null;
}

interface WebhookEvent {
  id: string;
  event_type: string;
  tx_ref: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

export default function AdminLogsTab() {
  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ["admin-platform", "list_audit_logs"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-platform", {
        body: { action: "list_audit_logs", limit: 50 },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data.logs as AuditLog[];
    },
  });

  const { data: webhookData, isLoading: webhookLoading } = useQuery({
    queryKey: ["admin-platform", "list_webhook_events"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-platform", {
        body: { action: "list_webhook_events", limit: 50 },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data.events as WebhookEvent[];
    },
  });

  const webhookStatusColor = (status: string) => {
    switch (status) {
      case "processed": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "failed": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Audit Logs */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-4">Recent Audit Logs</h3>
          {auditLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Record</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditData?.map(log => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{log.action}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{log.table_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono text-xs truncate max-w-[120px]">
                        {log.record_id || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(log.created_at), "MMM d, HH:mm")}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!auditData || auditData.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No audit logs</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Webhook Events */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-4">Payment Webhook Events</h3>
          {webhookLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>TX Ref</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Error</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhookData?.map(event => (
                    <TableRow key={event.id}>
                      <TableCell className="text-sm">{event.event_type}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground truncate max-w-[120px]">
                        {event.tx_ref || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${webhookStatusColor(event.status)}`}>{event.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-destructive truncate max-w-[150px]">
                        {event.error_message || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(event.created_at), "MMM d, HH:mm")}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!webhookData || webhookData.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No webhook events</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
