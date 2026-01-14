import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TrialWelcomeRequest {
  email: string;
  name: string;
  planName: string;
  trialEndDate: string;
  features: string[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, planName, trialEndDate, features }: TrialWelcomeRequest = await req.json();

    const featuresList = features
      .map((feature) => `<li style="margin-bottom: 8px;">✓ ${feature}</li>`)
      .join("");

    const emailResponse = await resend.emails.send({
      from: "TaxKora <onboarding@resend.dev>",
      to: [email],
      subject: `🎉 Welcome to TaxKora! Your ${planName} Trial Has Started`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to TaxKora! 🎉</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
            <p style="font-size: 18px; margin-bottom: 20px;">Hi ${name},</p>
            
            <p style="margin-bottom: 20px;">
              Thank you for starting your <strong>3-month free trial</strong> of the <strong>${planName}</strong> plan! 
              We're excited to help you simplify your tax management.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #0d9488; margin-bottom: 24px;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #0d9488;">Trial Details</p>
              <p style="margin: 0; color: #64748b;">
                Your trial is active until <strong>${trialEndDate}</strong>
              </p>
            </div>
            
            <h3 style="color: #0d9488; margin-bottom: 12px;">What you can access:</h3>
            <ul style="list-style: none; padding: 0; margin-bottom: 24px; color: #475569;">
              ${featuresList}
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://taxkora.lovable.app/dashboard" 
                 style="display: inline-block; background: #0d9488; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Go to Dashboard
              </a>
            </div>
            
            <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin-top: 24px;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>💡 Pro Tip:</strong> Start by adding your income sources and expenses to get accurate tax projections. 
                The earlier you track, the more deductions you'll catch!
              </p>
            </div>
          </div>
          
          <div style="background: #1e293b; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
            <p style="color: #94a3b8; margin: 0 0 8px 0; font-size: 14px;">
              Questions? Reply to this email - we're here to help!
            </p>
            <p style="color: #64748b; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} TaxKora. Making tax compliance simple.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Trial welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending trial welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
