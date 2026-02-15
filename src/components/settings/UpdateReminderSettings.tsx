import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const REMINDER_KEY = "taxkora_update_reminder_enabled";
const LAST_NOTIFIED_KEY = "taxkora_last_notified";

const UpdateReminderSettings = () => {
  const { user } = useAuth();
  const [reminderEnabled, setReminderEnabled] = useState(() => {
    return localStorage.getItem(REMINDER_KEY) !== "false";
  });

  const { data: lastIncomeUpdate } = useQuery({
    queryKey: ["last-income-update", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("income_records")
        .select("updated_at")
        .order("updated_at", { ascending: false })
        .limit(1);
      return data?.[0]?.updated_at ?? null;
    },
    enabled: !!user,
  });

  const { data: lastExpenseUpdate } = useQuery({
    queryKey: ["last-expense-update", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("expenses")
        .select("updated_at")
        .order("updated_at", { ascending: false })
        .limit(1);
      return data?.[0]?.updated_at ?? null;
    },
    enabled: !!user,
  });

  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const incomeOverdue = !lastIncomeUpdate || new Date(lastIncomeUpdate) < twentyFourHoursAgo;
  const expenseOverdue = !lastExpenseUpdate || new Date(lastExpenseUpdate) < twentyFourHoursAgo;
  const anyOverdue = incomeOverdue || expenseOverdue;

  // Browser notification effect
  useEffect(() => {
    if (!reminderEnabled || !anyOverdue) return;

    const lastNotified = localStorage.getItem(LAST_NOTIFIED_KEY);
    const lastNotifiedTime = lastNotified ? new Date(lastNotified) : null;

    // Don't notify more than once per hour
    if (lastNotifiedTime && now.getTime() - lastNotifiedTime.getTime() < 60 * 60 * 1000) return;

    if ("Notification" in window && Notification.permission === "granted") {
      const parts: string[] = [];
      if (incomeOverdue) parts.push("Income");
      if (expenseOverdue) parts.push("Expenditure");

      new Notification("TAXKORA Reminder", {
        body: `Please update your ${parts.join(" & ")} records. It's been over 24 hours.`,
        icon: "/favicon.png",
      });
      localStorage.setItem(LAST_NOTIFIED_KEY, now.toISOString());
    }
  }, [reminderEnabled, anyOverdue, incomeOverdue, expenseOverdue]);

  const handleToggle = async (enabled: boolean) => {
    setReminderEnabled(enabled);
    localStorage.setItem(REMINDER_KEY, String(enabled));

    if (enabled && "Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.info("Enable browser notifications to receive reminders even when you're not on this page.");
      }
    }

    toast.success(enabled ? "Update reminders enabled" : "Update reminders disabled");
  };

  const formatLastUpdate = (dateStr: string | null) => {
    if (!dateStr) return "No records yet";
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-display flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Update Reminders
            </CardTitle>
            <CardDescription className="mt-1">
              Get notified to update your Income & Expenditure every 24 hours
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="reminder-toggle" className="text-sm text-muted-foreground">
              {reminderEnabled ? "On" : "Off"}
            </Label>
            <Switch
              id="reminder-toggle"
              checked={reminderEnabled}
              onCheckedChange={handleToggle}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Income status */}
        <div className={`flex items-center justify-between p-4 rounded-xl border ${
          incomeOverdue ? "border-destructive/30 bg-destructive/5" : "border-primary/30 bg-primary/5"
        }`}>
          <div className="flex items-center gap-3">
            {incomeOverdue ? (
              <AlertTriangle className="w-5 h-5 text-destructive" />
            ) : (
              <CheckCircle className="w-5 h-5 text-primary" />
            )}
            <div>
              <p className="font-medium text-foreground">Income Records</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last updated: {formatLastUpdate(lastIncomeUpdate)}
              </p>
            </div>
          </div>
          <Badge variant={incomeOverdue ? "destructive" : "secondary"}>
            {incomeOverdue ? "Overdue" : "Up to date"}
          </Badge>
        </div>

        {/* Expense status */}
        <div className={`flex items-center justify-between p-4 rounded-xl border ${
          expenseOverdue ? "border-destructive/30 bg-destructive/5" : "border-primary/30 bg-primary/5"
        }`}>
          <div className="flex items-center gap-3">
            {expenseOverdue ? (
              <AlertTriangle className="w-5 h-5 text-destructive" />
            ) : (
              <CheckCircle className="w-5 h-5 text-primary" />
            )}
            <div>
              <p className="font-medium text-foreground">Expenditure Records</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last updated: {formatLastUpdate(lastExpenseUpdate)}
              </p>
            </div>
          </div>
          <Badge variant={expenseOverdue ? "destructive" : "secondary"}>
            {expenseOverdue ? "Overdue" : "Up to date"}
          </Badge>
        </div>

        {reminderEnabled && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {anyOverdue ? (
              <><BellOff className="w-3 h-3" /> You'll be reminded until records are updated.</>
            ) : (
              <><Bell className="w-3 h-3" /> Next reminder if no updates within 24 hours.</>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default UpdateReminderSettings;
