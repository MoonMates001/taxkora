import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingDown, Receipt, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const ExpensesPage = () => {
  const { profile } = useAuth();
  const isBusinessAccount = profile?.account_type === "business";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            {isBusinessAccount ? "Expenses" : "Expenditure"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isBusinessAccount
              ? "Track all your business expenses and deductions"
              : "Track your personal expenditure for tax deductions"}
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add {isBusinessAccount ? "Expense" : "Expenditure"}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total {isBusinessAccount ? "Expenses" : "Expenditure"}</p>
                <p className="font-display text-2xl font-bold text-foreground">₦0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-coral-400/10 rounded-xl flex items-center justify-center">
                <Receipt className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="font-display text-2xl font-bold text-foreground">₦0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Monthly</p>
                <p className="font-display text-2xl font-bold text-foreground">₦0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder={`Search ${isBusinessAccount ? "expenses" : "expenditure"}...`} className="pl-10" />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display">{isBusinessAccount ? "Expense" : "Expenditure"} Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingDown className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">
              No {isBusinessAccount ? "expenses" : "expenditure"} recorded yet
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Track your {isBusinessAccount ? "business expenses" : "personal expenditure"} to maximize deductions and get accurate tax calculations.
            </p>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Your First {isBusinessAccount ? "Expense" : "Expenditure"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpensesPage;
