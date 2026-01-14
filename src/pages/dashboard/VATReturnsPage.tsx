import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useVATTransactions, VATTransaction } from "@/hooks/useVATTransactions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Trash2,
  Receipt,
  TrendingUp,
  TrendingDown,
  Calculator,
  Calendar,
  FileDown,
  AlertCircle,
} from "lucide-react";
import { VAT_RATE } from "@/lib/tax/constants";
import { format, addDays, endOfMonth } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const VATReturnsPage = () => {
  const { profile } = useAuth();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { transactions, isLoading, createTransaction, deleteTransaction } = useVATTransactions(selectedYear, selectedMonth);

  const [formData, setFormData] = useState({
    transactionType: "output" as "output" | "input",
    description: "",
    amount: 0,
    isExempt: false,
    category: "",
    transactionDate: new Date().toISOString().split("T")[0],
  });

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Calculate VAT summary
  const outputTransactions = transactions.filter(t => t.transactionType === "output" && !t.isExempt);
  const inputTransactions = transactions.filter(t => t.transactionType === "input" && !t.isExempt);
  const exemptTransactions = transactions.filter(t => t.isExempt);

  const totalOutputVAT = outputTransactions.reduce((sum, t) => sum + t.vatAmount, 0);
  const totalInputVAT = inputTransactions.reduce((sum, t) => sum + t.vatAmount, 0);
  const netVATPayable = totalOutputVAT - totalInputVAT;
  const isRefund = netVATPayable < 0;

  const totalSales = outputTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalPurchases = inputTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExempt = exemptTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Filing deadline is 21st of the following month
  const filingDeadline = addDays(endOfMonth(new Date(selectedYear, selectedMonth - 1)), 21);
  const isOverdue = new Date() > filingDeadline;

  const handleAddTransaction = () => {
    setFormData({
      transactionType: "output",
      description: "",
      amount: 0,
      isExempt: false,
      category: "",
      transactionDate: new Date().toISOString().split("T")[0],
    });
    setIsDialogOpen(true);
  };

  const handleSaveTransaction = () => {
    const vatAmount = formData.isExempt ? 0 : formData.amount * VAT_RATE;
    
    createTransaction.mutate({
      transactionType: formData.transactionType,
      description: formData.description,
      amount: formData.amount,
      vatAmount,
      category: formData.category || undefined,
      isExempt: formData.isExempt,
      transactionDate: formData.transactionDate,
      year: selectedYear,
      month: selectedMonth,
    });
    
    setIsDialogOpen(false);
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction.mutate(id);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const monthName = MONTHS.find(m => m.value === selectedMonth)?.label;

    doc.setFontSize(20);
    doc.text("VAT Return Report", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`Period: ${monthName} ${selectedYear}`, 20, 35);
    doc.text(`Business: ${profile?.business_name || profile?.full_name || "N/A"}`, 20, 42);
    doc.text(`Filing Deadline: ${format(filingDeadline, "dd MMM yyyy")}`, 20, 49);

    // Summary
    doc.setFontSize(14);
    doc.text("VAT Summary", 20, 65);
    
    autoTable(doc, {
      startY: 70,
      head: [["Description", "Amount"]],
      body: [
        ["Total Output VAT (Sales)", formatCurrency(totalOutputVAT)],
        ["Total Input VAT (Purchases)", formatCurrency(totalInputVAT)],
        ["Net VAT Payable", formatCurrency(Math.abs(netVATPayable))],
        ["Status", isRefund ? "REFUND DUE" : "PAYMENT DUE"],
      ],
      theme: "striped",
    });

    // Transactions
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
    doc.setFontSize(14);
    doc.text("Transaction Details", 20, finalY + 15);

    autoTable(doc, {
      startY: finalY + 20,
      head: [["Date", "Type", "Description", "Amount", "VAT"]],
      body: transactions.map(t => [
        format(new Date(t.transactionDate), "dd/MM/yyyy"),
        t.transactionType.toUpperCase(),
        t.description,
        formatCurrency(t.amount),
        t.isExempt ? "Exempt" : formatCurrency(t.vatAmount),
      ]),
      theme: "striped",
    });

    doc.save(`VAT-Return-${monthName}-${selectedYear}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">VAT Returns</h1>
          <p className="text-muted-foreground mt-1">
            Track monthly input/output VAT and net payable calculations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportToPDF}>
            <FileDown className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAddTransaction}>
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Filing Deadline Alert */}
      <Card className={`shadow-card ${isOverdue ? "border-destructive" : "border-amber-500/50"}`}>
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isOverdue ? "bg-destructive/10" : "bg-amber-100"}`}>
              <AlertCircle className={`w-5 h-5 ${isOverdue ? "text-destructive" : "text-amber-600"}`} />
            </div>
            <div>
              <p className="font-medium">
                {isOverdue ? "Filing Overdue!" : "Filing Deadline"}
              </p>
              <p className="text-sm text-muted-foreground">
                VAT returns for {MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear} are due by{" "}
                <strong>{format(filingDeadline, "dd MMMM yyyy")}</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Output VAT</p>
                <p className="text-2xl font-bold">{formatCurrency(totalOutputVAT)}</p>
                <p className="text-xs text-muted-foreground">On sales: {formatCurrency(totalSales)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Input VAT</p>
                <p className="text-2xl font-bold">{formatCurrency(totalInputVAT)}</p>
                <p className="text-xs text-muted-foreground">On purchases: {formatCurrency(totalPurchases)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isRefund ? "bg-green-100" : "bg-amber-100"}`}>
                <Calculator className={`w-6 h-6 ${isRefund ? "text-green-600" : "text-amber-600"}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net VAT {isRefund ? "Refund" : "Payable"}</p>
                <p className="text-2xl font-bold">{formatCurrency(Math.abs(netVATPayable))}</p>
                <Badge variant={isRefund ? "default" : "secondary"}>
                  {isRefund ? "Refund Due" : "Payment Due"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <Receipt className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Exempt Transactions</p>
                <p className="text-2xl font-bold">{formatCurrency(totalExempt)}</p>
                <p className="text-xs text-muted-foreground">{exemptTransactions.length} transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* VAT Rate Info */}
      <Card className="shadow-card">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-lg px-4 py-1">
                {(VAT_RATE * 100).toFixed(1)}%
              </Badge>
              <span className="text-muted-foreground">Current VAT Rate (Nigeria Tax Act 2025/2026)</span>
            </div>
            <p className="text-sm text-muted-foreground">
              VAT = Net Amount × {(VAT_RATE * 100).toFixed(1)}%
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>VAT Transactions</CardTitle>
          <CardDescription>
            {MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear} - {transactions.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2">No transactions recorded</h3>
              <p className="text-muted-foreground mb-4">
                Add your sales and purchase transactions to calculate VAT
              </p>
              <Button onClick={handleAddTransaction}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Transaction
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">VAT</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(transaction.transactionDate), "dd/MM/yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.transactionType === "output" ? "default" : "secondary"}>
                          {transaction.transactionType === "output" ? "Output" : "Input"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{transaction.description}</TableCell>
                      <TableCell>
                        {transaction.category && (
                          <Badge variant="outline">{transaction.category}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell className="text-right">
                        {transaction.isExempt ? (
                          <Badge variant="outline">Exempt</Badge>
                        ) : (
                          formatCurrency(transaction.vatAmount)
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(transaction.amount + transaction.vatAmount)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Transaction Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add VAT Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Select
                value={formData.transactionType}
                onValueChange={(v) => setFormData({ ...formData, transactionType: v as "output" | "input" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="output">Output (Sales)</SelectItem>
                  <SelectItem value="input">Input (Purchases)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Enter transaction description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Net Amount (₦)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={formData.amount || ""}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              />
              {!formData.isExempt && formData.amount > 0 && (
                <p className="text-sm text-muted-foreground">
                  VAT: {formatCurrency(formData.amount * VAT_RATE)} | 
                  Total: {formatCurrency(formData.amount * (1 + VAT_RATE))}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category (Optional)</Label>
              <Input
                id="category"
                placeholder="e.g., Consulting, Equipment, etc."
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Transaction Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.transactionDate}
                onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="exempt">VAT Exempt</Label>
                <p className="text-sm text-muted-foreground">Mark if this is a VAT-exempt transaction</p>
              </div>
              <Switch
                id="exempt"
                checked={formData.isExempt}
                onCheckedChange={(checked) => setFormData({ ...formData, isExempt: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTransaction} disabled={!formData.description || formData.amount <= 0}>
              Add Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VATReturnsPage;
