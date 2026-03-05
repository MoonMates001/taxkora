import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Users, Crown, Clock, DollarSign, MessageSquare, TrendingUp, AlertTriangle, UserPlus } from "lucide-react";
import { useAdminPlatform } from "@/hooks/useAdminPlatform";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface OverviewData {
  totalUsers: number;
  businessUsers: number;
  personalUsers: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  expiredSubscriptions: number;
  totalRevenue: number;
  openTickets: number;
  totalTickets: number;
  recentSignups: number;
  signupsByDay: Record<string, number>;
  failedWebhooks: number;
}

const StatCard = ({ icon: Icon, label, value, color, subtitle }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  subtitle?: string;
}) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold truncate">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function AdminOverviewTab() {
  const { data, isLoading } = useAdminPlatform("get_overview");
  const overview = data?.overview as OverviewData | undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!overview) return null;

  const chartData = Object.entries(overview.signupsByDay).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    signups: count,
  }));

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={overview.totalUsers} color="bg-primary/10 text-primary" subtitle={`${overview.businessUsers} business · ${overview.personalUsers} personal`} />
        <StatCard icon={Crown} label="Active Subscriptions" value={overview.activeSubscriptions} color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" subtitle={`${overview.trialSubscriptions} trials`} />
        <StatCard icon={DollarSign} label="Total Revenue" value={formatCurrency(overview.totalRevenue)} color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" />
        <StatCard icon={UserPlus} label="New (30 days)" value={overview.recentSignups} color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
        <StatCard icon={MessageSquare} label="Open Tickets" value={overview.openTickets} color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" subtitle={`${overview.totalTickets} total`} />
        <StatCard icon={Clock} label="Expired Subs" value={overview.expiredSubscriptions} color="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" />
        <StatCard icon={AlertTriangle} label="Failed Webhooks" value={overview.failedWebhooks} color="bg-destructive/10 text-destructive" />
        <StatCard icon={TrendingUp} label="Conversion Rate" value={overview.totalUsers > 0 ? `${Math.round((overview.activeSubscriptions / overview.totalUsers) * 100)}%` : "0%"} color="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" />
      </div>

      {/* Signups Chart */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-4">User Signups (Last 14 Days)</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" fontSize={12} className="fill-muted-foreground" />
                <YAxis allowDecimals={false} fontSize={12} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar dataKey="signups" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
