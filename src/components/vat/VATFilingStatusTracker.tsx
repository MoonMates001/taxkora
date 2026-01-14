import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Clock, AlertCircle, FileText, CreditCard, Edit2 } from "lucide-react";
import { format, addDays, endOfMonth } from "date-fns";
import { useVATFilingStatus, VATFilingStatus } from "@/hooks/useVATFilingStatus";
import { toast } from "sonner";

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

interface Props {
  selectedYear: number;
  selectedMonth: number;
  netVATPayable: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const VATFilingStatusTracker = ({ selectedYear, selectedMonth, netVATPayable }: Props) => {
  const { filingStatuses, upsertStatus, getStatusForMonth } = useVATFilingStatus(selectedYear);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMonth, setEditingMonth] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    status: "pending" as "pending" | "filed" | "paid",
    filedDate: "",
    paymentDate: "",
    paymentReference: "",
    paymentAmount: 0,
    notes: "",
  });

  const currentMonth = new Date().getMonth() + 1;
  const filingDeadline = addDays(endOfMonth(new Date(selectedYear, selectedMonth - 1)), 21);
  const isOverdue = new Date() > filingDeadline;

  const status = getStatusForMonth(selectedYear, selectedMonth);

  const handleOpenDialog = (month: number = selectedMonth) => {
    const existingStatus = getStatusForMonth(selectedYear, month);
    setEditingMonth(month);
    
    if (existingStatus) {
      setFormData({
        status: existingStatus.status,
        filedDate: existingStatus.filedDate || "",
        paymentDate: existingStatus.paymentDate || "",
        paymentReference: existingStatus.paymentReference || "",
        paymentAmount: existingStatus.paymentAmount || netVATPayable,
        notes: existingStatus.notes || "",
      });
    } else {
      setFormData({
        status: "pending",
        filedDate: "",
        paymentDate: "",
        paymentReference: "",
        paymentAmount: netVATPayable,
        notes: "",
      });
    }
    
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingMonth) return;

    upsertStatus.mutate({
      year: selectedYear,
      month: editingMonth,
      status: formData.status,
      filedDate: formData.filedDate || undefined,
      paymentDate: formData.paymentDate || undefined,
      paymentReference: formData.paymentReference || undefined,
      paymentAmount: formData.paymentAmount || undefined,
      notes: formData.notes || undefined,
    });
    
    setIsDialogOpen(false);
  };

  const getStatusIcon = (s: VATFilingStatus["status"]) => {
    switch (s) {
      case "paid":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "filed":
        return <FileText className="w-5 h-5 text-blue-600" />;
      default:
        return isOverdue ? (
          <AlertCircle className="w-5 h-5 text-destructive" />
        ) : (
          <Clock className="w-5 h-5 text-amber-600" />
        );
    }
  };

  const getStatusBadge = (s: VATFilingStatus["status"]) => {
    switch (s) {
      case "paid":
        return <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>;
      case "filed":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Filed</Badge>;
      default:
        return isOverdue ? (
          <Badge variant="destructive">Overdue</Badge>
        ) : (
          <Badge className="bg-amber-500 hover:bg-amber-600">Pending</Badge>
        );
    }
  };

  const monthName = MONTHS.find(m => m.value === selectedMonth)?.label;

  return (
    <>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Filing Status Tracker
          </CardTitle>
          <CardDescription>
            Track your VAT filing and payment status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Month Status */}
          <div className={`p-4 rounded-xl border-2 ${
            status?.status === "paid" ? "border-green-500 bg-green-50" :
            status?.status === "filed" ? "border-blue-500 bg-blue-50" :
            isOverdue ? "border-destructive bg-destructive/5" :
            "border-amber-500 bg-amber-50"
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(status?.status || "pending")}
                <div>
                  <p className="font-medium">{monthName} {selectedYear}</p>
                  <p className="text-sm text-muted-foreground">
                    Due: {format(filingDeadline, "dd MMM yyyy")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(status?.status || "pending")}
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleOpenDialog(selectedMonth)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {status && (
              <div className="mt-3 pt-3 border-t space-y-1 text-sm">
                {status.filedDate && (
                  <p><span className="text-muted-foreground">Filed:</span> {format(new Date(status.filedDate), "dd MMM yyyy")}</p>
                )}
                {status.paymentDate && (
                  <p><span className="text-muted-foreground">Paid:</span> {format(new Date(status.paymentDate), "dd MMM yyyy")}</p>
                )}
                {status.paymentReference && (
                  <p><span className="text-muted-foreground">Reference:</span> {status.paymentReference}</p>
                )}
                {status.paymentAmount && (
                  <p><span className="text-muted-foreground">Amount:</span> {formatCurrency(status.paymentAmount)}</p>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            {(!status || status.status === "pending") && (
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setFormData(prev => ({ ...prev, status: "filed", filedDate: new Date().toISOString().split("T")[0] }));
                  handleOpenDialog();
                }}
              >
                <FileText className="w-4 h-4 mr-2" />
                Mark as Filed
              </Button>
            )}
            {status?.status !== "paid" && (
              <Button 
                className="flex-1"
                onClick={() => {
                  setFormData(prev => ({ 
                    ...prev, 
                    status: "paid", 
                    filedDate: prev.filedDate || new Date().toISOString().split("T")[0],
                    paymentDate: new Date().toISOString().split("T")[0] 
                  }));
                  handleOpenDialog();
                }}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
            )}
          </div>

          {/* Year Overview */}
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-3">Year Overview - {selectedYear}</p>
            <div className="grid grid-cols-6 gap-2">
              {MONTHS.map((month) => {
                const monthStatus = getStatusForMonth(selectedYear, month.value);
                const monthDeadline = addDays(endOfMonth(new Date(selectedYear, month.value - 1)), 21);
                const monthOverdue = new Date() > monthDeadline && month.value <= currentMonth;
                
                return (
                  <button
                    key={month.value}
                    onClick={() => handleOpenDialog(month.value)}
                    className={`p-2 rounded-lg text-center transition-colors ${
                      monthStatus?.status === "paid" ? "bg-green-100 hover:bg-green-200 text-green-700" :
                      monthStatus?.status === "filed" ? "bg-blue-100 hover:bg-blue-200 text-blue-700" :
                      monthOverdue ? "bg-red-100 hover:bg-red-200 text-red-700" :
                      month.value > currentMonth ? "bg-muted/50 text-muted-foreground" :
                      "bg-amber-100 hover:bg-amber-200 text-amber-700"
                    }`}
                  >
                    <span className="text-xs font-medium">{month.label.slice(0, 3)}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-center gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-green-100" /> Paid
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-blue-100" /> Filed
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-amber-100" /> Pending
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-red-100" /> Overdue
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Status Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Update Filing Status - {MONTHS.find(m => m.value === editingMonth)?.label} {selectedYear}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v as "pending" | "filed" | "paid" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="filed">Filed</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.status === "filed" || formData.status === "paid") && (
              <div className="space-y-2">
                <Label>Filed Date</Label>
                <Input
                  type="date"
                  value={formData.filedDate}
                  onChange={(e) => setFormData({ ...formData, filedDate: e.target.value })}
                />
              </div>
            )}

            {formData.status === "paid" && (
              <>
                <div className="space-y-2">
                  <Label>Payment Date</Label>
                  <Input
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Reference</Label>
                  <Input
                    placeholder="e.g., TRN-123456"
                    value={formData.paymentReference}
                    onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Amount (₦)</Label>
                  <Input
                    type="number"
                    value={formData.paymentAmount}
                    onChange={(e) => setFormData({ ...formData, paymentAmount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Any additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={upsertStatus.isPending}>
              {upsertStatus.isPending ? "Saving..." : "Save Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VATFilingStatusTracker;
