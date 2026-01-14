import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReferralInviteRequest {
  email: string;
  referralCode: string;
  referrerName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, referralCode, referrerName }: ReferralInviteRequest = await req.json();

    console.log(`Sending referral invite to ${email} from ${referrerName}`);

    const signupUrl = `${req.headers.get("origin") || "https://taxkora.lovable.app"}/auth?ref=${referralCode}`;

    const emailResponse = await resend.emails.send({
      from: "TAXKORA <onboarding@resend.dev>",
      to: [email],
      subject: `${referrerName} invited you to try TAXKORA!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Logo -->
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; background-color: #0D9488; padding: 12px 16px; border-radius: 12px;">
                  <span style="color: white; font-weight: bold; font-size: 24px;">TAXKORA</span>
                </div>
              </div>

              <!-- Header -->
              <h1 style="font-size: 28px; font-weight: bold; color: #18181b; text-align: center; margin: 0 0 16px;">
                You've Been Invited! 🎉
              </h1>

              <p style="font-size: 16px; color: #52525b; text-align: center; margin: 0 0 32px;">
                <strong>${referrerName}</strong> thinks you'd love TAXKORA - the simple way to manage your taxes in Nigeria.
              </p>

              <!-- Benefits -->
              <div style="background-color: #f0fdfa; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                <h2 style="font-size: 18px; font-weight: 600; color: #0d9488; margin: 0 0 16px;">
                  Why TAXKORA?
                </h2>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #374151;">
                  <li style="margin-bottom: 8px;">Automated tax calculations for PIT, CIT, VAT & WHT</li>
                  <li style="margin-bottom: 8px;">Easy income & expense tracking</li>
                  <li style="margin-bottom: 8px;">Professional invoice generation</li>
                  <li style="margin-bottom: 8px;">Tax deadline reminders</li>
                  <li>3-month free trial to get started!</li>
                </ul>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${signupUrl}" 
                   style="display: inline-block; background-color: #0D9488; color: white; font-weight: 600; font-size: 16px; padding: 16px 48px; border-radius: 12px; text-decoration: none;">
                  Accept Invitation & Sign Up
                </a>
              </div>

              <!-- Referral Code -->
              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
                <p style="font-size: 14px; color: #71717a; margin: 0 0 8px;">
                  Or use this referral code at signup:
                </p>
                <p style="font-size: 24px; font-weight: bold; color: #0D9488; letter-spacing: 4px; margin: 0;">
                  ${referralCode}
                </p>
              </div>

              <p style="font-size: 14px; color: #71717a; text-align: center; margin: 0;">
                When you sign up and subscribe, ${referrerName} gets credit toward a free year subscription!
              </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 32px;">
              <p style="font-size: 12px; color: #a1a1aa; margin: 0;">
                © ${new Date().getFullYear()} TAXKORA. Making tax compliance simple for Nigerian businesses.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Referral invite email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending referral invite:", error);
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
