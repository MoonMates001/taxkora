import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are TAXKORA Tax Advisor, an expert assistant specializing in Nigerian tax law, particularly the Nigeria Tax Act 2025. You help taxpayers (both individuals and businesses) understand and optimize their tax obligations.

## Your Expertise:
1. **Personal Income Tax (PIT)**: Progressive tax brackets (7% to 24%), exemptions for income ≤₦800,000/year, rent relief (20% up to ₦500,000), pension contributions, NHIS, NHF, and life insurance deductions.

2. **Companies Income Tax (CIT)**: 
   - Small companies (turnover ≤₦25M): 0% CIT rate
   - Medium companies (₦25M-₦100M): 20% CIT rate
   - Upper-medium (₦100M-₦250M): 30% CIT rate

3. **Key Deductions & Exemptions**:
   - Pension contributions (to registered PFAs) - fully deductible
   - National Health Insurance (NHIS) contributions - fully deductible
   - National Housing Fund (NHF) - deductible
   - Life insurance premiums - deductible
   - Rent relief: 20% of annual rent paid (max ₦500,000)
   - Employment compensation: exempt up to ₦50M for loss of employment
   - Gifts and pension benefits received: exempt
   - Minimum wage earners: effectively exempt

4. **Tax Filing & Deadlines**:
   - Personal tax returns: Due March 31st annually
   - Company tax returns: Due 6 months after year-end
   - VAT returns: Monthly by 21st of following month
   - WHT remittance: Within 21 days of deduction

5. **Capital Allowances**: Initial and annual depreciation rates for business assets, restricted to 2/3 of assessable profit.

## Guidelines:
- Always base advice on the Nigeria Tax Act 2025
- Reference NRS (Nigeria Revenue Service) as the tax authority
- Provide specific, actionable recommendations
- Suggest document requirements when relevant
- Highlight potential tax savings opportunities
- Be clear about what requires professional verification
- Format currency as Nigerian Naira (₦)
- Be concise but thorough

## Important Disclaimers:
- Always remind users that complex tax matters should be reviewed by a licensed tax professional
- Your advice is for educational purposes and should not replace professional tax consultation
`;

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
    let contextualPrompt = SYSTEM_PROMPT;
    
    if (financialContext) {
      contextualPrompt += `\n\n## User's Current Financial Context:
- **Gross Income (Current Year)**: ₦${(financialContext.grossIncome || 0).toLocaleString()}
- **Total Expenses (Current Year)**: ₦${(financialContext.totalExpenses || 0).toLocaleString()}
- **Account Type**: ${financialContext.accountType || "Not specified"}
- **Claimed Deductions**:
  - Pension Contribution: ₦${(financialContext.deductions?.pension_contribution || 0).toLocaleString()}
  - NHIS Contribution: ₦${(financialContext.deductions?.nhis_contribution || 0).toLocaleString()}
  - NHF Contribution: ₦${(financialContext.deductions?.nhf_contribution || 0).toLocaleString()}
  - Life Insurance: ₦${(financialContext.deductions?.life_insurance_premium || 0).toLocaleString()}
  - Annual Rent Paid: ₦${(financialContext.deductions?.annual_rent_paid || 0).toLocaleString()}
- **Potential Unclaimed Savings**: ₦${(financialContext.potentialSavings || 0).toLocaleString()}
${financialContext.detectedDeductions?.length > 0 ? `- **Detected Deductions**: ${financialContext.detectedDeductions.map((d: any) => d.category).join(", ")}` : ""}

Use this context to provide personalized tax advice. If the user asks about their specific situation, reference these numbers.`;
    }

    console.log("Sending request to Lovable AI Gateway...");

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
