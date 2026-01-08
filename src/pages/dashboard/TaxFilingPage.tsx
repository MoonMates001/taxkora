import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIncome } from "@/hooks/useIncome";
import { useExpenses } from "@/hooks/useExpenses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

// Nigerian Tax Constants
const VAT_RATE = 0.075;
const WHT_RATE = 0.10;

const PIT_BRACKETS = [
  { min: 0, max: 300000, rate: 0.07 },
  { min: 300000, max: 600000, rate: 0.11 },
  { min: 600000, max: 1100000, rate: 0.15 },
  { min: 1100000, max: 1600000, rate: 0.19 },
  { min: 1600000, max: 3200000, rate: 0.21 },
  { min: 3200000, max: Infinity, rate: 0.24 },
];

const calculatePIT = (taxableIncome: number): number => {
  let tax = 0;
  let remaining = taxableIncome;

  for (const bracket of PIT_BRACKETS) {
    const bracketSize = bracket.max - bracket.min;
    const taxableInBracket = Math.min(remaining, bracketSize);
    if (taxableInBracket <= 0) break;
    tax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
  }

  return tax;
};

const calculateCIT = (taxableIncome: number, grossIncome: number) => {
  if (grossIncome <= 25000000) {
    return { rate: 0, tax: 0, category: "Small Company" };
  } else if (grossIncome <= 100000000) {
    return { rate: 0.20, tax: taxableIncome * 0.20, category: "Medium Company" };
  } else {
    return { rate: 0.30, tax: taxableIncome * 0.30, category: "Large Company" };
  }
};

