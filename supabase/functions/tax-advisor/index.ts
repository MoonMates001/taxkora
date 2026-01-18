import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are TAXKORA Tax Advisor, an expert assistant specializing in Nigerian tax law, particularly the Nigeria Tax Act 2025. You help taxpayers (both individuals and businesses) understand and optimize their tax obligations.

## Your Expertise:
1. **Personal Income Tax (PIT)**: Progressive tax brackets (0% for first ₦800,000, then 15%, 18%, 21%, 23%, 25%), exemptions, rent relief (20% up to ₦500,000), pension contributions, NHIS, NHF, and life insurance deductions.

2. **Companies Income Tax (CIT)**: 
   - Small companies (turnover ≤₦25M): 0% CIT rate
   - Medium companies (₦25M-₦100M): 20% CIT rate
   - Upper-medium (₦100M-₦250M): 30% CIT rate

3. **Value Added Tax (VAT)**:
   - Standard rate: 7.5%
   - Output VAT (charged on sales) minus Input VAT (paid on purchases) = Net VAT payable
   - Monthly filing due by 21st of following month

4. **Withholding Tax (WHT)**:
   - Dividends: 10%
   - Interest: 10%
   - Rent: 10%
   - Professional/Technical fees: 10% (corporate) / 5% (individual)
   - Remittance due within 21 days of deduction

5. **Key Deductions & Exemptions**:
   - Pension contributions (to registered PFAs) - fully deductible
   - National Health Insurance (NHIS) contributions - fully deductible
   - National Housing Fund (NHF) - deductible
   - Life insurance premiums - deductible
   - Rent relief: 20% of annual rent paid (max ₦500,000)
   - Employment compensation: exempt up to ₦50M for loss of employment
   - Gifts and pension benefits received: exempt
   - Minimum wage earners: effectively exempt (income ≤₦800,000)

6. **Capital Allowances**:
   - Initial allowance: 25% in year of acquisition
   - Annual allowance: 20% on reducing balance
   - Restricted to 2/3 of assessable profit

7. **Tax Filing & Deadlines**:
   - Personal tax returns: Due March 31st annually
   - Company tax returns: Due 6 months after year-end
   - VAT returns: Monthly by 21st of following month
   - WHT remittance: Within 21 days of deduction

## Guidelines:
- Always base advice on the Nigeria Tax Act 2025
- Reference NRS (Nigeria Revenue Service) as the federal tax authority
- Reference SIRS (State Internal Revenue Service) for state-level PIT
- Provide specific, actionable recommendations based on the user's actual financial data
- Suggest document requirements when relevant
- Highlight potential tax savings opportunities
- Be clear about what requires professional verification
- Format currency as Nigerian Naira (₦) with proper formatting
- Be concise but thorough
- Use the financial context provided to give personalized advice
- Calculate specific amounts where possible based on user data

