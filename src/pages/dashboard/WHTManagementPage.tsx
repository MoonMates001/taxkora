import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWHTTransactions } from "@/hooks/useWHTTransactions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Receipt,
  Plus,
  Trash2,
  Download,
  Calendar,
  Building2,
  User,
  Globe,
  Calculator,
  FileText,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import SubscriptionGate from "@/components/subscription/SubscriptionGate";
import { format } from "date-fns";
import {
  WHTPaymentType,
  RecipientType,
  WHT_RATE_CONFIG,
  computeWHT,
  getWHTRate,
} from "@/lib/tax/wht";
import { maskTIN } from "@/lib/dataMasking";

const WHTManagementPage = () => {
  const { profile } = useAuth();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Use the database-backed hook
  const { transactions, isLoading, createTransaction, deleteTransaction } = useWHTTransactions(selectedYear);

  // Form state for new transaction
  const [form, setForm] = useState({
    paymentType: "professionalFees" as WHTPaymentType,
    recipientType: "individual" as RecipientType,
    recipientName: "",
    recipientTIN: "",
    grossAmount: "",
    paymentDate: format(new Date(), "yyyy-MM-dd"),
    description: "",
  });

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
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

  // Filter transactions by period
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = new Date(tx.paymentDate);
      const txMonth = txDate.getMonth() + 1;
      if (selectedMonth) {
        return txMonth === selectedMonth;
      }
      return true;
    });
  }, [transactions, selectedMonth]);

  // Compute WHT summary
  const whtSummary = useMemo(() => {
    return computeWHT({
      year: selectedYear,
      month: selectedMonth || undefined,
      transactions: filteredTransactions,
    });
  }, [filteredTransactions, selectedYear, selectedMonth]);

  // Get remittance schedule
  const remittanceSchedule = useMemo(() => {
    const schedule: {
      month: string;
      dueDate: string;
      amount: number;
      status: "pending" | "due" | "overdue";
    }[] = [];

    // Group transactions by month
    const byMonth = new Map<number, number>();
    transactions.forEach((tx) => {
      const month = new Date(tx.paymentDate).getMonth() + 1;
      byMonth.set(month, (byMonth.get(month) || 0) + tx.whtAmount);
    });

    byMonth.forEach((amount, month) => {
      const deadlineMonth = month === 12 ? 1 : month + 1;
      const deadlineYear = month === 12 ? selectedYear + 1 : selectedYear;
      const dueDate = new Date(deadlineYear, deadlineMonth - 1, 21);
      const today = new Date();

      let status: "pending" | "due" | "overdue" = "pending";
      if (today > dueDate) {
        status = "overdue";
      } else if (today.getMonth() + 1 === deadlineMonth && today.getFullYear() === deadlineYear) {
        status = "due";
      }

      schedule.push({
        month: months[month - 1].label,
        dueDate: format(dueDate, "MMM d, yyyy"),
        amount,
        status,
      });
    });

    return schedule.sort((a, b) => months.findIndex(m => m.label === a.month) - months.findIndex(m => m.label === b.month));
  }, [transactions, selectedYear]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddTransaction = async () => {
    if (!form.recipientName || !form.grossAmount) {
      toast.error("Please fill in recipient name and gross amount");
      return;
    }

    const grossAmount = parseFloat(form.grossAmount);
    if (isNaN(grossAmount) || grossAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    await createTransaction.mutateAsync({
      paymentType: form.paymentType,
      recipientType: form.recipientType,
      recipientName: form.recipientName,
      recipientTIN: form.recipientTIN || undefined,
      grossAmount,
      paymentDate: form.paymentDate,
      description: form.description || undefined,
    });

    setDialogOpen(false);
    setForm({
      paymentType: "professionalFees",
      recipientType: "individual",
      recipientName: "",
      recipientTIN: "",
      grossAmount: "",
      paymentDate: format(new Date(), "yyyy-MM-dd"),
      description: "",
    });
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction.mutate(id);
  };

  const getRecipientIcon = (type: RecipientType) => {
    switch (type) {
      case "corporate":
        return <Building2 className="w-4 h-4" />;
      case "individual":
        return <User className="w-4 h-4" />;
      case "non_resident":
        return <Globe className="w-4 h-4" />;
    }
  };

  const getPaymentTypeLabel = (type: WHTPaymentType) => {
    return WHT_RATE_CONFIG.find((c) => c.type === type)?.label || type;
  };

  const generateRemittanceReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(0, 128, 128);
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("WHT REMITTANCE SCHEDULE", pageWidth / 2, 18, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const periodLabel = selectedMonth
      ? `${months[selectedMonth - 1].label} ${selectedYear}`
      : `Year ${selectedYear}`;
    doc.text(periodLabel, pageWidth / 2, 30, { align: "center" });

    // Business Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("PAYER INFORMATION", 14, 55);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${profile?.full_name || profile?.business_name || "N/A"}`, 14, 65);
    doc.text(`Generated: ${format(new Date(), "MMM d, yyyy")}`, 14, 72);

    // Summary
    let yPos = 90;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("WHT SUMMARY", 14, yPos);

    autoTable(doc, {
      startY: yPos + 5,
      head: [["Description", "Amount"]],
      body: [
        ["Total Gross Payments", formatCurrency(whtSummary.totalGrossPayments)],
        ["Total WHT Deducted", formatCurrency(whtSummary.totalWHTDeducted)],
        ["Total Net Payments", formatCurrency(whtSummary.totalNetPayments)],
      ],
      theme: "striped",
      headStyles: { fillColor: [0, 128, 128] },
    });

    // By Payment Type
    yPos = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("WHT BY PAYMENT TYPE", 14, yPos);

    const byTypeData = whtSummary.byPaymentType.map((item) => [
      item.label,
      item.transactionCount.toString(),
      formatCurrency(item.grossAmount),
      formatCurrency(item.whtAmount),
    ]);

    autoTable(doc, {
      startY: yPos + 5,
      head: [["Payment Type", "Count", "Gross Amount", "WHT Deducted"]],
      body: byTypeData,
      theme: "striped",
      headStyles: { fillColor: [0, 128, 128] },
    });

    // Transactions
    if (filteredTransactions.length > 0) {
      yPos = (doc as any).lastAutoTable.finalY + 15;

      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("TRANSACTION DETAILS", 14, yPos);

      const txData = filteredTransactions.map((tx) => [
        format(new Date(tx.paymentDate), "MMM d"),
        tx.recipientName,
        getPaymentTypeLabel(tx.paymentType),
        formatCurrency(tx.grossAmount),
        `${(tx.whtRate * 100).toFixed(0)}%`,
        formatCurrency(tx.whtAmount),
      ]);

      autoTable(doc, {
        startY: yPos + 5,
        head: [["Date", "Recipient", "Type", "Gross", "Rate", "WHT"]],
        body: txData,
        theme: "striped",
        headStyles: { fillColor: [0, 128, 128] },
        styles: { fontSize: 8 },
      });
    }

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text("WHT must be remitted to FIRS within 21 days of deduction.", 14, finalY);
    doc.text(`Generated by TAXKORA on ${format(new Date(), "PPpp")}`, 14, finalY + 8);

    doc.save(`WHT_Remittance_${selectedYear}${selectedMonth ? `_${selectedMonth}` : ""}.pdf`);
    toast.success("WHT remittance report downloaded");
  };

  const currentRate = getWHTRate(form.paymentType, form.recipientType);
  const previewAmount = parseFloat(form.grossAmount) || 0;
  const previewWHT = previewAmount * currentRate;
  const previewNet = previewAmount - previewWHT;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SubscriptionGate requiredPlan={["pit_business", "cit"]} feature="WHT Management">
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">WHT Management</h1>
          <p className="text-muted-foreground mt-1">
            Track withholding tax deductions and generate remittance schedules
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedMonth?.toString() || "all"}
            onValueChange={(v) => setSelectedMonth(v === "all" ? null : parseInt(v))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value.toString()}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedYear.toString()}
            onValueChange={(v) => setSelectedYear(parseInt(v))}
          >
            <SelectTrigger className="w-28">
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
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Receipt className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="font-display text-2xl font-bold text-foreground">
                  {filteredTransactions.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Calculator className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gross Payments</p>
                <p className="font-display text-2xl font-bold text-foreground">
                  {formatCurrency(whtSummary.totalGrossPayments)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-2 border-primary">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                <Receipt className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">WHT Deducted</p>
                <p className="font-display text-2xl font-bold text-primary">
                  {formatCurrency(whtSummary.totalWHTDeducted)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Payments</p>
                <p className="font-display text-2xl font-bold text-foreground">
                  {formatCurrency(whtSummary.totalNetPayments)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="schedule">Remittance Schedule</TabsTrigger>
          <TabsTrigger value="rates">WHT Rates</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-display flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-primary" />
                  WHT Transactions
                </CardTitle>
                <CardDescription>
                  Record payments made where withholding tax was deducted
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={generateRemittanceReport} className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                <Button onClick={() => setDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Transaction
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No WHT transactions recorded</p>
                  <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                    Record Your First Transaction
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Gross</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">WHT</TableHead>
                      <TableHead className="text-right">Net</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          {format(new Date(tx.paymentDate), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRecipientIcon(tx.recipientType)}
                            <div>
                              <p className="font-medium">{tx.recipientName}</p>
                              {tx.recipientTIN && (
                                <p className="text-xs text-muted-foreground">TIN: {maskTIN(tx.recipientTIN)}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getPaymentTypeLabel(tx.paymentType)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(tx.grossAmount)}</TableCell>
                        <TableCell className="text-right">{(tx.whtRate * 100).toFixed(0)}%</TableCell>
                        <TableCell className="text-right font-medium text-primary">
                          {formatCurrency(tx.whtAmount)}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(tx.netAmount)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTransaction(tx.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Summary by Type */}
          {whtSummary.byPaymentType.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="font-display text-lg">By Payment Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {whtSummary.byPaymentType.map((item) => (
                      <div key={item.type} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.transactionCount} transactions</p>
                        </div>
                        <p className="font-bold text-primary">{formatCurrency(item.whtAmount)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="font-display text-lg">By Recipient Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {whtSummary.byRecipientType.map((item) => (
                      <div key={item.type} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-2">
                          {getRecipientIcon(item.type)}
                          <div>
                            <p className="font-medium">{item.label}</p>
                            <p className="text-sm text-muted-foreground">{item.transactionCount} transactions</p>
                          </div>
                        </div>
                        <p className="font-bold text-primary">{formatCurrency(item.whtAmount)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Remittance Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Remittance Schedule - {selectedYear}
              </CardTitle>
              <CardDescription>
                WHT must be remitted to FIRS within 21 days of deduction
              </CardDescription>
            </CardHeader>
            <CardContent>
              {remittanceSchedule.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No WHT to remit for {selectedYear}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deduction Month</TableHead>
                      <TableHead>Remittance Due</TableHead>
                      <TableHead className="text-right">WHT Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {remittanceSchedule.map((item) => (
                      <TableRow key={item.month}>
                        <TableCell className="font-medium">{item.month}</TableCell>
                        <TableCell>{item.dueDate}</TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(item.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              item.status === "overdue"
                                ? "bg-red-100 text-red-800"
                                : item.status === "due"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }
                          >
                            {item.status === "overdue" && <AlertCircle className="w-3 h-3 mr-1" />}
                            {item.status === "due" && <Clock className="w-3 h-3 mr-1" />}
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-blue-800">
                  <p className="font-semibold">Remittance Guidelines</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• WHT deducted must be remitted to FIRS by the 21st of the following month</li>
                    <li>• Late remittance attracts 10% penalty plus interest</li>
                    <li>• WHT receipts should be issued to recipients as proof of deduction</li>
                    <li>• Annual WHT returns are due by January 31st of the following year</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rates Tab */}
        <TabsContent value="rates" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display">WHT Rate Reference</CardTitle>
              <CardDescription>
                Withholding tax rates by payment type and recipient category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment Type</TableHead>
                    <TableHead className="text-center">Corporate</TableHead>
                    <TableHead className="text-center">Individual</TableHead>
                    <TableHead className="text-center">Non-Resident</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {WHT_RATE_CONFIG.map((config) => (
                    <TableRow key={config.type}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{config.label}</p>
                          <p className="text-xs text-muted-foreground">{config.description}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {(config.corporateRate * 100).toFixed(0)}%
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {(config.individualRate * 100).toFixed(0)}%
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {(config.nonResidentRate * 100).toFixed(0)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Transaction Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add WHT Transaction</DialogTitle>
            <DialogDescription>
              Record a payment where withholding tax was deducted
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Type</Label>
                <Select
                  value={form.paymentType}
                  onValueChange={(v) => setForm({ ...form, paymentType: v as WHTPaymentType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WHT_RATE_CONFIG.map((config) => (
                      <SelectItem key={config.type} value={config.type}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Recipient Type</Label>
                <Select
                  value={form.recipientType}
                  onValueChange={(v) => setForm({ ...form, recipientType: v as RecipientType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="corporate">Corporate Entity</SelectItem>
                    <SelectItem value="non_resident">Non-Resident</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Recipient Name</Label>
              <Input
                placeholder="Enter recipient name"
                value={form.recipientName}
                onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Recipient TIN (Optional)</Label>
                <Input
                  placeholder="Tax Identification Number"
                  value={form.recipientTIN}
                  onChange={(e) => setForm({ ...form, recipientTIN: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Date</Label>
                <Input
                  type="date"
                  value={form.paymentDate}
                  onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gross Amount (₦)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={form.grossAmount}
                onChange={(e) => setForm({ ...form, grossAmount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Input
                placeholder="Brief description of payment"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Preview */}
            {previewAmount > 0 && (
              <div className="p-4 bg-secondary rounded-lg space-y-2">
                <p className="text-sm font-medium">WHT Calculation Preview</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Rate</p>
                    <p className="font-bold">{(currentRate * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">WHT Amount</p>
                    <p className="font-bold text-primary">{formatCurrency(previewWHT)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Net Payment</p>
                    <p className="font-bold">{formatCurrency(previewNet)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTransaction}>Add Transaction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </SubscriptionGate>
  );
};

export default WHTManagementPage;
