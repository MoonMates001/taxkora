import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Shield, Search, Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface UserWithSubscription {
  id: string;
  email: string;
  full_name: string | null;
  account_type: string | null;
  business_name: string | null;
  created_at: string;
  active_subscription: {
    id: string;
    plan: string;
    status: string;
    amount: number;
    start_date: string | null;
    end_date: string | null;
    payment_reference: string | null;
  } | null;
  all_subscriptions: Array<{
    id: string;
    plan: string;
    status: string;
    amount: number;
    start_date: string | null;
    end_date: string | null;
    payment_reference: string | null;
  }>;
}

const PLANS = [
  { value: "pit_individual", label: "Individual PIT" },
  { value: "pit_business", label: "Business PIT" },
  { value: "cit", label: "Companies Income Tax" },
];

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
  { value: "pending", label: "Pending" },
];

const PLAN_AMOUNTS: Record<string, number> = {
  pit_individual: 2500,
  pit_business: 7500,
  cit: 25000,
};

const AdminSubscriptionManager = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editSub, setEditSub] = useState<UserWithSubscription["active_subscription"] | null>(null);
  const [editForm, setEditForm] = useState({ plan: "", status: "", start_date: "", end_date: "", amount: "" });
  const [createForUser, setCreateForUser] = useState<UserWithSubscription | null>(null);
  const [createForm, setCreateForm] = useState({ plan: "pit_business", status: "active", payment_reference: "TRIAL", end_date: "" });

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-manage-subscription", {
        body: { action: "list_users" },
      });
      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);
      return data.users as UserWithSubscription[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ subscription_id, updates }: { subscription_id: string; updates: Record<string, unknown> }) => {
      const { data, error } = await supabase.functions.invoke("admin-manage-subscription", {
        body: { action: "update_subscription", subscription_id, updates },
      });
      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Subscription updated");
      setEditSub(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data, error } = await supabase.functions.invoke("admin-manage-subscription", {
        body: { action: "create_subscription", ...body },
      });
      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Subscription created");
      setCreateForUser(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (subscription_id: string) => {
      const { data, error } = await supabase.functions.invoke("admin-manage-subscription", {
        body: { action: "delete_subscription", subscription_id },
      });
      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Subscription deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered = users?.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.email?.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q) || u.business_name?.toLowerCase().includes(q);
  });

  const openEdit = (sub: UserWithSubscription["active_subscription"]) => {
    if (!sub) return;
    setEditSub(sub);
    setEditForm({
      plan: sub.plan,
      status: sub.status,
      start_date: sub.start_date || "",
      end_date: sub.end_date || "",
      amount: String(sub.amount),
    });
  };

  const handleUpdate = () => {
    if (!editSub) return;
    updateMutation.mutate({
      subscription_id: editSub.id,
      updates: {
        plan: editForm.plan,
        status: editForm.status,
        start_date: editForm.start_date || null,
        end_date: editForm.end_date || null,
        amount: Number(editForm.amount),
        payment_reference: editForm.status === "active" && editForm.amount === "0" ? "TRIAL" : editSub.payment_reference,
      },
    });
  };

  const handleCreate = () => {
    if (!createForUser) return;
    const endDate = createForm.end_date || (() => {
      const d = new Date();
      d.setDate(d.getDate() + 90);
      return d.toISOString().split("T")[0];
    })();
    createMutation.mutate({
      target_user_id: createForUser.id,
      plan: createForm.plan,
      status: createForm.status,
      amount: createForm.payment_reference === "TRIAL" ? 0 : PLAN_AMOUNTS[createForm.plan] || 0,
      end_date: endDate,
      payment_reference: createForm.payment_reference,
    });
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700";
      case "expired": return "bg-red-100 text-red-700";
      case "cancelled": return "bg-muted text-muted-foreground";
      case "pending": return "bg-amber-100 text-amber-700";
      default: return "";
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Admin: Subscription Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or business..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered?.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{u.full_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs capitalize">{u.account_type}</Badge>
                    </TableCell>
                    <TableCell>
                      {u.active_subscription ? (
                        <span className="text-sm">{PLANS.find((p) => p.value === u.active_subscription?.plan)?.label || u.active_subscription.plan}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {u.active_subscription ? (
                        <Badge className={`text-xs ${statusColor(u.active_subscription.status)}`}>
                          {u.active_subscription.payment_reference === "TRIAL" ? "Trial" : u.active_subscription.status}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {u.active_subscription?.end_date || "—"}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {u.active_subscription && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(u.active_subscription)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => {
                              if (confirm("Delete this subscription?")) {
                                deleteMutation.mutate(u.active_subscription!.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setCreateForUser(u);
                          setCreateForm({ plan: "pit_business", status: "active", payment_reference: "TRIAL", end_date: "" });
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editSub} onOpenChange={(open) => !open && setEditSub(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Subscription</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Plan</Label>
                <Select value={editForm.plan} onValueChange={(v) => setEditForm({ ...editForm, plan: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PLANS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount (₦)</Label>
                <Input type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" value={editForm.start_date} onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })} />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" value={editForm.end_date} onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })} />
                </div>
              </div>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending} className="w-full">
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Dialog */}
        <Dialog open={!!createForUser} onOpenChange={(open) => !open && setCreateForUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Subscription for {createForUser?.full_name || createForUser?.email}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Plan</Label>
                <Select value={createForm.plan} onValueChange={(v) => setCreateForm({ ...createForm, plan: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PLANS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={createForm.status} onValueChange={(v) => setCreateForm({ ...createForm, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select value={createForm.payment_reference} onValueChange={(v) => setCreateForm({ ...createForm, payment_reference: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRIAL">Trial (Free)</SelectItem>
                    <SelectItem value="ADMIN_CREATED">Paid Subscription</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>End Date (defaults to 90 days)</Label>
                <Input type="date" value={createForm.end_date} onChange={(e) => setCreateForm({ ...createForm, end_date: e.target.value })} />
              </div>
              <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Subscription
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminSubscriptionManager;
