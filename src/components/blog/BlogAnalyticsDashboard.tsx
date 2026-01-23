import { useState } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import {
  BarChart3,
  TrendingUp,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Eye,
  ExternalLink,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogAnalytics } from "@/hooks/useBlogPostViews";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(160, 60%, 45%)",
  "hsl(200, 70%, 50%)",
  "hsl(280, 60%, 55%)",
  "hsl(340, 65%, 55%)",
];

const DeviceIcon = ({ device }: { device: string }) => {
  switch (device.toLowerCase()) {
    case "mobile":
      return <Smartphone className="w-4 h-4" />;
    case "tablet":
      return <Tablet className="w-4 h-4" />;
    default:
      return <Monitor className="w-4 h-4" />;
  }
};

const BlogAnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState("30");
  const { data: analytics, isLoading } = useBlogAnalytics(parseInt(dateRange));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12 bg-card rounded-xl border border-border">
        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Analytics Data</h3>
        <p className="text-muted-foreground">
          Analytics data will appear once your blog posts start receiving views.
        </p>
      </div>
    );
  }

  const chartConfig = {
    views: {
      label: "Views",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Header with Date Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Blog Analytics</h2>
          <p className="text-muted-foreground">Track your blog performance and audience insights</p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Total Views
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {analytics.totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last {dateRange} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Top Post
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.popularPosts[0] ? (
              <>
                <div className="text-lg font-semibold text-foreground truncate">
                  {analytics.popularPosts[0].title}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.popularPosts[0].views.toLocaleString()} views
                </p>
              </>
            ) : (
              <div className="text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Top Source
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.trafficSources[0] ? (
              <>
                <div className="text-lg font-semibold text-foreground">
                  {analytics.trafficSources[0].source}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.trafficSources[0].percentage}% of traffic
                </p>
              </>
            ) : (
              <div className="text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Top Device
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.deviceStats[0] ? (
              <>
                <div className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <DeviceIcon device={analytics.deviceStats[0].device} />
                  {analytics.deviceStats[0].device}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.deviceStats[0].percentage}% of visitors
                </p>
              </>
            ) : (
              <div className="text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Views Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Views Over Time</CardTitle>
          <CardDescription>Daily page views for your blog posts</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.viewTrends.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-80 w-full">
              <AreaChart data={analytics.viewTrends}>
                <defs>
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => format(new Date(value), "MMM d")}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  labelFormatter={(value) => format(new Date(value), "MMMM d, yyyy")}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#viewsGradient)"
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              No view data available for this period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Popular Posts & Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Posts</CardTitle>
            <CardDescription>Most viewed blog posts</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.popularPosts.length > 0 ? (
              <div className="space-y-4">
                {analytics.popularPosts.slice(0, 5).map((post, index) => (
                  <div key={post.post_id} className="flex items-center gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      index === 0 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/blog/${post.slug}`}
                        target="_blank"
                        className="font-medium text-foreground truncate hover:text-primary transition-colors flex items-center gap-1"
                      >
                        {post.title}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </Link>
                    </div>
                    <Badge variant="secondary">
                      {post.views.toLocaleString()}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground">
                No post data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Where your visitors come from</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.trafficSources.length > 0 ? (
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.trafficSources.slice(0, 5)}
                        dataKey="views"
                        nameKey="source"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                      >
                        {analytics.trafficSources.slice(0, 5).map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {analytics.trafficSources.slice(0, 5).map((source, index) => (
                    <div key={source.source} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-foreground">{source.source}</span>
                      </div>
                      <span className="text-muted-foreground">{source.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                No traffic source data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Device Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Device Breakdown</CardTitle>
          <CardDescription>Visitors by device type</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.deviceStats.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-48 w-full">
              <BarChart data={analytics.deviceStats} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="device" type="category" tick={{ fontSize: 12 }} width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="views" fill="hsl(var(--primary))" radius={4}>
                  {analytics.deviceStats.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              No device data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogAnalyticsDashboard;
