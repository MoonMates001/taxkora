import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Bell, BellOff, Clock, AlertTriangle, CheckCircle, Settings2, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const REMINDER_KEY = "taxkora_update_reminder_enabled";
const LAST_NOTIFIED_KEY = "taxkora_last_notified";
const FREQUENCY_KEY = "taxkora_reminder_frequency";
const REMINDER_TIME_KEY = "taxkora_reminder_time";

type ReminderFrequency = "6" | "12" | "24" | "48" | "168";

const FREQUENCY_OPTIONS: { value: ReminderFrequency; label: string }[] = [
  { value: "6", label: "Every 6 hours" },
  { value: "12", label: "Every 12 hours" },
  { value: "24", label: "Daily (24 hours)" },
  { value: "48", label: "Every 2 days" },
  { value: "168", label: "Weekly" },
];

const UpdateReminderSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reminderEnabled, setReminderEnabled] = useState(() => {
    return localStorage.getItem(REMINDER_KEY) !== "false";
  });
  const [frequency, setFrequency] = useState<ReminderFrequency>(() => {
    return (localStorage.getItem(FREQUENCY_KEY) as ReminderFrequency) || "24";
  });
  const [reminderTime, setReminderTime] = useState(() => {
    return localStorage.getItem(REMINDER_TIME_KEY) || "09:00";
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

  const frequencyMs = Number(frequency) * 60 * 60 * 1000;
  const now = new Date();
  const thresholdTime = new Date(now.getTime() - frequencyMs);

  const incomeOverdue = !lastIncomeUpdate || new Date(lastIncomeUpdate) < thresholdTime;
  const expenseOverdue = !lastExpenseUpdate || new Date(lastExpenseUpdate) < thresholdTime;
  const anyOverdue = incomeOverdue || expenseOverdue;

  const isWithinNotificationWindow = useCallback(() => {
    const [hours, minutes] = reminderTime.split(":").map(Number);
    const scheduledMinutes = hours * 60 + minutes;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    // Allow a 30-minute window after the scheduled time
    return currentMinutes >= scheduledMinutes && currentMinutes < scheduledMinutes + 30;
  }, [reminderTime, now]);

  // Browser notification effect
  useEffect(() => {
    if (!reminderEnabled || !anyOverdue) return;

    const lastNotified = localStorage.getItem(LAST_NOTIFIED_KEY);
    const lastNotifiedTime = lastNotified ? new Date(lastNotified) : null;

    // Respect frequency: don't notify more often than the selected interval
    const cooldownMs = Math.max(frequencyMs / 2, 60 * 60 * 1000);
    if (lastNotifiedTime && now.getTime() - lastNotifiedTime.getTime() < cooldownMs) return;

    // Only notify within the scheduled time window
    if (!isWithinNotificationWindow()) return;

    if ("Notification" in window && Notification.permission === "granted") {
      const parts: string[] = [];
      if (incomeOverdue) parts.push("Income");
      if (expenseOverdue) parts.push("Expenditure");

      const freqLabel = FREQUENCY_OPTIONS.find(f => f.value === frequency)?.label || "the set interval";

      new Notification("TAXKORA Reminder", {
        body: `Please update your ${parts.join(" & ")} records. It's been over ${freqLabel.toLowerCase().replace("every ", "")}.`,
        icon: "/favicon.png",
      });
      localStorage.setItem(LAST_NOTIFIED_KEY, now.toISOString());
    }
  }, [reminderEnabled, anyOverdue, incomeOverdue, expenseOverdue, frequency, isWithinNotificationWindow]);

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

  const handleFrequencyChange = (value: ReminderFrequency) => {
    setFrequency(value);
    localStorage.setItem(FREQUENCY_KEY, value);
    toast.success("Reminder frequency updated");
  };

  const handleTimeChange = (value: string) => {
    setReminderTime(value);
    localStorage.setItem(REMINDER_TIME_KEY, value);
    toast.success(`Reminder time set to ${value}`);
  };

  const formatLastUpdate = (dateStr: string | null) => {
    if (!dateStr) return "No records yet";
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  };

  const currentFreqLabel = FREQUENCY_OPTIONS.find(f => f.value === frequency)?.label || "Daily";

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
              Get notified to update your Income & Expenditure records
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
        {/* Notification Schedule Settings */}
        {reminderEnabled && (
          <>
            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Settings2 className="w-4 h-4 text-muted-foreground" />
                Notification Schedule
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency-select" className="text-sm">Reminder Frequency</Label>
                  <Select value={frequency} onValueChange={handleFrequencyChange}>
                    <SelectTrigger id="frequency-select">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCY_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reminder-time" className="text-sm">Preferred Time</Label>
                  <Input
                    id="reminder-time"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                You'll receive a notification at <span className="font-medium text-foreground">{reminderTime}</span> ({currentFreqLabel.toLowerCase()}) if records haven't been updated.
              </p>
            </div>
            <Separator />
          </>
        )}

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
          <div className="flex items-center gap-2">
            <Badge variant={incomeOverdue ? "destructive" : "secondary"}>
              {incomeOverdue ? "Overdue" : "Up to date"}
            </Badge>
            <Button
              size="sm"
              variant={incomeOverdue ? "default" : "outline"}
              className="gap-1"
              onClick={() => navigate("/dashboard/income")}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Update
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
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
          <div className="flex items-center gap-2">
            <Badge variant={expenseOverdue ? "destructive" : "secondary"}>
              {expenseOverdue ? "Overdue" : "Up to date"}
            </Badge>
            <Button
              size="sm"
              variant={expenseOverdue ? "default" : "outline"}
              className="gap-1"
              onClick={() => navigate("/dashboard/expenses")}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              Update
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {reminderEnabled && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {anyOverdue ? (
              <><BellOff className="w-3 h-3" /> You'll be reminded until records are updated.</>
            ) : (
              <><Bell className="w-3 h-3" /> Next reminder if no updates within {currentFreqLabel.toLowerCase().replace("every ", "")}.</>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default UpdateReminderSettings;
