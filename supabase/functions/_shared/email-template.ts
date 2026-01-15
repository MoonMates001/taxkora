/**
 * TAXKORA Branded Email Template
 * Shared across all transactional emails for consistent branding
 */

export interface EmailTemplateOptions {
  preheader?: string;
  title: string;
  subtitle?: string;
  greeting?: string;
  recipientName?: string;
  content: string;
  ctaText?: string;
  ctaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  footerNote?: string;
  showSocialLinks?: boolean;
}

export const BRAND_COLORS = {
  primary: "#0D9488",
  primaryLight: "#14b8a6",
  primaryDark: "#0f766e",
  accent: "#f97316",
  warning: "#f59e0b",
  danger: "#ef4444",
  success: "#22c55e",
  dark: "#1e293b",
  muted: "#64748b",
  light: "#f8fafc",
  border: "#e2e8f0",
};

export const BRAND_LOGO_URL = "https://taxkora.lovable.app/favicon.png";
export const BRAND_NAME = "TAXKORA";
export const BRAND_TAGLINE = "Making tax compliance simple for Nigerian businesses";
export const BRAND_URL = "https://taxkora.lovable.app";
export const CONTACT_EMAIL = "alphalinkprime@gmail.com";
export const CONTACT_PHONE = "+234 707 770 6706";

/**
 * Generates a branded email template with consistent styling
 */
