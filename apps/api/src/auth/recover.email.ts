import { SITE_URL } from '../../lib/constants';

type Messages = {
  subject: string;
  preheader: string;
  tagline: string;
  greeting: (name?: string) => string;
  title: string;
  intro: string;
  cta: string;
  expiry: (duration: string) => string;
  fallback: string;
  ignore: string;
  signoff: string;
  sentTo: (email: string) => string;
  website: string;
};

type Locale = 'en' | 'pt';

const RESET_EXPIRES_IN = 60 * 60; // seconds (1 hour)

function formatDuration(seconds: number, locale: Locale): string {
  const [value, unit] =
    seconds >= 3600 ? [Math.round(seconds / 3600), 'hour'] : [Math.round(seconds / 60), 'minute'];
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit,
    unitDisplay: 'long',
  }).format(value);
}

const messages: Record<Locale, Messages> = {
  en: {
    subject: 'Reset your Beaver Savings password',
    preheader: 'Use this link to choose a new password for your account.',
    tagline: 'Save bit by bit.',
    greeting: (name) => (name ? `Hi ${name},` : 'Hi,'),
    title: 'Reset your password',
    intro:
      'We received a request to reset the password for your Beaver Savings account. Click the button below to choose a new password.',
    cta: 'Reset my password',
    expiry: (d) =>
      `This link will expire in ${d}. If it expires, you can request a new one from the forgot password page.`,
    fallback: "If the button doesn't work, copy and paste this link into your browser:",
    ignore:
      "If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.",
    signoff: 'The Beaver Savings Team',
    sentTo: (email) => `This email was sent to ${email}.`,
    website: 'Visit our website',
  },
  pt: {
    subject: 'Redefina a sua palavra-passe Beaver Savings',
    preheader: 'Utilize este link para escolher uma nova palavra-passe para a sua conta.',
    tagline: 'Poupe passo a passo.',
    greeting: (name) => (name ? `Olá ${name},` : 'Olá,'),
    title: 'Redefina a sua palavra-passe',
    intro:
      'Recebemos um pedido para redefinir a palavra-passe da sua conta Beaver Savings. Clique no botão abaixo para escolher uma nova palavra-passe.',
    cta: 'Redefinir a minha palavra-passe',
    expiry: (d) =>
      `Este link expira em ${d}. Se expirar, pode pedir um novo na página de recuperação de palavra-passe.`,
    fallback: 'Se o botão não funcionar, copie e cole este link no seu navegador:',
    ignore:
      'Se não pediu a redefinição da palavra-passe, pode ignorar este email. A sua palavra-passe não será alterada.',
    signoff: 'A Equipa Beaver Savings',
    sentTo: (email) => `Este email foi enviado para ${email}.`,
    website: 'Visite o nosso site',
  },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

type ResetPasswordEmailInput = {
  url: string;
  email: string;
  name?: string;
};

export function buildResetPasswordEmail(
  locale: Locale,
  { url, email, name }: ResetPasswordEmailInput,
) {
  const m = messages[locale];
  const duration = formatDuration(RESET_EXPIRES_IN, locale);

  const safeUrl = escapeHtml(url);
  const safeName = name ? escapeHtml(name) : undefined;

  const text = [
    m.greeting(name),
    '',
    m.intro,
    '',
    url,
    '',
    m.expiry(duration),
    m.ignore,
    '',
    m.signoff,
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(m.subject)}</title>
</head>

<body style="margin:0;padding:0;background-color:#f4f6ef;font-family:Arial,Helvetica,sans-serif;color:#203b2b;">

  <!-- Preheader -->
  <div style="display:none;font-size:1px;color:#f4f6ef;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${escapeHtml(m.preheader)}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
    style="background-color:#f4f6ef;padding:32px 12px;">
    <tr>
      <td align="center">

        <!-- Email container -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"
          style="width:100%;max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#173d2a;padding:36px 24px;">
              <div style="font-size:38px;line-height:1.3;">🦫</div>
              <h1 style="margin:8px 0 6px;font-size:28px;line-height:1.3;color:#ffffff;">
                Beaver Savings
              </h1>
              <p style="margin:0;font-size:14px;line-height:1.6;color:#d7e9d7;">
                ${escapeHtml(m.tagline)}
              </p>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding:36px 30px 20px;">

              <p style="margin:0 0 12px;font-size:15px;color:#526357;">
                ${m.greeting(safeName)}
              </p>

              <h2 style="margin:0 0 16px;font-size:29px;line-height:1.3;color:#173d2a;">
                ${escapeHtml(m.title)}
              </h2>

              <p style="margin:0 0 26px;font-size:16px;line-height:1.8;color:#526357;">
                ${escapeHtml(m.intro)}
              </p>

              <!-- CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0"
                style="margin:0 0 24px;">
                <tr>
                  <td align="center" bgcolor="#287545" style="border-radius:8px;">
                    <a href="${safeUrl}"
                      target="_blank"
                      style="display:inline-block;padding:16px 28px;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;">
                      ${escapeHtml(m.cta)} &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry notice -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                style="margin-bottom:24px;background-color:#f0f5e9;border-radius:10px;">
                <tr>
                  <td width="56" valign="top" style="padding:16px 0 16px 16px;font-size:25px;">
                    ⏳
                  </td>
                  <td style="padding:16px 16px 16px 8px;">
                    <p style="margin:0;font-size:14px;line-height:1.7;color:#526357;">
                      ${escapeHtml(m.expiry(duration))}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Link fallback -->
              <p style="margin:0 0 6px;font-size:13px;line-height:1.7;color:#7b887d;">
                ${escapeHtml(m.fallback)}
              </p>
              <p style="margin:0 0 24px;font-size:13px;line-height:1.7;word-break:break-all;">
                <a href="${safeUrl}" style="color:#287545;text-decoration:underline;">${safeUrl}</a>
              </p>

              <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#526357;">
                ${escapeHtml(m.ignore)}
              </p>

              <p style="margin:0;font-size:16px;line-height:1.8;color:#526357;">
                🦫<br />
                <strong style="color:#173d2a;">${escapeHtml(m.signoff)}</strong>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center"
              style="padding:24px 30px;background-color:#f8faf5;border-top:1px solid #e7ecdf;">

              <p style="margin:0 0 10px;font-size:13px;line-height:1.7;color:#526357;">
                <strong style="color:#173d2a;">Beaver Savings</strong><br />
                ${escapeHtml(m.tagline)}
              </p>

              <p style="margin:0 0 12px;font-size:12px;line-height:1.7;color:#7b887d;">
                ${escapeHtml(m.sentTo(email))}
              </p>

              <p style="margin:0;font-size:12px;line-height:1.7;">
                <a href="${SITE_URL}" style="color:#287545;text-decoration:underline;">
                  ${escapeHtml(m.website)}
                </a>
              </p>

            </td>
          </tr>

        </table>
        <!-- End email container -->

      </td>
    </tr>
  </table>

</body>
</html>`;

  return { subject: m.subject, text, html };
}
