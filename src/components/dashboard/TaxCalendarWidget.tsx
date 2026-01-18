import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, AlertTriangle, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { format, addDays, endOfMonth, isAfter, isBefore, differenceInDays } from "date-fns";
import { Link } from "react-router-dom";
import { useVATFilingStatus } from "@/hooks/useVATFilingStatus";
import { useAuth } from "@/hooks/useAuth";

interface TaxDeadline {
  id: string;
  name: string;
  description: string;
  dueDate: Date;
  type: "vat" | "wht" | "pit" | "cit" | "provisional";
  status: "overdue" | "due_soon" | "upcoming" | "filed";
  link?: string;
}

interface TaxCalendarWidgetProps {
  selectedYear?: number;
}

const TaxCalendarWidget = ({ selectedYear }: TaxCalendarWidgetProps) => {
  const { profile } = useAuth();
  const currentYear = selectedYear || new Date().getFullYear();
  const { filingStatuses } = useVATFilingStatus(currentYear);
  const isBusinessAccount = profile?.account_type === "business";

  const deadlines = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const allDeadlines: TaxDeadline[] = [];

    // Generate VAT deadlines for current and next 2 months
    for (let i = 0; i < 3; i++) {
      const month = ((currentMonth - 1 + i) % 12) + 1;
      const year = currentMonth + i > 12 ? currentYear + 1 : currentYear;
      const monthName = format(new Date(year, month - 1), "MMMM");
      const dueDate = addDays(endOfMonth(new Date(year, month - 1)), 21);
      
      const vatStatus = filingStatuses.find(s => s.year === year && s.month === month);
      let status: TaxDeadline["status"] = "upcoming";
      
      if (vatStatus?.status === "paid" || vatStatus?.status === "filed") {
        status = "filed";
      } else if (isAfter(now, dueDate)) {
        status = "overdue";
      } else if (differenceInDays(dueDate, now) <= 7) {
        status = "due_soon";
      }

      allDeadlines.push({
        id: `vat-${year}-${month}`,
        name: `VAT Return - ${monthName}`,
        description: `File VAT return for ${monthName} ${year}`,
        dueDate,
        type: "vat",
        status,
        link: "/dashboard/vat",
      });
    }

    // WHT Monthly Remittance deadlines (21st of each month)
    for (let i = 0; i < 2; i++) {
      const month = ((currentMonth + i) % 12) + 1;
      const year = currentMonth + i + 1 > 12 ? currentYear + 1 : currentYear;
      const monthName = format(new Date(year, month - 1), "MMMM");
      const dueDate = new Date(year, month - 1, 21);

      let status: TaxDeadline["status"] = "upcoming";
      if (isAfter(now, dueDate)) {
        status = "overdue";
      } else if (differenceInDays(dueDate, now) <= 7) {
        status = "due_soon";
      }

      allDeadlines.push({
        id: `wht-${year}-${month}`,
        name: `WHT Remittance - ${monthName}`,
        description: `Remit WHT deductions for ${monthName} ${year}`,
        dueDate,
        type: "wht",
        status,
        link: "/dashboard/wht",
      });
    }

    // Annual Tax Filing Deadlines
    if (isBusinessAccount) {
      // CIT - 6 months after year end (assuming Dec year end = June 30)
      const citDueDate = new Date(currentYear, 5, 30); // June 30
      allDeadlines.push({
        id: `cit-${currentYear}`,
        name: `CIT Annual Return`,
        description: `File Companies Income Tax return for ${currentYear - 1}`,
        dueDate: citDueDate,
        type: "cit",
        status: isAfter(now, citDueDate) ? "overdue" : differenceInDays(citDueDate, now) <= 30 ? "due_soon" : "upcoming",
        link: "/dashboard/tax-filing",
      });

      // Provisional Tax - March 31
      const provisionalDate = new Date(currentYear, 2, 31); // March 31
      if (isBefore(now, provisionalDate) || differenceInDays(now, provisionalDate) < 30) {
        allDeadlines.push({
          id: `provisional-${currentYear}`,
          name: `Provisional Tax`,
          description: `Pay provisional tax for ${currentYear}`,
          dueDate: provisionalDate,
          type: "provisional",
          status: isAfter(now, provisionalDate) ? "overdue" : differenceInDays(provisionalDate, now) <= 30 ? "due_soon" : "upcoming",
          link: "/dashboard/tax",
        });
      }
    } else {
      // PIT - March 31
      const pitDueDate = new Date(currentYear, 2, 31); // March 31
      allDeadlines.push({
        id: `pit-${currentYear}`,
        name: `PIT Annual Return`,
        description: `File Personal Income Tax return for ${currentYear - 1}`,
        dueDate: pitDueDate,
        type: "pit",
        status: isAfter(now, pitDueDate) ? "overdue" : differenceInDays(pitDueDate, now) <= 30 ? "due_soon" : "upcoming",
        link: "/dashboard/tax-filing",
      });
    }

    // Sort by due date, prioritizing overdue and due_soon
    return allDeadlines.sort((a, b) => {
      const statusOrder = { overdue: 0, due_soon: 1, upcoming: 2, filed: 3 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return a.dueDate.getTime() - b.dueDate.getTime();
    }).slice(0, 6);
  }, [currentYear, filingStatuses, isBusinessAccount]);

  const getStatusBadge = (status: TaxDeadline["status"]) => {
    switch (status) {
      case "overdue":
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" />Overdue</Badge>;
      case "due_soon":
        return <Badge className="bg-amber-500 hover:bg-amber-600 gap-1"><Clock className="w-3 h-3" />Due Soon</Badge>;
      case "filed":
        return <Badge className="bg-green-500 hover:bg-green-600 gap-1"><CheckCircle className="w-3 h-3" />Filed</Badge>;
      default:
        return <Badge variant="secondary" className="gap-1"><Calendar className="w-3 h-3" />Upcoming</Badge>;
    }
  };

  const getTypeColor = (type: TaxDeadline["type"]) => {
    switch (type) {
      case "vat": return "bg-blue-100 text-blue-700";
      case "wht": return "bg-purple-100 text-purple-700";
      case "pit": return "bg-green-100 text-green-700";
      case "cit": return "bg-orange-100 text-orange-700";
      case "provisional": return "bg-teal-100 text-teal-700";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const overdueCount = deadlines.filter(d => d.status === "overdue").length;
  const dueSoonCount = deadlines.filter(d => d.status === "due_soon").length;

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-display flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Tax Calendar
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {overdueCount > 0 && <span className="text-destructive font-medium">{overdueCount} overdue • </span>}
            {dueSoonCount > 0 && <span className="text-amber-600 font-medium">{dueSoonCount} due soon</span>}
            {overdueCount === 0 && dueSoonCount === 0 && "All filings up to date"}
          </p>
        </div>
        <Link to="/dashboard/tax-filing">
          <Button variant="ghost" size="sm" className="text-primary">
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {deadlines.map((deadline) => (
          <div
            key={deadline.id}
            className={`p-3 rounded-lg border transition-colors ${
              deadline.status === "overdue" ? "border-destructive/50 bg-destructive/5" :
              deadline.status === "due_soon" ? "border-amber-500/50 bg-amber-50" :
              deadline.status === "filed" ? "border-green-500/50 bg-green-50" :
              "border-border bg-muted/30"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeColor(deadline.type)}`}>
                    {deadline.type.toUpperCase()}
                  </span>
                  {getStatusBadge(deadline.status)}
                </div>
                <p className="font-medium text-sm truncate">{deadline.name}</p>
                <p className="text-xs text-muted-foreground">
                  Due: {format(deadline.dueDate, "dd MMM yyyy")}
                </p>
              </div>
              {deadline.link && deadline.status !== "filed" && (
                <Link to={deadline.link}>
                  <Button variant="ghost" size="sm" className="shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TaxCalendarWidget;
