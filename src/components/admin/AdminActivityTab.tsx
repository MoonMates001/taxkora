import { useState, useMemo } from "react";
import { useAdminPlatform } from "@/hooks/useAdminPlatform";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Activity, Users, Eye, LogIn, Smartphone, Monitor, Tablet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { format, parseISO } from "date-fns";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const eventLabels: Record<string, string> = {
  page_view: "Page View",
  login: "Login",
  feature_use: "Feature Use",
};

const platformLabels: Record<string, string> = {
  web: "Web Browser",
  android: "Android App",
  ios: "iOS App",
};

const platformIcons: Record<string, typeof Monitor> = {
  web: Monitor,
  android: Smartphone,
  ios: Smartphone,
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

export default function AdminActivityTab() {
  const [days, setDays] = useState("7");
  const { data, isLoading } = useAdminPlatform("get_activity_report", { days: Number(days) });

  const report = data?.report;

  const dailyChartData = useMemo(() => {
    if (!report?.daily_events) return [];
    return Object.entries(report.daily_events as Record<string, number>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date: format(parseISO(date), "MMM d"),
        events: count,
      }));
  }, [report]);

  const pageChartData = useMemo(() => {
    if (!report?.top_pages) return [];
    return (report.top_pages as Array<{ page: string; count: number }>).slice(0, 8).map((p) => ({
      name: p.page.replace("/dashboard", "").replace("/", "") || "Dashboard Home",
      value: p.count,
    }));
  }, [report]);

  const platformChartData = useMemo(() => {
    if (!report?.platform_breakdown) return [];
    return Object.entries(report.platform_breakdown as Record<string, number>)
      .filter(([, count]) => count > 0)
      .map(([platform, count]) => ({
        name: platformLabels[platform] || platform,
        value: count,
      }));
  }, [report]);

  const deviceChartData = useMemo(() => {
    if (!report?.device_breakdown) return [];
    return Object.entries(report.device_breakdown as Record<string, number>)
      .filter(([, count]) => count > 0)
      .map(([device, count]) => ({
        name: device.charAt(0).toUpperCase() + device.slice(1),
        value: count,
      }));
  }, [report]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const platformBreakdown = (report?.platform_breakdown || {}) as Record<string, number>;
  const deviceBreakdown = (report?.device_breakdown || {}) as Record<string, number>;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">User Activity Report</h2>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Activity className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{report?.total_events ?? 0}</p>
                <p className="text-xs text-muted-foreground">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10"><Users className="w-5 h-5 text-green-500" /></div>
              <div>
                <p className="text-2xl font-bold">{report?.active_users ?? 0}</p>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10"><Eye className="w-5 h-5 text-blue-500" /></div>
              <div>
                <p className="text-2xl font-bold">{report?.total_page_views ?? 0}</p>
                <p className="text-xs text-muted-foreground">Page Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10"><LogIn className="w-5 h-5 text-amber-500" /></div>
              <div>
                <p className="text-2xl font-bold">{report?.total_logins ?? 0}</p>
                <p className="text-xs text-muted-foreground">Logins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10"><Smartphone className="w-5 h-5 text-purple-500" /></div>
              <div>
                <p className="text-2xl font-bold">{report?.native_app_events ?? 0}</p>
                <p className="text-xs text-muted-foreground">Native App Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform & Device Breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(platformBreakdown).map(([platform, count]) => {
          const Icon = platformIcons[platform] || Monitor;
          return (
            <Card key={platform}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-lg font-semibold">{count}</p>
                    <p className="text-xs text-muted-foreground">{platformLabels[platform] || platform}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {Object.entries(deviceBreakdown).filter(([, c]) => c > 0).map(([device, count]) => {
          const Icon = platformIcons[device] || Monitor;
          return (
            <Card key={device}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-lg font-semibold">{count}</p>
                    <p className="text-xs text-muted-foreground">{device.charAt(0).toUpperCase() + device.slice(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Daily Activity</CardTitle></CardHeader>
          <CardContent>
            {dailyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dailyChartData}>
                  <XAxis dataKey="date" fontSize={12} tickLine={false} />
                  <YAxis fontSize={12} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="events" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-10">No activity data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Platform Distribution</CardTitle></CardHeader>
          <CardContent>
            {platformChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={platformChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {platformChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-10">No platform data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top Pages</CardTitle></CardHeader>
          <CardContent>
            {pageChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pageChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {pageChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-10">No page data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Device Types</CardTitle></CardHeader>
          <CardContent>
            {deviceChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={deviceChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {deviceChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-10">No device data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Most Active Users */}
      <Card>
        <CardHeader><CardTitle className="text-base">Most Active Users</CardTitle></CardHeader>
        <CardContent>
          {report?.most_active_users?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead className="text-right">Events</TableHead>
                  <TableHead className="text-right">Sessions</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(report.most_active_users as Array<any>).map((u: any) => (
                  <TableRow key={u.user_id}>
                    <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.platform === "android" || u.platform === "ios" ? "default" : "outline"} className="text-xs capitalize">
                        {u.platform === "android" ? "🤖 Android" : u.platform === "ios" ? "🍎 iOS" : "🌐 Web"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{u.event_count}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{u.session_count}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.last_active ? format(parseISO(u.last_active), "MMM d, h:mm a") : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No user activity yet</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Events</CardTitle></CardHeader>
        <CardContent>
          {report?.recent_events?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Page / Feature</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(report.recent_events as Array<any>).map((e: any) => {
                  const platform = e.metadata?.platform || "web";
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(parseISO(e.created_at), "MMM d, h:mm a")}
                      </TableCell>
                      <TableCell className="text-sm">{e.email || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={e.event_type === "login" ? "default" : "outline"} className="text-xs">
                          {eventLabels[e.event_type] || e.event_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground capitalize">
                          {platform === "android" ? "🤖" : platform === "ios" ? "🍎" : "🌐"} {platform}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {e.feature_name || e.page_path || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No events yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
