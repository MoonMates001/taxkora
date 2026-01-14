import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIncome } from "@/hooks/useIncome";
import { useStatutoryDeductions } from "@/hooks/useStatutoryDeductions";
import { useTaxPayments, PAYMENT_TYPES, PAYMENT_STATUSES } from "@/hooks/useTaxPayments";
import { useDeductionDocuments, DOCUMENT_TYPES } from "@/hooks/useDeductionDocuments";
import { computeTax2026, PIT_BRACKETS_2026, TAX_EXEMPT_THRESHOLD } from "@/lib/taxEngine2026";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Send,
  FileCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  Building2,
  User,
  Plus,
  Trash2,
  Upload,
  File,
  Wallet,
  CreditCard,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { TaxPaymentDialog } from "@/components/tax/TaxPaymentDialog";
import { DocumentUploadDialog } from "@/components/tax/DocumentUploadDialog";
import { format } from "date-fns";
import SubscriptionGate from "@/components/subscription/SubscriptionGate";

const TaxFilingPage = () => {
  const { profile } = useAuth();
  const { incomeRecords } = useIncome();
  const isBusinessAccount = profile?.account_type === "business";

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Hooks
  const { deductions } = useStatutoryDeductions(selectedYear);
  const { payments, deletePayment, totalPaid, confirmedTotal } = useTaxPayments(selectedYear);
  const { documents, deleteDocument } = useDeductionDocuments(selectedYear);

  // Dialog states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<typeof payments[0] | null>(null);

  // Filter income by selected year
  const yearlyIncome = useMemo(() => {
    return incomeRecords
      .filter((record) => new Date(record.date).getFullYear() === selectedYear)
      .reduce((sum, record) => sum + Number(record.amount), 0);
  }, [incomeRecords, selectedYear]);

  // Income by category for the report
  const incomeByCategory = useMemo(() => {
    const categories: Record<string, number> = {};
    incomeRecords
      .filter((record) => new Date(record.date).getFullYear() === selectedYear)
      .forEach((record) => {
        const category = record.category
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
        categories[category] = (categories[category] || 0) + Number(record.amount);
      });
    return categories;
  }, [incomeRecords, selectedYear]);

  // Compute tax using 2026 rules
  const taxComputation = useMemo(() => {
    return computeTax2026(yearlyIncome, {
      pension_contribution: deductions.pension_contribution,
      nhis_contribution: deductions.nhis_contribution,
      nhf_contribution: deductions.nhf_contribution,
      housing_loan_interest: deductions.housing_loan_interest,
      life_insurance_premium: deductions.life_insurance_premium,
      annual_rent_paid: deductions.annual_rent_paid,
      employment_compensation: deductions.employment_compensation,
      gifts_received: deductions.gifts_received,
      pension_benefits_received: deductions.pension_benefits_received,
    });
  }, [yearlyIncome, deductions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyPlain = (amount: number) => {
    return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const hasData = yearlyIncome > 0;
  const balanceOwed = Math.max(0, taxComputation.netTaxPayable - confirmedTotal);

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(0, 128, 128);
    doc.rect(0, 0, pageWidth, 45, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("TAX RETURN REPORT", pageWidth / 2, 18, { align: "center" });

    doc.setFontSize(14);
    doc.text("Nigeria Tax Act 2026", pageWidth / 2, 28, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Tax Year: ${selectedYear}`, pageWidth / 2, 38, { align: "center" });

    // Taxpayer Information
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("TAXPAYER INFORMATION", 14, 58);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const taxpayerInfo = [
      ["Name:", profile?.full_name || "N/A"],
      ["Account Type:", isBusinessAccount ? "Business" : "Personal"],
      ["Business Name:", isBusinessAccount ? (profile?.business_name || "N/A") : "N/A"],
      ["Email:", profile?.email || "N/A"],
      ["Phone:", profile?.phone || "N/A"],
      ["Report Generated:", new Date().toLocaleDateString("en-NG")],
    ];

    let yPos = 65;
    taxpayerInfo.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, 14, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(value, 55, yPos);
      yPos += 7;
    });

    // Income Summary Table
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("INCOME SUMMARY", 14, yPos);

    const incomeData = Object.entries(incomeByCategory).map(([category, amount]) => [
      category,
      formatCurrencyPlain(amount),
    ]);
    incomeData.push(["Total Gross Income", formatCurrencyPlain(yearlyIncome)]);

    autoTable(doc, {
      startY: yPos + 5,
      head: [["Category", "Amount"]],
      body: incomeData,
      theme: "striped",
      headStyles: { fillColor: [0, 128, 128] },
    });

    // Statutory Deductions Table
    yPos = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("STATUTORY DEDUCTIONS (Nigeria Tax Act 2026)", 14, yPos);

    const deductionData = [
      ["Pension Contribution (PFA)", formatCurrencyPlain(taxComputation.deductionBreakdown.pension)],
      ["NHIS Contribution", formatCurrencyPlain(taxComputation.deductionBreakdown.nhis)],
      ["NHF Contribution", formatCurrencyPlain(taxComputation.deductionBreakdown.nhf)],
      ["Housing Loan Interest", formatCurrencyPlain(taxComputation.deductionBreakdown.housingLoanInterest)],
      ["Life Insurance Premium", formatCurrencyPlain(taxComputation.deductionBreakdown.lifeInsurance)],
      ["Rent Relief (20%, max ₦500,000)", formatCurrencyPlain(taxComputation.deductionBreakdown.rentRelief)],
      ["Total Deductions", formatCurrencyPlain(taxComputation.totalDeductions)],
    ];

    autoTable(doc, {
      startY: yPos + 5,
      head: [["Deduction Type", "Amount"]],
      body: deductionData,
      theme: "striped",
      headStyles: { fillColor: [0, 128, 128] },
    });

    // Tax Computation
    yPos = (doc as any).lastAutoTable.finalY + 15;

    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("TAX COMPUTATION", 14, yPos);

    const taxData = [
      ["Gross Income", formatCurrencyPlain(taxComputation.grossIncome)],
      ["Less: Exempt Income", `(${formatCurrencyPlain(taxComputation.exemptIncome)})`],
      ["Taxable Gross Income", formatCurrencyPlain(taxComputation.taxableGrossIncome)],
      ["Less: Statutory Deductions", `(${formatCurrencyPlain(taxComputation.totalDeductions)})`],
      ["Taxable Income", formatCurrencyPlain(taxComputation.taxableIncome)],
      ["", ""],
    ];

    // Add tax bracket breakdown
    if (taxComputation.taxableIncome > TAX_EXEMPT_THRESHOLD) {
      taxComputation.taxByBracket.forEach((bracket) => {
        if (bracket.income > 0) {
          taxData.push([
            `Tax on ${bracket.bracket} @ ${bracket.rate}%`,
            formatCurrencyPlain(bracket.tax),
          ]);
        }
      });
    } else {
      taxData.push(["Tax Exempt (Income ≤ ₦800,000)", "₦0.00"]);
    }

    taxData.push(["", ""]);
    taxData.push(["TOTAL TAX PAYABLE", formatCurrencyPlain(taxComputation.netTaxPayable)]);
    taxData.push(["Effective Tax Rate", `${taxComputation.effectiveRate.toFixed(2)}%`]);

    // Add payment status
    if (confirmedTotal > 0) {
      taxData.push(["", ""]);
      taxData.push(["Less: Confirmed Payments", `(${formatCurrencyPlain(confirmedTotal)})`]);
      taxData.push(["BALANCE OWED", formatCurrencyPlain(balanceOwed)]);
    }

    autoTable(doc, {
      startY: yPos + 5,
      head: [["Description", "Amount (NGN)"]],
      body: taxData,
      theme: "plain",
      headStyles: { fillColor: [0, 128, 128], textColor: [255, 255, 255] },
      styles: { cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: "bold" },
        1: { halign: "right" },
      },
      didParseCell: (data) => {
        const rowIndex = data.row.index;
        if (data.section === "body") {
          const cellText = String(taxData[rowIndex]?.[0] || "");
          if (cellText === "TOTAL TAX PAYABLE" || cellText === "BALANCE OWED") {
            data.cell.styles.fillColor = [255, 237, 213];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    // Supporting Documents Section
    if (documents.length > 0) {
      yPos = (doc as any).lastAutoTable.finalY + 15;

      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("SUPPORTING DOCUMENTS", 14, yPos);

      const documentData = documents.map((doc, index) => [
        (index + 1).toString(),
        getDocumentTypeLabel(doc.document_type),
        doc.file_name,
        doc.description || "—",
        format(new Date(doc.created_at), "MMM d, yyyy"),
      ]);

      autoTable(doc, {
        startY: yPos + 5,
        head: [["#", "Document Type", "File Name", "Description", "Date Uploaded"]],
        body: documentData,
        theme: "striped",
        headStyles: { fillColor: [0, 128, 128] },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 35 },
          2: { cellWidth: 50 },
          3: { cellWidth: 50 },
          4: { cellWidth: 30 },
        },
      });

      // Note about document access
      yPos = (doc as any).lastAutoTable.finalY + 8;
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 100, 100);
      doc.text(
        "Note: Original documents are stored digitally and available upon request.",
        14,
        yPos
      );
      doc.text(
        `Total supporting documents: ${documents.length}`,
        14,
        yPos + 5
      );
    }

    // Payment History Section
    if (payments.length > 0) {
      yPos = (doc as any).lastAutoTable?.finalY + 15 || yPos + 15;

      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("PAYMENT HISTORY", 14, yPos);

      const paymentData = payments.map((payment) => [
        format(new Date(payment.payment_date), "MMM d, yyyy"),
        getPaymentTypeLabel(payment.payment_type),
        formatCurrencyPlain(payment.amount),
        payment.payment_reference || "—",
        payment.status.charAt(0).toUpperCase() + payment.status.slice(1),
      ]);

      autoTable(doc, {
        startY: yPos + 5,
        head: [["Date", "Type", "Amount", "Reference", "Status"]],
        body: paymentData,
        theme: "striped",
        headStyles: { fillColor: [0, 128, 128] },
      });
    }

    // Footer
    const finalY = (doc as any).lastAutoTable?.finalY + 20 || 260;

    if (finalY < 250) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 100, 100);
      doc.text(
        "This report is generated based on Nigeria Tax Act 2026 provisions.",
        14,
        finalY
      );
      doc.text(
        "For official filing, submit to the Federal Inland Revenue Service (FIRS) or relevant State Revenue Service (NRS).",
        14,
        finalY + 5
      );

      doc.setFont("helvetica", "normal");
      doc.text(
        `Generated by TAXKORA on ${new Date().toLocaleString("en-NG")}`,
        14,
        finalY + 15
      );
    }

    // Save the PDF
    const fileName = `Tax_Return_${selectedYear}_${profile?.full_name?.replace(/\s+/g, "_") || "Report"}.pdf`;
    doc.save(fileName);
    toast.success("Tax report downloaded successfully!");
  };

  const filingSteps = [
    {
      step: 1,
      title: "Record Income & Deductions",
      description: "Enter all income sources and statutory deductions",
      status: hasData ? "completed" : "pending",
    },
    {
      step: 2,
      title: "Upload Supporting Documents",
      description: "Attach receipts and statements for deduction claims",
      status: documents.length > 0 ? "completed" : "pending",
    },
    {
      step: 3,
      title: "Generate Tax Report",
      description: "Download your official tax return document",
      status: "in-progress",
    },
    {
      step: 4,
      title: "Make Tax Payments",
      description: "Pay and record your tax obligations to FIRS/NRS",
      status: payments.length > 0 ? "completed" : "pending",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-accent" />;
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    return PAYMENT_TYPES.find((t) => t.value === type)?.label || type;
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = PAYMENT_STATUSES.find((s) => s.value === status);
    return (
      <Badge className={statusInfo?.color || "bg-gray-100 text-gray-800"}>
        {statusInfo?.label || status}
      </Badge>
    );
  };

  const getDocumentTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find((t) => t.value === type)?.label || type;
  };

  return (
    <SubscriptionGate feature="Tax Filing & Reports">
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Tax Filing</h1>
          <p className="text-muted-foreground mt-1">
            Nigeria Tax Act 2026 - Generate reports and track payments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedYear.toString()}
            onValueChange={(v) => setSelectedYear(parseInt(v))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Year" />
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

      {/* Filing Status */}
      <Card className="shadow-card border-2 border-primary">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-xl text-foreground">
                {selectedYear} Tax Year
              </h3>
              <p className="text-muted-foreground">
                Filing deadline: March 31, {selectedYear + 1}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    hasData ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {hasData ? "Ready to File" : "No Records"}
                </span>
                {taxComputation.isExempt && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Tax Exempt
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isBusinessAccount ? (
                <Building2 className="w-5 h-5 text-primary" />
              ) : (
                <User className="w-5 h-5 text-accent" />
              )}
              <span className="text-sm font-medium">
                {isBusinessAccount ? "Business" : "Personal"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Summary */}
      {hasData && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Taxable Income</p>
              <p className="font-display text-xl font-bold text-foreground">
                {formatCurrency(taxComputation.taxableIncome)}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Tax Payable</p>
              <p className="font-display text-xl font-bold text-orange-500">
                {formatCurrency(taxComputation.netTaxPayable)}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Paid (Confirmed)</p>
              <p className="font-display text-xl font-bold text-green-600">
                {formatCurrency(confirmedTotal)}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-2 border-orange-200">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Balance Owed</p>
              <p className="font-display text-xl font-bold text-orange-500">
                {formatCurrency(balanceOwed)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="report">Generate Report</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display">Filing Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filingSteps.map((step, index) => (
                  <div key={step.step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          step.status === "completed"
                            ? "bg-green-100 text-green-600"
                            : step.status === "in-progress"
                            ? "bg-orange-100 text-orange-600"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {step.step}
                      </div>
                      {index < filingSteps.length - 1 && (
                        <div className="w-0.5 h-12 bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">{step.title}</h4>
                          <p className="text-muted-foreground text-sm">{step.description}</p>
                        </div>
                        {getStatusIcon(step.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-display flex items-center gap-2">
                  <File className="w-5 h-5 text-primary" />
                  Supporting Documents
                </CardTitle>
                <CardDescription>
                  Upload receipts and statements to support your deduction claims
                </CardDescription>
              </div>
              <Button onClick={() => setDocumentDialogOpen(true)} className="gap-2">
                <Upload className="w-4 h-4" />
                Upload Document
              </Button>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <File className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No documents uploaded for {selectedYear}</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setDocumentDialogOpen(true)}
                  >
                    Upload Your First Document
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Type</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">
                          {getDocumentTypeLabel(doc.document_type)}
                        </TableCell>
                        <TableCell>
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            <File className="w-3 h-3" />
                            {doc.file_name}
                          </a>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {doc.description || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(doc.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteDocument.mutate(doc)}
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
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-display flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Tax Payments
                </CardTitle>
                <CardDescription>
                  Record and track your tax payments to FIRS/NRS
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  setEditingPayment(null);
                  setPaymentDialogOpen(true);
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Record Payment
              </Button>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-12">
                  <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No payments recorded for {selectedYear}</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setPaymentDialogOpen(true)}
                  >
                    Record Your First Payment
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {format(new Date(payment.payment_date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="font-medium">
                          {getPaymentTypeLabel(payment.payment_type)}
                        </TableCell>
                        <TableCell className="font-bold">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {payment.payment_reference || "—"}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deletePayment.mutate(payment.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Payment Summary */}
              {payments.length > 0 && (
                <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
                  <div className="grid sm:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Paid</p>
                      <p className="font-display text-lg font-bold">{formatCurrency(totalPaid)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Confirmed</p>
                      <p className="font-display text-lg font-bold text-green-600">
                        {formatCurrency(confirmedTotal)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Confirmation</p>
                      <p className="font-display text-lg font-bold text-yellow-600">
                        {formatCurrency(totalPaid - confirmedTotal)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report Tab */}
        <TabsContent value="report" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Generate Tax Report
              </CardTitle>
              <CardDescription>
                Download your official tax return document for filing with FIRS/NRS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Preview */}
              <div className="p-6 bg-secondary/30 rounded-lg space-y-4">
                <h4 className="font-semibold">Report Summary</h4>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Gross Income</span>
                    <span className="font-medium">{formatCurrency(taxComputation.grossIncome)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Exempt Income</span>
                    <span className="font-medium">{formatCurrency(taxComputation.exemptIncome)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Statutory Deductions</span>
                    <span className="font-medium">{formatCurrency(taxComputation.totalDeductions)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Taxable Income</span>
                    <span className="font-medium">{formatCurrency(taxComputation.taxableIncome)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Tax Payable</span>
                    <span className="font-bold text-orange-500">
                      {formatCurrency(taxComputation.netTaxPayable)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Effective Rate</span>
                    <span className="font-medium">{taxComputation.effectiveRate.toFixed(2)}%</span>
                  </div>
                </div>

                {taxComputation.isExempt && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Tax Exempt</p>
                      <p className="text-sm text-green-700">{taxComputation.exemptionReason}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Download Button */}
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={generatePDF}
                  disabled={!hasData}
                  className="gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Tax Report (PDF)
                </Button>
              </div>

              {!hasData && (
                <p className="text-center text-sm text-muted-foreground">
                  Add income records to generate your tax report
                </p>
              )}
            </CardContent>
          </Card>

          {/* Filing Instructions */}
          <Card className="shadow-card bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="font-display text-blue-800">Filing Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700 space-y-3">
              <div className="flex items-start gap-2">
                <Send className="w-4 h-4 mt-1" />
                <p>
                  Submit your tax return to the{" "}
                  <strong>Federal Inland Revenue Service (FIRS)</strong> or your{" "}
                  <strong>State Internal Revenue Service (SIRS)</strong>
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-1" />
                <p>
                  Filing deadline is <strong>March 31, {selectedYear + 1}</strong> for the{" "}
                  {selectedYear} tax year
                </p>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 mt-1" />
                <p>
                  Keep copies of all supporting documents for at least <strong>6 years</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <TaxPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        year={selectedYear}
        payment={editingPayment}
      />
      <DocumentUploadDialog
        open={documentDialogOpen}
        onOpenChange={setDocumentDialogOpen}
        year={selectedYear}
      />
    </div>
    </SubscriptionGate>
  );
};

export default TaxFilingPage;
