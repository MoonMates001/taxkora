import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, Loader2, Shield, UserX, Eye } from "lucide-react";
import { format } from "date-fns";

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  account_type: string | null;
  business_name: string | null;
  country_of_residence: string | null;
  phone: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  roles: string[];
  active_subscription: {
    id: string;
    plan: string;
    status: string;
    amount: number;
    start_date: string | null;
    end_date: string | null;
    payment_reference: string | null;
  } | null;
  all_subscriptions: Array<Record<string, unknown>>;
}

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "moderator", label: "Moderator" },
  { value: "user", label: "User" },
];

export default function AdminUsersTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-platform", "list_users"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-platform", {
        body: { action: "list_users" },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data.users as AdminUser[];
    },
  });

  const addRoleMutation = useMutation({
    mutationFn: async ({ target_user_id, role }: { target_user_id: string; role: string }) => {
      const { data, error } = await supabase.functions.invoke("admin-platform", {
        body: { action: "add_role", target_user_id, role },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-platform"] });
      toast.success("Role added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeRoleMutation = useMutation({
    mutationFn: async ({ target_user_id, role }: { target_user_id: string; role: string }) => {
      const { data, error } = await supabase.functions.invoke("admin-platform", {
        body: { action: "remove_role", target_user_id, role },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-platform"] });
      toast.success("Role removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = data?.filter(u => {
    const q = search.toLowerCase();
    const matchesSearch = !q || u.email?.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q) || u.business_name?.toLowerCase().includes(q);
    const matchesType = typeFilter === "all" || u.account_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Account type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Users ({filtered?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
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
                    <TableHead>Roles</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Sign In</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered?.map(u => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{u.full_name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                          {u.business_name && <p className="text-xs text-muted-foreground">{u.business_name}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs capitalize">{u.account_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {u.roles.length > 0 ? u.roles.map(r => (
                            <Badge key={r} variant={r === "admin" ? "default" : "outline"} className="text-xs capitalize">
                              {r}
                            </Badge>
                          )) : (
                            <span className="text-xs text-muted-foreground">user</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {u.active_subscription ? (
                          <Badge className={`text-xs ${u.active_subscription.payment_reference === "TRIAL" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
                            {u.active_subscription.payment_reference === "TRIAL" ? "Trial" : u.active_subscription.plan.replace("_", " ")}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">None</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(u.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {u.last_sign_in_at ? format(new Date(u.last_sign_in_at), "MMM d, yyyy") : "Never"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedUser(u)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No users found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedUser.full_name || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Account Type</p>
                  <p className="font-medium capitalize">{selectedUser.account_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Country</p>
                  <p className="font-medium">{selectedUser.country_of_residence || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedUser.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Business</p>
                  <p className="font-medium">{selectedUser.business_name || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Joined</p>
                  <p className="font-medium">{format(new Date(selectedUser.created_at), "PPP")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email Verified</p>
                  <p className="font-medium">{selectedUser.email_confirmed_at ? "Yes" : "No"}</p>
                </div>
              </div>

              {/* Subscription info */}
              {selectedUser.active_subscription && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Active Subscription</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{selectedUser.active_subscription.plan.replace("_", " ")}</span>
                    <Badge className="text-xs">{selectedUser.active_subscription.payment_reference === "TRIAL" ? "Trial" : "Paid"}</Badge>
                  </div>
                  {selectedUser.active_subscription.end_date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Expires: {format(new Date(selectedUser.active_subscription.end_date), "PPP")}
                    </p>
                  )}
                </div>
              )}

              {/* Role Management */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Shield className="w-4 h-4" /> Manage Roles
                </p>
                <div className="flex gap-2 flex-wrap">
                  {ROLES.map(role => {
                    const hasRole = selectedUser.roles.includes(role.value);
                    return (
                      <Button
                        key={role.value}
                        variant={hasRole ? "default" : "outline"}
                        size="sm"
                        disabled={addRoleMutation.isPending || removeRoleMutation.isPending}
                        onClick={() => {
                          if (hasRole) {
                            if (confirm(`Remove ${role.label} role?`)) {
                              removeRoleMutation.mutate({ target_user_id: selectedUser.id, role: role.value });
                              setSelectedUser({ ...selectedUser, roles: selectedUser.roles.filter(r => r !== role.value) });
                            }
                          } else {
                            addRoleMutation.mutate({ target_user_id: selectedUser.id, role: role.value });
                            setSelectedUser({ ...selectedUser, roles: [...selectedUser.roles, role.value] });
                          }
                        }}
                      >
                        {hasRole ? "✓ " : ""}{role.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Subscription History */}
              {selectedUser.all_subscriptions.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Subscription History ({selectedUser.all_subscriptions.length})</p>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {selectedUser.all_subscriptions.map((sub: any, idx: number) => (
                      <div key={idx} className="text-xs p-2 bg-muted rounded flex items-center justify-between">
                        <div>
                          <span className="capitalize font-medium">{String(sub.plan).replace("_", " ")}</span>
                          <span className="text-muted-foreground ml-2">{sub.status}</span>
                        </div>
                        <span className="text-muted-foreground">₦{sub.amount?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
