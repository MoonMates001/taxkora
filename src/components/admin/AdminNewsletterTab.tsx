import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Mail } from "lucide-react";
import { format } from "date-fns";

interface Subscriber {
  id: string;
  email: string;
  status: string;
  source: string | null;
  subscribed_at: string;
}

export default function AdminNewsletterTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-platform", "list_newsletter"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-platform", {
        body: { action: "list_newsletter" },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data.subscribers as Subscriber[];
    },
  });

  const activeCount = data?.filter(s => s.status === "active").length || 0;

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1.5 text-sm">
          <Mail className="w-3.5 h-3.5 mr-1" />
          {activeCount} Active Subscribers
        </Badge>
        <Badge variant="secondary" className="px-3 py-1.5 text-sm">
          {data?.length || 0} Total
        </Badge>
      </div>

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
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.map(sub => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium text-sm">{sub.email}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${sub.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{sub.source || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(sub.subscribed_at), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!data || data.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No subscribers</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
