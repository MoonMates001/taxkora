import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useIncome, getIncomeCategoriesByType, IncomeRecord } from "@/hooks/useIncome";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IncomeDialog } from "@/components/income/IncomeDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  TrendingUp,
  Wallet,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Calendar,
  Loader2,
} from "lucide-react";
import YearSelector from "@/components/dashboard/YearSelector";

const IncomePage = () => {
  const { profile } = useAuth();
  const { incomeRecords, isLoading, totalIncome, deleteIncome } = useIncome();
  const isBusinessAccount = profile?.account_type === "business";
  
  const categories = useMemo(
    () => getIncomeCategoriesByType(profile?.account_type || null),
    [profile?.account_type]
  );

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Available years from data
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    yearsSet.add(new Date().getFullYear());
    incomeRecords.forEach((r) => yearsSet.add(new Date(r.date).getFullYear()));
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [incomeRecords]);

  // Records filtered by year
  const yearRecords = useMemo(() => {
    return incomeRecords.filter((r) => new Date(r.date).getFullYear() === selectedYear);
  }, [incomeRecords, selectedYear]);

  const yearTotalIncome = useMemo(() => {
    return yearRecords.reduce((sum, r) => sum + Number(r.amount), 0);
  }, [yearRecords]);

  // Calculate this month's income (only for selected year)
  const thisMonthIncome = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    return yearRecords
      .filter((record) => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === currentMonth && new Date(record.date).getFullYear() === selectedYear;
      })
      .reduce((sum, record) => sum + Number(record.amount), 0);
  }, [yearRecords, selectedYear]);

  // Calculate average monthly income for selected year
  const avgMonthlyIncome = useMemo(() => {
    if (yearRecords.length === 0) return 0;
    const dates = yearRecords.map((r) => new Date(r.date));
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
    const monthsDiff =
      (maxDate.getFullYear() - minDate.getFullYear()) * 12 +
      (maxDate.getMonth() - minDate.getMonth()) +
      1;
    return yearTotalIncome / Math.max(monthsDiff, 1);
  }, [yearRecords, yearTotalIncome]);

  // Filter income records by search/category (already year-filtered)
  const filteredRecords = useMemo(() => {
    return yearRecords.filter((record) => {
      const matchesSearch =
        record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.clients?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || record.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [yearRecords, searchQuery, categoryFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryLabel = (category: string) => {
    return categories.find((c) => c.value === category)?.label || category;
  };

  const handleEdit = (income: IncomeRecord) => {
    setEditingIncome(income);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteIncome.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleAddNew = () => {
    setEditingIncome(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            {isBusinessAccount ? "Income" : "Income Sources"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {isBusinessAccount
              ? "Track all your business income and revenue"
              : "Aggregate income from all your sources"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <YearSelector
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            availableYears={availableYears}
          />
          <Button className="gap-2 w-full sm:w-auto" onClick={handleAddNew}>
            <Plus className="w-4 h-4" />
            Add {isBusinessAccount ? "Income" : "Income Source"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Income ({selectedYear})</p>
                <p className="font-display text-2xl font-bold text-foreground">
                  {formatCurrency(yearTotalIncome)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="font-display text-2xl font-bold text-foreground">
                  {formatCurrency(thisMonthIncome)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Monthly</p>
                <p className="font-display text-2xl font-bold text-foreground">
                  {formatCurrency(avgMonthlyIncome)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search income records..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Income List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display">Income Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="font-display font-semibold text-xl text-foreground mb-2">
                {searchQuery || categoryFilter !== "all"
                  ? "No matching records"
                  : "No income recorded yet"}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                {searchQuery || categoryFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Start tracking your income to get insights into your earnings and prepare for tax filing."}
              </p>
              {!searchQuery && categoryFilter === "all" && (
                <Button className="gap-2" onClick={handleAddNew}>
                  <Plus className="w-4 h-4" />
                  Add Your First Income
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {format(new Date(record.date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.description}</p>
                          {record.notes && (
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {record.notes}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getCategoryLabel(record.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.clients?.name || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(Number(record.amount))}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(record)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteId(record.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Income Dialog */}
      <IncomeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        income={editingIncome}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Income Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this income record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default IncomePage;