## Important Disclaimers:
- Complex tax matters should be reviewed by a licensed tax professional
- Your advice is for educational purposes and should not replace professional tax consultation
`;

const formatFinancialContext = (context: any): string => {
  if (!context) return "";
  
  let contextStr = `\n\n## User's Financial Context for ${context.year}:\n`;
  
  // Basic info
  contextStr += `- **Account Type**: ${context.accountType === "business" ? "Business" : "Personal"}\n`;
  if (context.businessName) {
    contextStr += `- **Business Name**: ${context.businessName}\n`;
  }
  
  // Income breakdown
  contextStr += `\n### Income:\n`;
  contextStr += `- **Gross Income**: ₦${(context.grossIncome || 0).toLocaleString()}\n`;
  if (context.incomeByCategory && Object.keys(context.incomeByCategory).length > 0) {
    contextStr += `- **By Category**:\n`;
    for (const [cat, amount] of Object.entries(context.incomeByCategory)) {
      contextStr += `  - ${cat}: ₦${(amount as number).toLocaleString()}\n`;
    }
  }
  
  // Expenses breakdown
  contextStr += `\n### Expenses:\n`;
  contextStr += `- **Total Expenses**: ₦${(context.totalExpenses || 0).toLocaleString()}\n`;
  if (context.expensesByCategory && Object.keys(context.expensesByCategory).length > 0) {
    const topExpenses = Object.entries(context.expensesByCategory)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 5);
    if (topExpenses.length > 0) {
      contextStr += `- **Top Categories**:\n`;
      for (const [cat, amount] of topExpenses) {
        contextStr += `  - ${cat}: ₦${(amount as number).toLocaleString()}\n`;
      }
    }
  }
  
  // Statutory deductions
  contextStr += `\n### Statutory Deductions Claimed:\n`;
  if (context.deductions) {
    const d = context.deductions;
    if (d.pension_contribution > 0) contextStr += `- Pension Contribution: ₦${d.pension_contribution.toLocaleString()}\n`;
    if (d.nhis_contribution > 0) contextStr += `- NHIS Contribution: ₦${d.nhis_contribution.toLocaleString()}\n`;
    if (d.nhf_contribution > 0) contextStr += `- NHF Contribution: ₦${d.nhf_contribution.toLocaleString()}\n`;
    if (d.life_insurance_premium > 0) contextStr += `- Life Insurance Premium: ₦${d.life_insurance_premium.toLocaleString()}\n`;
    if (d.annual_rent_paid > 0) contextStr += `- Annual Rent Paid: ₦${d.annual_rent_paid.toLocaleString()} (Relief: ₦${Math.min(d.annual_rent_paid * 0.2, 500000).toLocaleString()})\n`;
    if (d.housing_loan_interest > 0) contextStr += `- Housing Loan Interest: ₦${d.housing_loan_interest.toLocaleString()}\n`;
  }
  
  // Tax computation
  if (context.taxComputation) {
    const tc = context.taxComputation;
    contextStr += `\n### Tax Computation:\n`;
    contextStr += `- **Taxable Income**: ₦${(tc.taxableIncome || 0).toLocaleString()}\n`;
    contextStr += `- **Net Tax Payable**: ₦${(tc.netTaxPayable || 0).toLocaleString()}\n`;
    contextStr += `- **Effective Rate**: ${(tc.effectiveRate || 0).toFixed(1)}%\n`;
    if (tc.isExempt) {
      contextStr += `- **Status**: TAX EXEMPT (${tc.exemptionReason})\n`;
    }
    if (tc.taxByBracket && tc.taxByBracket.length > 0) {
      contextStr += `- **Tax by Bracket**:\n`;
      for (const bracket of tc.taxByBracket) {
        contextStr += `  - ${bracket.bracket}: ₦${bracket.tax.toLocaleString()} (${bracket.rate}%)\n`;
      }
    }
  }
  
  // Tax payments
  if (context.taxPayments) {
    const tp = context.taxPayments;
    contextStr += `\n### Tax Payments:\n`;
    contextStr += `- **Total Paid**: ₦${(tp.totalPaid || 0).toLocaleString()}\n`;
    contextStr += `- **Balance Due**: ₦${(tp.balanceDue || 0).toLocaleString()}\n`;
    contextStr += `- **Payment Count**: ${tp.paymentCount || 0}\n`;
  }
  
  // VAT (for business)
  if (context.accountType === "business" && context.vat) {
    const v = context.vat;
    contextStr += `\n### VAT Position:\n`;
    contextStr += `- **Output VAT (collected)**: ₦${(v.outputVAT || 0).toLocaleString()}\n`;
    contextStr += `- **Input VAT (paid)**: ₦${(v.inputVAT || 0).toLocaleString()}\n`;
    contextStr += `- **Net VAT Payable**: ₦${(v.netPayable || 0).toLocaleString()}${v.netPayable < 0 ? " (Refund position)" : ""}\n`;
    contextStr += `- **Transaction Count**: ${v.transactionCount || 0}\n`;
  }
  
  // WHT
  if (context.wht && context.wht.totalDeducted > 0) {
    const w = context.wht;
    contextStr += `\n### Withholding Tax:\n`;
    contextStr += `- **Total WHT Deducted**: ₦${(w.totalDeducted || 0).toLocaleString()}\n`;
    if (w.byPaymentType && Object.keys(w.byPaymentType).length > 0) {
      contextStr += `- **By Type**:\n`;
      for (const [type, amount] of Object.entries(w.byPaymentType)) {
        contextStr += `  - ${type}: ₦${(amount as number).toLocaleString()}\n`;
      }
    }
  }
  
  // Capital assets
  if (context.capitalAssets && context.capitalAssets.assetCount > 0) {
    const ca = context.capitalAssets;
    contextStr += `\n### Capital Assets:\n`;
    contextStr += `- **Total Asset Cost**: ₦${(ca.totalCost || 0).toLocaleString()}\n`;
    contextStr += `- **Asset Count**: ${ca.assetCount}\n`;
    if (ca.byCategory && Object.keys(ca.byCategory).length > 0) {
      contextStr += `- **By Category**:\n`;
      for (const [cat, data] of Object.entries(ca.byCategory)) {
        const catData = data as { count: number; cost: number };
        contextStr += `  - ${cat}: ${catData.count} assets, ₦${catData.cost.toLocaleString()}\n`;
      }
    }
  }
  
  // Invoices (for business)
  if (context.accountType === "business" && context.invoices && context.invoices.totalCount > 0) {
    const inv = context.invoices;
    contextStr += `\n### Invoices:\n`;
    contextStr += `- **Total Invoices**: ${inv.totalCount}\n`;
    contextStr += `- **Paid**: ${inv.paidCount} (₦${(inv.paidValue || 0).toLocaleString()})\n`;
    if (inv.overdueCount > 0) {
      contextStr += `- **Overdue**: ${inv.overdueCount} (₦${(inv.overdueValue || 0).toLocaleString()}) ⚠️\n`;
    }
    if (inv.pendingCount > 0) {
      contextStr += `- **Pending**: ${inv.pendingCount} (₦${(inv.pendingValue || 0).toLocaleString()})\n`;
    }
  }
  
  // Smart deduction analysis
  if (context.potentialSavings > 0 || (context.detectedDeductions && context.detectedDeductions.length > 0)) {
    contextStr += `\n### Tax Optimization Opportunities:\n`;
    if (context.potentialSavings > 0) {
      contextStr += `- **Potential Tax Savings**: ₦${context.potentialSavings.toLocaleString()}\n`;
    }
    if (context.detectedDeductions && context.detectedDeductions.length > 0) {
      contextStr += `- **Detected Deductions**:\n`;
      for (const ded of context.detectedDeductions) {
        contextStr += `  - ${ded.category} (${ded.confidence} confidence): ${ded.suggestion}\n`;
      }
    }
    if (context.taxOptimizationTips && context.taxOptimizationTips.length > 0) {
      contextStr += `- **Optimization Tips**:\n`;
      for (const tip of context.taxOptimizationTips) {
        contextStr += `  - ${tip}\n`;
      }
    }
    if (context.recommendedActions && context.recommendedActions.length > 0) {
      contextStr += `- **Recommended Actions**:\n`;
      for (const action of context.recommendedActions) {
        contextStr += `  - ${action}\n`;
      }
    }
  }
  
  contextStr += `\nUse this comprehensive context to provide accurate, personalized tax advice. Reference specific numbers from the user's data when answering questions.`;
  
  return contextStr;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, financialContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context-aware system prompt
    const contextualPrompt = SYSTEM_PROMPT + formatFinancialContext(financialContext);

    console.log("Sending request to Lovable AI Gateway with comprehensive context...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: contextualPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Tax advisor error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
