import { useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LayoutDashboard, Users, Crown, MessageSquare, ScrollText, Mail, Bell, UserPlus, Ticket, X, Activity } from "lucide-react";
import { useAdminRealtimeNotifications } from "@/hooks/useAdminRealtimeNotifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

const AdminOverviewTab = lazy(() => import("@/components/admin/AdminOverviewTab"));
const AdminUsersTab = lazy(() => import("@/components/admin/AdminUsersTab"));
const AdminTicketsTab = lazy(() => import("@/components/admin/AdminTicketsTab"));
const AdminLogsTab = lazy(() => import("@/components/admin/AdminLogsTab"));
const AdminNewsletterTab = lazy(() => import("@/components/admin/AdminNewsletterTab"));
const AdminActivityTab = lazy(() => import("@/components/admin/AdminActivityTab"));

// Re-use existing subscription management
const AdminSubscriptionsContent = lazy(() => import("@/pages/dashboard/AdminSubscriptionsPage").then(mod => {
  // We import the page but it has its own admin guard – we'll use it as a tab
  return mod;
}));

const TabFallback = () => (
  <div className="flex items-center justify-center py-16">
    <Loader2 className="w-6 h-6 animate-spin text-primary" />
  </div>
);

export default function AdminDashboardPage() {
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAllRead, clearAll } = useAdminRealtimeNotifications();

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, roleLoading, navigate]);

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform management and analytics</p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-destructive text-destructive-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <p className="font-semibold text-sm">Notifications</p>
              <div className="flex gap-1">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={markAllRead}>
                    Mark all read
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearAll}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
            <ScrollArea className="max-h-[320px]">
              {notifications.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">No notifications yet</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b last:border-0 transition-colors ${
                      !n.read ? "bg-accent/50" : ""
                    }`}
                  >
                    <div className={`mt-0.5 rounded-full p-1.5 ${
                      n.type === "new_ticket" 
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" 
                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    }`}>
                      {n.type === "new_ticket" ? <Ticket className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{n.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {formatDistanceToNow(n.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 h-auto">
          <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm py-2">
            <LayoutDashboard className="w-4 h-4 hidden sm:block" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-1.5 text-xs sm:text-sm py-2">
            <Activity className="w-4 h-4 hidden sm:block" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5 text-xs sm:text-sm py-2">
            <Users className="w-4 h-4 hidden sm:block" />
            Users
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="gap-1.5 text-xs sm:text-sm py-2">
            <Crown className="w-4 h-4 hidden sm:block" />
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="tickets" className="gap-1.5 text-xs sm:text-sm py-2">
            <MessageSquare className="w-4 h-4 hidden sm:block" />
            Tickets
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-1.5 text-xs sm:text-sm py-2">
            <ScrollText className="w-4 h-4 hidden sm:block" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="newsletter" className="gap-1.5 text-xs sm:text-sm py-2">
            <Mail className="w-4 h-4 hidden sm:block" />
            Newsletter
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Suspense fallback={<TabFallback />}>
            <AdminOverviewTab />
          </Suspense>
        </TabsContent>

        <TabsContent value="activity">
          <Suspense fallback={<TabFallback />}>
            <AdminActivityTab />
          </Suspense>
        </TabsContent>

        <TabsContent value="users">
          <Suspense fallback={<TabFallback />}>
            <AdminUsersTab />
          </Suspense>
        </TabsContent>

        <TabsContent value="subscriptions">
          <Suspense fallback={<TabFallback />}>
            <AdminSubscriptionsContent />
          </Suspense>
        </TabsContent>

        <TabsContent value="tickets">
          <Suspense fallback={<TabFallback />}>
            <AdminTicketsTab />
          </Suspense>
        </TabsContent>

        <TabsContent value="logs">
          <Suspense fallback={<TabFallback />}>
            <AdminLogsTab />
          </Suspense>
        </TabsContent>

        <TabsContent value="newsletter">
          <Suspense fallback={<TabFallback />}>
            <AdminNewsletterTab />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
