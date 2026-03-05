import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Eye, CheckCircle, Trash2, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface SupportTicket {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  category: string;
  status: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const statusColor = (status: string) => {
  switch (status) {
    case "open": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case "in_progress": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "resolved": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "closed": return "bg-muted text-muted-foreground";
    default: return "";
  }
};

const categoryLabel = (cat: string) => {
  const labels: Record<string, string> = {
    general: "General",
    billing: "Billing",
    technical: "Technical",
    tax: "Tax",
    account: "Account",
    feature_request: "Feature Request",
  };
  return labels[cat] || cat;
};

export default function AdminTicketsTab() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-platform", "list_tickets"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-platform", {
        body: { action: "list_tickets" },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data.tickets as SupportTicket[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ ticket_id, updates }: { ticket_id: string; updates: Record<string, unknown> }) => {
      const { data, error } = await supabase.functions.invoke("admin-platform", {
        body: { action: "update_ticket", ticket_id, updates },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-platform"] });
      toast.success("Ticket updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (ticket_id: string) => {
      const { data, error } = await supabase.functions.invoke("admin-platform", {
        body: { action: "delete_ticket", ticket_id },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-platform"] });
      toast.success("Ticket deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = data?.filter(t => statusFilter === "all" || t.status === statusFilter);

  const openCount = data?.filter(t => t.status === "open").length || 0;
  const inProgressCount = data?.filter(t => t.status === "in_progress").length || 0;

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="flex gap-4">
        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-3 py-1.5 text-sm">
          {openCount} Open
        </Badge>
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1.5 text-sm">
          {inProgressCount} In Progress
        </Badge>
        <Badge variant="secondary" className="px-3 py-1.5 text-sm">
          {data?.length || 0} Total
        </Badge>
      </div>

      {/* Filter */}
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tickets</SelectItem>
          {STATUS_OPTIONS.map(s => (
            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered?.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium text-sm max-w-[200px] truncate">{t.subject}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{categoryLabel(t.category)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${statusColor(t.status)}`}>{t.status.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(t.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedTicket(t)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => {
                            if (confirm("Delete this ticket?")) deleteMutation.mutate(t.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No tickets found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Ticket Details
            </DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">From</p>
                  <p className="font-medium">{selectedTicket.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedTicket.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium">{categoryLabel(selectedTicket.category)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{format(new Date(selectedTicket.created_at), "PPP p")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedTicket.phone || "—"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Subject</p>
                <p className="font-medium">{selectedTicket.subject}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Message</p>
                <div className="p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                  {selectedTicket.message}
                </div>
              </div>

              {/* Update Status */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Update Status</p>
                <div className="flex gap-2 flex-wrap">
                  {STATUS_OPTIONS.map(s => (
                    <Button
                      key={s.value}
                      variant={selectedTicket.status === s.value ? "default" : "outline"}
                      size="sm"
                      disabled={updateMutation.isPending}
                      onClick={() => {
                        updateMutation.mutate({
                          ticket_id: selectedTicket.id,
                          updates: { status: s.value },
                        });
                        setSelectedTicket({ ...selectedTicket, status: s.value });
                      }}
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
