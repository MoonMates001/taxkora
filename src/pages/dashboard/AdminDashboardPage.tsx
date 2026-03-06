import { useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LayoutDashboard, Users, Crown, MessageSquare, ScrollText, Mail, Bell, UserPlus, Ticket, X } from "lucide-react";
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform management and analytics</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto">
          <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm py-2">
            <LayoutDashboard className="w-4 h-4 hidden sm:block" />
            Overview
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
