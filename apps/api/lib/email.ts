import { BadGatewayException } from '@nestjs/common';
import { Resend } from 'resend';

const API_KEY = process.env.RESEND_API_KEY || '';
const FROM = process.env.RESEND_FROM || '';

type SendEmailParams = {
  to: string;
  subject: string;
} & (
    | { html: string; text?: string }
    | { text: string; html?: string }
  );

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailParams): Promise<void> {
  const resend = new Resend(API_KEY);
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    ...(html ? { html } : {}),
    ...(text ? { text } : {}),
  } as Parameters<Resend['emails']['send']>[0]);

  if (error) {
    throw new BadGatewayException(error.message);
  }
}

export const SITE_URL = 'https://beaver-savings.vercel.app';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

type LayoutParams = {
  lang: string;
  title: string;
  preheader: string;
  tagline: string;
  /** Trusted HTML: escape any user data before passing it in. */
  content: string;
  footerNote: string;
  websiteLabel: string;
};

export function renderEmailLayout(p: LayoutParams): string {
  return `<!DOCTYPE html>
<html lang="${p.lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(p.title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6ef;font-family:Arial,Helvetica,sans-serif;color:#203b2b;">

  <div style="display:none;font-size:1px;color:#f4f6ef;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${escapeHtml(p.preheader)}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f6ef;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;">

          <tr>
            <td align="center" style="background-color:#173d2a;padding:36px 24px;">
              <div style="font-size:38px;line-height:1.3;">🦫</div>
              <h1 style="margin:8px 0 6px;font-size:28px;line-height:1.3;color:#ffffff;">Beaver Savings</h1>
              <p style="margin:0;font-size:14px;line-height:1.6;color:#d7e9d7;">${escapeHtml(p.tagline)}</p>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 30px 20px;">
              <h2 style="margin:0 0 20px;font-size:29px;line-height:1.3;color:#173d2a;">${escapeHtml(p.title)}</h2>
              ${p.content}
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:24px 30px;background-color:#f8faf5;border-top:1px solid #e7ecdf;">
              <p style="margin:0 0 10px;font-size:13px;line-height:1.7;color:#526357;">
                <strong style="color:#173d2a;">Beaver Savings</strong><br />${escapeHtml(p.tagline)}
              </p>
              <p style="margin:0 0 12px;font-size:12px;line-height:1.7;color:#7b887d;">${escapeHtml(p.footerNote)}</p>
              <p style="margin:0;font-size:12px;line-height:1.7;">
                <a href="${SITE_URL}" style="color:#287545;text-decoration:underline;">${escapeHtml(p.websiteLabel)}</a>
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