export function generateBrandedEmail(options: EmailTemplateOptions): string {
  const {
    preheader = "",
    title,
    subtitle,
    greeting,
    recipientName,
    content,
    ctaText,
    ctaUrl,
    secondaryCtaText,
    secondaryCtaUrl,
    footerNote,
    showSocialLinks = false,
  } = options;

  const greetingText = greeting || (recipientName ? `Hi ${recipientName},` : "Hello,");
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    table { border-collapse: collapse; }
    .button { padding: 14px 28px !important; }
  </style>
  <![endif]-->
  <style>
    @media only screen and (max-width: 600px) {
      .container { padding: 16px !important; }
      .content { padding: 24px !important; }
      .button { display: block !important; width: 100% !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>` : ""}
  
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px;">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primaryLight} 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
              <img src="${BRAND_LOGO_URL}" alt="${BRAND_NAME}" width="56" height="56" style="border-radius: 12px; margin-bottom: 12px; display: block; margin-left: auto; margin-right: auto;" />
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                ${BRAND_NAME}
              </h1>
              ${subtitle ? `<p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9);">${subtitle}</p>` : ""}
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td class="content" style="background-color: #ffffff; padding: 40px; border-left: 1px solid ${BRAND_COLORS.border}; border-right: 1px solid ${BRAND_COLORS.border};">
              
              <!-- Title -->
              <h2 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 700; color: #18181b; text-align: center; line-height: 1.3;">
                ${title}
              </h2>
              
              <!-- Greeting -->
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                ${greetingText}
              </p>
              
              <!-- Dynamic Content -->
              ${content}
              
              <!-- Primary CTA Button -->
              ${ctaText && ctaUrl ? `
              <div style="text-align: center; margin: 32px 0;">
                <a href="${ctaUrl}" class="button" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primaryLight} 100%); color: #ffffff; font-weight: 600; font-size: 16px; padding: 16px 32px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 14px rgba(13, 148, 136, 0.25);">
                  ${ctaText}
                </a>
              </div>
              ` : ""}
              
              <!-- Secondary CTA -->
              ${secondaryCtaText && secondaryCtaUrl ? `
              <p style="text-align: center; margin: 16px 0;">
                <a href="${secondaryCtaUrl}" style="color: ${BRAND_COLORS.primary}; font-size: 14px; text-decoration: underline;">
                  ${secondaryCtaText}
                </a>
              </p>
              ` : ""}
              
              <!-- Footer Note -->
              ${footerNote ? `
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid ${BRAND_COLORS.border};">
                <p style="margin: 0; font-size: 14px; color: ${BRAND_COLORS.muted}; line-height: 1.6;">
                  ${footerNote}
                </p>
              </div>
              ` : ""}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: ${BRAND_COLORS.dark}; border-radius: 0 0 16px 16px; padding: 32px; text-align: center;">
              
              <!-- Contact Info -->
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #94a3b8;">
                Questions? Contact us at<br>
                <a href="mailto:${CONTACT_EMAIL}" style="color: ${BRAND_COLORS.primaryLight}; text-decoration: none;">${CONTACT_EMAIL}</a>
                <span style="color: #475569;"> · </span>
                <a href="tel:${CONTACT_PHONE.replace(/\s/g, "")}" style="color: ${BRAND_COLORS.primaryLight}; text-decoration: none;">${CONTACT_PHONE}</a>
              </p>
              
              ${showSocialLinks ? `
              <!-- Social Links -->
              <div style="margin-bottom: 16px;">
                <a href="https://twitter.com/taxkora" style="display: inline-block; margin: 0 8px;">
                  <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/twitter.svg" alt="Twitter" width="24" height="24" style="filter: invert(1);" />
                </a>
                <a href="https://linkedin.com/company/taxkora" style="display: inline-block; margin: 0 8px;">
                  <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg" alt="LinkedIn" width="24" height="24" style="filter: invert(1);" />
                </a>
              </div>
              ` : ""}
              
              <!-- Tagline & Copyright -->
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #94a3b8;">
                ${BRAND_TAGLINE}
              </p>
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                © ${currentYear} ${BRAND_NAME}. All rights reserved.
              </p>
              
              <!-- Legal Links -->
              <p style="margin: 16px 0 0 0; font-size: 11px; color: #475569;">
                <a href="${BRAND_URL}/privacy" style="color: #64748b; text-decoration: underline;">Privacy Policy</a>
                <span style="margin: 0 8px;">·</span>
                <a href="${BRAND_URL}/terms" style="color: #64748b; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * HTML escape to prevent XSS in emails
 */
export function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
}

/**
 * Generate an info box component
 */
export function generateInfoBox(
  content: string,
  type: "info" | "success" | "warning" | "danger" = "info"
): string {
  const colors = {
    info: { bg: "#f0fdfa", border: BRAND_COLORS.primary, text: "#0f766e" },
    success: { bg: "#f0fdf4", border: BRAND_COLORS.success, text: "#166534" },
    warning: { bg: "#fffbeb", border: BRAND_COLORS.warning, text: "#92400e" },
    danger: { bg: "#fef2f2", border: BRAND_COLORS.danger, text: "#991b1b" },
  };

  const { bg, border, text } = colors[type];

  return `
    <div style="background-color: ${bg}; border-left: 4px solid ${border}; border-radius: 0 8px 8px 0; padding: 16px; margin: 20px 0;">
      <p style="margin: 0; color: ${text}; font-size: 14px; line-height: 1.6;">
        ${content}
      </p>
    </div>
  `;
}

/**
 * Generate a feature/benefit list
 */
export function generateFeatureList(features: string[]): string {
  const items = features
    .map(
      (feature) => `
      <li style="margin-bottom: 8px; padding-left: 8px;">
        <span style="color: ${BRAND_COLORS.primary}; margin-right: 8px;">✓</span>
        ${escapeHtml(feature)}
      </li>
    `
    )
    .join("");

  return `
    <ul style="margin: 20px 0; padding: 0; list-style: none; color: #374151;">
      ${items}
    </ul>
  `;
}

/**
 * Generate a stats/details table
 */
export function generateDetailsTable(
  details: Array<{ label: string; value: string }>
): string {
  const rows = details
    .map(
      ({ label, value }) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid ${BRAND_COLORS.border}; color: ${BRAND_COLORS.muted}; font-size: 14px;">
          ${escapeHtml(label)}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid ${BRAND_COLORS.border}; font-weight: 600; font-size: 14px; text-align: right; color: #18181b;">
          ${escapeHtml(value)}
        </td>
      </tr>
    `
    )
    .join("");

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
      ${rows}
    </table>
  `;
}

/**
 * Generate a highlight/reward box
 */
export function generateHighlightBox(
  title: string,
  content: string,
  gradient: "teal" | "gold" | "purple" = "teal"
): string {
  const gradients = {
    teal: `linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primaryLight} 100%)`,
    gold: `linear-gradient(135deg, #f59e0b 0%, #d97706 100%)`,
    purple: `linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)`,
  };

  return `
    <div style="background: ${gradients[gradient]}; color: #ffffff; padding: 24px; border-radius: 12px; margin: 24px 0; text-align: center;">
      <h3 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700;">
        ${title}
      </h3>
      <p style="margin: 0; font-size: 16px; opacity: 0.95;">
        ${content}
      </p>
    </div>
  `;
}
