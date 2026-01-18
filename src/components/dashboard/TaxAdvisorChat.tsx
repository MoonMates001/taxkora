import { useState, useRef, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIncome } from "@/hooks/useIncome";
import { useExpenses } from "@/hooks/useExpenses";
import { useStatutoryDeductions } from "@/hooks/useStatutoryDeductions";
import { useTaxPayments } from "@/hooks/useTaxPayments";
import { useCapitalAssets } from "@/hooks/useCapitalAssets";
import { useVATTransactions } from "@/hooks/useVATTransactions";
import { useWHTTransactions } from "@/hooks/useWHTTransactions";
import { useInvoices } from "@/hooks/useInvoices";
import { useClients } from "@/hooks/useClients";
import { analyzeSmartDeductions } from "@/lib/autoDeductions";
import { computeTax2026 } from "@/lib/taxEngine2026";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Bot,
  Send,
  User,
  Loader2,
  RefreshCw,
  Lightbulb,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTED_PROMPTS = [
  "What deductions am I eligible for?",
  "How can I reduce my tax liability?",
  "Explain rent relief calculation",
  "What's my estimated tax for this year?",
  "Analyze my VAT position",
  "Review my WHT obligations",
];

interface TaxAdvisorChatProps {
  selectedYear?: number;
}

const TaxAdvisorChat = ({ selectedYear }: TaxAdvisorChatProps) => {
  const { profile } = useAuth();
  const { incomeRecords } = useIncome();
  const { expenses } = useExpenses();
  const currentYear = selectedYear || new Date().getFullYear();
  const { deductions } = useStatutoryDeductions(currentYear);
  const { payments: taxPayments, confirmedTotal: totalTaxPaid } = useTaxPayments(currentYear);
  const { assets: capitalAssets } = useCapitalAssets();
  const { transactions: vatTransactions } = useVATTransactions(currentYear);
  const { transactions: whtTransactions } = useWHTTransactions(currentYear);
  const { invoices } = useInvoices();
  const { clients } = useClients();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Calculate comprehensive financial context
  const financialContext = useMemo(() => {
    // Filter records by year
    const yearlyIncome = incomeRecords
      .filter((record) => new Date(record.date).getFullYear() === currentYear)
      .reduce((sum, record) => sum + Number(record.amount), 0);

    const yearlyExpenses = expenses
      .filter((e) => new Date(e.date).getFullYear() === currentYear)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    // Income by category
    const incomeByCategory: Record<string, number> = {};
    incomeRecords
      .filter((record) => new Date(record.date).getFullYear() === currentYear)
      .forEach((record) => {
        incomeByCategory[record.category] = (incomeByCategory[record.category] || 0) + Number(record.amount);
      });

    // Expenses by category
    const expensesByCategory: Record<string, number> = {};
    expenses
      .filter((e) => new Date(e.date).getFullYear() === currentYear)
      .forEach((expense) => {
        expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + Number(expense.amount);
      });

    // Smart deductions analysis
    const analysis = analyzeSmartDeductions(yearlyIncome, expenses, currentYear, {
      pension_contribution: deductions.pension_contribution,
      nhis_contribution: deductions.nhis_contribution,
      nhf_contribution: deductions.nhf_contribution,
      life_insurance_premium: deductions.life_insurance_premium,
      annual_rent_paid: deductions.annual_rent_paid,
      employment_compensation: deductions.employment_compensation,
      gifts_received: deductions.gifts_received,
      pension_benefits_received: deductions.pension_benefits_received,
    });

    // Tax computation
    const taxResult = computeTax2026(yearlyIncome, {
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

    // VAT summary
    const vatOutput = vatTransactions
      .filter((t) => t.transactionType === "output" && !t.isExempt)
      .reduce((sum, t) => sum + Number(t.vatAmount), 0);
    const vatInput = vatTransactions
      .filter((t) => t.transactionType === "input" && !t.isExempt)
      .reduce((sum, t) => sum + Number(t.vatAmount), 0);
    const netVAT = vatOutput - vatInput;

    // WHT summary
    const totalWHT = whtTransactions.reduce((sum, t) => sum + Number(t.whtAmount), 0);
    const whtByType: Record<string, number> = {};
    whtTransactions.forEach((t) => {
      whtByType[t.paymentType] = (whtByType[t.paymentType] || 0) + Number(t.whtAmount);
    });

    // Capital assets summary
    const totalAssetsCost = capitalAssets.reduce((sum, a) => sum + Number(a.cost), 0);
    const assetsByCategory: Record<string, { count: number; cost: number }> = {};
    capitalAssets.forEach((asset) => {
      if (!assetsByCategory[asset.category]) {
        assetsByCategory[asset.category] = { count: 0, cost: 0 };
      }
      assetsByCategory[asset.category].count += 1;
      assetsByCategory[asset.category].cost += Number(asset.cost);
    });

    // Invoice summary
    const paidInvoices = invoices.filter((i) => i.status === "paid");
    const overdueInvoices = invoices.filter((i) => i.status === "overdue");
    const pendingInvoices = invoices.filter((i) => i.status === "sent");

    return {
      year: currentYear,
      accountType: profile?.account_type,
      businessName: profile?.business_name,
      
      // Income breakdown
      grossIncome: yearlyIncome,
      incomeByCategory,
      
      // Expense breakdown
      totalExpenses: yearlyExpenses,
      expensesByCategory,
      
      // Statutory deductions claimed
      deductions: {
        pension_contribution: deductions.pension_contribution,
        nhis_contribution: deductions.nhis_contribution,
        nhf_contribution: deductions.nhf_contribution,
        life_insurance_premium: deductions.life_insurance_premium,
        annual_rent_paid: deductions.annual_rent_paid,
        housing_loan_interest: deductions.housing_loan_interest,
      },
      
      // Tax computation result
      taxComputation: {
        taxableIncome: taxResult.taxableIncome,
        netTaxPayable: taxResult.netTaxPayable,
        effectiveRate: taxResult.effectiveRate,
        isExempt: taxResult.isExempt,
        exemptionReason: taxResult.exemptionReason,
        taxByBracket: taxResult.taxByBracket.filter((b) => b.tax > 0),
      },
      
      // Tax payments
      taxPayments: {
        totalPaid: totalTaxPaid,
        balanceDue: Math.max(0, taxResult.netTaxPayable - totalTaxPaid),
        paymentCount: taxPayments.length,
      },
      
      // VAT position (for business accounts)
      vat: {
        outputVAT: vatOutput,
        inputVAT: vatInput,
        netPayable: netVAT,
        transactionCount: vatTransactions.length,
      },
      
      // WHT position
      wht: {
        totalDeducted: totalWHT,
        byPaymentType: whtByType,
        transactionCount: whtTransactions.length,
      },
      
      // Capital assets
      capitalAssets: {
        totalCost: totalAssetsCost,
        assetCount: capitalAssets.length,
        byCategory: assetsByCategory,
      },
      
      // Invoicing (for business accounts)
      invoices: {
        totalCount: invoices.length,
        paidCount: paidInvoices.length,
        paidValue: paidInvoices.reduce((sum, i) => sum + Number(i.total), 0),
        overdueCount: overdueInvoices.length,
        overdueValue: overdueInvoices.reduce((sum, i) => sum + Number(i.total), 0),
        pendingCount: pendingInvoices.length,
        pendingValue: pendingInvoices.reduce((sum, i) => sum + Number(i.total), 0),
      },
      
      // Clients
      clientCount: clients.length,
      
      // Smart deduction analysis
      potentialSavings: analysis.totalPotentialSavings,
      detectedDeductions: analysis.detectedDeductions.map((d) => ({
        category: d.category,
        suggestion: d.suggestion,
        confidence: d.confidence,
      })),
      taxOptimizationTips: analysis.taxOptimizationTips,
      recommendedActions: analysis.recommendedActions,
    };
  }, [
    incomeRecords,
    expenses,
    currentYear,
    deductions,
    profile,
    taxPayments,
    totalTaxPaid,
    vatTransactions,
    whtTransactions,
    capitalAssets,
    invoices,
    clients,
  ]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    const userMsg: Message = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let assistantContent = "";

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tax-advisor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMsg],
            financialContext,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          toast.error("Rate limit exceeded. Please try again in a moment.");
          throw new Error("Rate limit exceeded");
        }
        if (response.status === 402) {
          toast.error("Service temporarily unavailable. Please try again later.");
          throw new Error("Service unavailable");
        }
        
        throw new Error(errorData.error || "Failed to get response");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistant(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    streamChat(input.trim());
    setInput("");
  };

  const handleSuggestionClick = (prompt: string) => {
    if (isLoading) return;
    streamChat(prompt);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const isBusinessAccount = profile?.account_type === "business";

  return (
    <Card
      className={cn(
        "shadow-card border-l-4 border-l-primary transition-all duration-300",
        isExpanded && "fixed inset-4 z-50 m-0"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            Tax Advisor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {currentYear}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={clearChat}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Chat Messages */}
        <ScrollArea
          className={cn(
            "rounded-lg bg-secondary/30 p-3",
            isExpanded ? "h-[calc(100vh-220px)]" : "h-[280px]"
          )}
          ref={scrollRef}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Ask about Nigerian tax obligations
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  I have access to your {currentYear} financial data for personalized advice
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTED_PROMPTS.slice(0, isBusinessAccount ? 6 : 4).map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => handleSuggestionClick(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex gap-2",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 max-w-[85%] text-sm whitespace-pre-wrap",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border"
                    )}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="rounded-lg px-3 py-2 bg-background border">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your tax situation..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        {/* Context indicator */}
        <div className="text-[10px] text-muted-foreground text-center space-x-2">
          {financialContext.grossIncome > 0 && (
            <span>Income: ₦{financialContext.grossIncome.toLocaleString()}</span>
          )}
          {financialContext.taxComputation.netTaxPayable > 0 && (
            <span>• Tax: ₦{financialContext.taxComputation.netTaxPayable.toLocaleString()}</span>
          )}
          {isBusinessAccount && financialContext.vat.netPayable !== 0 && (
            <span>• VAT: ₦{financialContext.vat.netPayable.toLocaleString()}</span>
          )}
          {financialContext.potentialSavings > 0 && (
            <span className="text-green-600">• Savings: ₦{financialContext.potentialSavings.toLocaleString()}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaxAdvisorChat;
