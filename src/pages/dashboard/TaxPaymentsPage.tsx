import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTaxPayments, TaxPaymentInsert, PAYMENT_TYPES, PAYMENT_METHODS, PAYMENT_STATUSES } from "@/hooks/useTaxPayments";
import { useFlutterwavePayment } from "@/hooks/useFlutterwavePayment";
import TaxPaymentReconciliation from "@/components/tax/TaxPaymentReconciliation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Trash2,
  Edit2,
  Receipt,
  CreditCard,
  Calendar,
  FileDown,
  Wallet,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const TaxPaymentsPage = () => {
  const { profile, user } = useAuth();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPayOnlineDialogOpen, setIsPayOnlineDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const { openPaymentPage, isLoading: isPaymentLoading } = useFlutterwavePayment();

  const { payments, isLoading, createPayment, updatePayment, deletePayment, totalPaid, confirmedTotal } = useTaxPayments(selectedYear);

  const [formData, setFormData] = useState<TaxPaymentInsert>({
    year: currentYear,
    amount: 0,
    payment_date: new Date().toISOString().split("T")[0],
    payment_type: "pit",
    payment_reference: "",
    payment_method: "bank_transfer",
    status: "pending",
    notes: "",
  });

  const [onlinePaymentData, setOnlinePaymentData] = useState({
    amount: 0,
    payment_type: "pit",
    description: "",
  });

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleAddPayment = () => {
    setEditingPayment(null);
    setFormData({
      year: selectedYear,
      amount: 0,
      payment_date: new Date().toISOString().split("T")[0],
      payment_type: "pit",
      payment_reference: "",
      payment_method: "bank_transfer",
      status: "pending",
      notes: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditPayment = (payment: any) => {
    setEditingPayment(payment.id);
    setFormData({
      year: payment.year,
      amount: payment.amount,
      payment_date: payment.payment_date,
      payment_type: payment.payment_type,
      payment_reference: payment.payment_reference || "",
      payment_method: payment.payment_method || "bank_transfer",
      status: payment.status,
      notes: payment.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingPayment) {
      updatePayment.mutate({ id: editingPayment, ...formData });
    } else {
      createPayment.mutate(formData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this payment record?")) {
      deletePayment.mutate(id);
    }
  };

  const handlePayOnline = async () => {
    if (!user?.email || !profile?.full_name) {
      return;
    }
    
    const paymentType = PAYMENT_TYPES.find(t => t.value === onlinePaymentData.payment_type);
    
    await openPaymentPage({
      amount: onlinePaymentData.amount,
      email: user.email,
      name: profile.full_name || profile.business_name || "Customer",
      phone: profile.phone || undefined,
      payment_type: "tax_payment",
      description: onlinePaymentData.description || `${paymentType?.label || "Tax"} Payment for ${selectedYear}`,
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Tax Payment History", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`Year: ${selectedYear}`, 20, 35);
    doc.text(`Business: ${profile?.business_name || profile?.full_name || "N/A"}`, 20, 42);
    doc.text(`Generated: ${format(new Date(), "dd MMM yyyy")}`, 20, 49);

    // Summary
    doc.setFontSize(14);
    doc.text("Summary", 20, 65);
    
    autoTable(doc, {
      startY: 70,
      head: [["Description", "Amount"]],
      body: [
        ["Total Payments", formatCurrency(totalPaid)],
        ["Confirmed Payments", formatCurrency(confirmedTotal)],
        ["Pending Payments", formatCurrency(totalPaid - confirmedTotal)],
      ],
      theme: "striped",
    });

    // Payment Details
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(14);
    doc.text("Payment Details", 20, finalY + 15);

    autoTable(doc, {
      startY: finalY + 20,
      head: [["Date", "Type", "Reference", "Method", "Status", "Amount"]],
      body: payments.map(p => [
        format(new Date(p.payment_date), "dd/MM/yyyy"),
        PAYMENT_TYPES.find(t => t.value === p.payment_type)?.label || p.payment_type,
        p.payment_reference || "-",
        PAYMENT_METHODS.find(m => m.value === p.payment_method)?.label || "-",
        p.status,
        formatCurrency(p.amount),
      ]),
      theme: "striped",
    });

    doc.save(`Tax-Payments-${selectedYear}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
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
          <h1 className="font-display text-3xl font-bold text-foreground">Tax Payments</h1>
          <p className="text-muted-foreground mt-1">
            Record and reconcile your tax payments
          </p>
        </div>
        <div className="flex items-center gap-3">
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
          <Button variant="outline" onClick={() => setIsPayOnlineDialogOpen(true)}>
            <Wallet className="w-4 h-4 mr-2" />
            Pay Online
          </Button>
          <Button onClick={handleAddPayment}>
            <Plus className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
                <p className="text-xs text-muted-foreground">{payments.length} payments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Receipt className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(confirmedTotal)}</p>
                <p className="text-xs text-muted-foreground">
                  {payments.filter(p => p.status === "confirmed").length} payments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-600">
                  {formatCurrency(totalPaid - confirmedTotal)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {payments.filter(p => p.status === "pending").length} payments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="reconciliation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="reconciliation">
          <TaxPaymentReconciliation />
        </TabsContent>

        <TabsContent value="history">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                All tax payments recorded for {selectedYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-lg mb-2">No payments recorded</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by recording your tax payments
                  </p>
                  <Button onClick={handleAddPayment}>
                    <Plus className="w-4 h-4 mr-2" />
                    Record First Payment
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => {
                      const statusStyle = PAYMENT_STATUSES.find(s => s.value === payment.status);
                      return (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(payment.payment_date), "dd/MM/yyyy")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {PAYMENT_TYPES.find(t => t.value === payment.payment_type)?.label || payment.payment_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {payment.payment_reference || "-"}
                          </TableCell>
                          <TableCell>
                            {PAYMENT_METHODS.find(m => m.value === payment.payment_method)?.label || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusStyle?.color}>
                              {statusStyle?.label || payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditPayment(payment)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => handleDelete(payment.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Payment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPayment ? "Edit Payment" : "Record Tax Payment"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Type</Label>
                <Select
                  value={formData.payment_type}
                  onValueChange={(v) => setFormData({ ...formData, payment_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Select
                  value={formData.year.toString()}
                  onValueChange={(v) => setFormData({ ...formData, year: parseInt(v) })}
                >
                  <SelectTrigger>
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

            <div className="space-y-2">
              <Label>Amount (₦)</Label>
              <Input
                type="number"
                value={formData.amount || ""}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Date</Label>
                <Input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select
                  value={formData.payment_method || "bank_transfer"}
                  onValueChange={(v) => setFormData({ ...formData, payment_method: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Reference</Label>
              <Input
                value={formData.payment_reference || ""}
                onChange={(e) => setFormData({ ...formData, payment_reference: e.target.value })}
                placeholder="e.g., TRN-123456"
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status || "pending"}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={createPayment.isPending || updatePayment.isPending}>
              {createPayment.isPending || updatePayment.isPending ? "Saving..." : "Save Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pay Online Dialog */}
      <Dialog open={isPayOnlineDialogOpen} onOpenChange={setIsPayOnlineDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Pay Tax Online
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground">
                Make secure tax payments via Flutterwave. Your payment will be automatically recorded upon successful completion.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Payment Type</Label>
              <Select
                value={onlinePaymentData.payment_type}
                onValueChange={(v) => setOnlinePaymentData({ ...onlinePaymentData, payment_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Amount (₦)</Label>
              <Input
                type="number"
                value={onlinePaymentData.amount || ""}
                onChange={(e) => setOnlinePaymentData({ ...onlinePaymentData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="Enter amount to pay"
              />
            </div>

            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Input
                value={onlinePaymentData.description}
                onChange={(e) => setOnlinePaymentData({ ...onlinePaymentData, description: e.target.value })}
                placeholder="e.g., Annual PIT Payment"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPayOnlineDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePayOnline} 
              disabled={isPaymentLoading || !onlinePaymentData.amount || onlinePaymentData.amount <= 0}
            >
              {isPaymentLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Proceed to Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaxPaymentsPage;