const TaxFilingPage = () => {
  const { profile } = useAuth();
  const { incomeRecords, totalIncome } = useIncome();
  const { expenses, totalExpenses } = useExpenses();
  const isBusinessAccount = profile?.account_type === "business";
  
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const years = [currentYear, currentYear - 1, currentYear - 2];

  // Filter records by selected year
  const yearlyIncome = useMemo(() => {
    return incomeRecords.filter((r) => {
      const year = new Date(r.date).getFullYear();
      return year === parseInt(selectedYear);
    });
  }, [incomeRecords, selectedYear]);

  const yearlyExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const year = new Date(e.date).getFullYear();
      return year === parseInt(selectedYear);
    });
  }, [expenses, selectedYear]);

  const yearlyTotalIncome = yearlyIncome.reduce((sum, r) => sum + Number(r.amount), 0);
  const yearlyTotalExpenses = yearlyExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const taxComputation = useMemo(() => {
    const grossIncome = yearlyTotalIncome;
    const deductions = yearlyTotalExpenses;
    const taxableIncome = Math.max(0, grossIncome - deductions);

    const vatOnIncome = isBusinessAccount ? grossIncome * VAT_RATE : 0;

    const professionalServicesIncome = yearlyIncome
      .filter((r) => r.category === "consulting" || r.category === "services")
      .reduce((sum, r) => sum + Number(r.amount), 0);
    const whtDeducted = professionalServicesIncome * WHT_RATE;

    let mainTax = 0;
    let taxRate = 0;
    let companyCategory = "";

    if (isBusinessAccount) {
      const cit = calculateCIT(taxableIncome, grossIncome);
      mainTax = cit.tax;
      taxRate = cit.rate * 100;
      companyCategory = cit.category;
    } else {
      mainTax = calculatePIT(taxableIncome);
      taxRate = taxableIncome > 0 ? (mainTax / taxableIncome) * 100 : 0;
    }

    const netTaxPayable = Math.max(0, mainTax - whtDeducted);

    return {
      grossIncome,
      deductions,
      taxableIncome,
      vatOnIncome,
      whtDeducted,
      mainTax,
      taxRate,
      netTaxPayable,
      companyCategory,
      effectiveRate: grossIncome > 0 ? (netTaxPayable / grossIncome) * 100 : 0,
    };
  }, [yearlyTotalIncome, yearlyTotalExpenses, yearlyIncome, isBusinessAccount]);

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

  const hasData = yearlyTotalIncome > 0 || yearlyTotalExpenses > 0;

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(0, 128, 128);
    doc.rect(0, 0, pageWidth, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("TAX RETURN REPORT", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Tax Year: ${selectedYear}`, pageWidth / 2, 30, { align: "center" });

    // Taxpayer Information
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("TAXPAYER INFORMATION", 14, 55);

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

    let yPos = 62;
    taxpayerInfo.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, 14, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(value, 50, yPos);
      yPos += 7;
    });

    // Income Summary Table
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("INCOME SUMMARY", 14, yPos);

    const incomeByCategory: Record<string, number> = {};
    yearlyIncome.forEach((r) => {
      const category = r.category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      incomeByCategory[category] = (incomeByCategory[category] || 0) + Number(r.amount);
    });

    const incomeData = Object.entries(incomeByCategory).map(([category, amount]) => [
      category,
      formatCurrencyPlain(amount),
    ]);
    incomeData.push(["Total Income", formatCurrencyPlain(yearlyTotalIncome)]);

    autoTable(doc, {
      startY: yPos + 5,
      head: [["Category", "Amount"]],
      body: incomeData,
      theme: "striped",
      headStyles: { fillColor: [0, 128, 128] },
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold" },
    });

    // Expenses/Deductions Summary Table
    yPos = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(isBusinessAccount ? "EXPENSES SUMMARY" : "DEDUCTIONS SUMMARY", 14, yPos);

    const expensesByCategory: Record<string, number> = {};
    yearlyExpenses.forEach((e) => {
      const category = e.category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      expensesByCategory[category] = (expensesByCategory[category] || 0) + Number(e.amount);
    });

    const expenseData = Object.entries(expensesByCategory).map(([category, amount]) => [
      category,
      formatCurrencyPlain(amount),
    ]);
    expenseData.push(["Total Deductions", formatCurrencyPlain(yearlyTotalExpenses)]);

    autoTable(doc, {
      startY: yPos + 5,
      head: [["Category", "Amount"]],
      body: expenseData,
      theme: "striped",
      headStyles: { fillColor: [0, 128, 128] },
    });

    // Tax Computation
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("TAX COMPUTATION", 14, yPos);

    const taxData = [
      ["Gross Income", formatCurrencyPlain(taxComputation.grossIncome)],
      ["Less: Allowable Deductions", `(${formatCurrencyPlain(taxComputation.deductions)})`],
      ["Taxable Income", formatCurrencyPlain(taxComputation.taxableIncome)],
      ["", ""],
      [isBusinessAccount ? `Companies Income Tax (${taxComputation.companyCategory})` : "Personal Income Tax (PIT)", formatCurrencyPlain(taxComputation.mainTax)],
    ];

    if (isBusinessAccount) {
      taxData.push(["Value Added Tax (VAT @ 7.5%)", formatCurrencyPlain(taxComputation.vatOnIncome)]);
    }

    if (taxComputation.whtDeducted > 0) {
      taxData.push(["Less: WHT Credit", `(${formatCurrencyPlain(taxComputation.whtDeducted)})`]);
    }

    taxData.push(["", ""]);
    taxData.push(["NET TAX PAYABLE", formatCurrencyPlain(taxComputation.netTaxPayable)]);
    taxData.push(["Effective Tax Rate", `${taxComputation.effectiveRate.toFixed(2)}%`]);

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
        if (data.row.index === taxData.length - 2 && data.section === "body") {
          data.cell.styles.fillColor = [255, 237, 213];
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    
    if (finalY < 250) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 100, 100);
      doc.text("This report is generated for informational purposes. Please consult with a tax", 14, finalY);
      doc.text("professional before filing. For official filing, submit to the Federal Inland Revenue Service (FIRS).", 14, finalY + 5);
      
      doc.setFont("helvetica", "normal");
      doc.text(`Generated by TAXKORA on ${new Date().toLocaleString("en-NG")}`, 14, finalY + 15);
    }

    // Save the PDF
    const fileName = `Tax_Return_${selectedYear}_${profile?.full_name?.replace(/\s+/g, "_") || "Report"}.pdf`;
    doc.save(fileName);
    toast.success("Tax report downloaded successfully!");
  };

  const filingSteps = [
    {
      step: 1,
      title: "Review Your Data",
      description: "Ensure all income and expenses are accurately recorded",
      status: hasData ? "completed" : "pending",
    },
    {
      step: 2,
      title: "Verify Tax Computation",
      description: "Check the computed tax amount and breakdown",
      status: hasData ? "completed" : "pending",
    },
    {
      step: 3,
      title: "Generate Tax Returns",
      description: "Create and download the official tax return documents",
      status: "in-progress",
    },
    {
      step: 4,
      title: "Submit to FIRS",
      description: "File your tax returns directly with the Federal Inland Revenue Service",
      status: "pending",
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Tax Filing</h1>
          <p className="text-muted-foreground mt-1">
            {isBusinessAccount
              ? "Generate and submit your business tax returns to FIRS"
              : "Generate your personal income tax report for filing"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
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
                Filing deadline: March 31, {parseInt(selectedYear) + 1}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    hasData
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {hasData ? "Ready to Generate" : "No Records Found"}
                </span>
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

      {/* Tax Summary Preview */}
      {hasData && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Tax Summary for {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Gross Income</p>
                <p className="font-display text-xl font-bold text-green-600">
                  {formatCurrency(taxComputation.grossIncome)}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Deductions</p>
                <p className="font-display text-xl font-bold text-red-500">
                  {formatCurrency(taxComputation.deductions)}
                </p>
              </div>
              <div className="p-4 bg-teal-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Taxable Income</p>
                <p className="font-display text-xl font-bold text-primary">
                  {formatCurrency(taxComputation.taxableIncome)}
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Tax Payable</p>
                <p className="font-display text-xl font-bold text-orange-500">
                  {formatCurrency(taxComputation.netTaxPayable)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filing Steps */}
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
                        ? "bg-coral-400/10 text-accent"
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

      {/* Generate Report */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display">Generate Tax Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">
              {hasData ? "Your tax report is ready" : "No data available"}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              {hasData
                ? `Download your ${selectedYear} tax return report in PDF format. This report can be used for filing with FIRS.`
                : `Add income and ${isBusinessAccount ? "expense" : "expenditure"} records for ${selectedYear} to generate your tax report.`}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="gap-2"
                onClick={generatePDF}
                disabled={!hasData}
              >
                <Download className="w-4 h-4" />
                Download PDF Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="shadow-card bg-coral-400/5 border-accent/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Send className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                Ready to file with FIRS?
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                After downloading your tax report, you can file directly with the Federal Inland Revenue Service (FIRS) 
                through their online portal or at any FIRS tax office. Need assistance? Our tax experts are available 
                to help you through the filing process.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="accent" asChild>
                  <a href="https://taxpromax.firs.gov.ng" target="_blank" rel="noopener noreferrer">
                    Visit FIRS Portal
                  </a>
                </Button>
                <Button variant="outline">Contact Tax Expert</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxFilingPage;
