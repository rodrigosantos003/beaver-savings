import { SITE_URL } from '../../lib/constants.js';
import { escapeHtml, renderEmailLayout } from '../../lib/email.js';

type InactivityEmailInput = {
  email: string;
  name?: string;
  deleteAfter: Date;
};

/**
 * Users have no stored language preference, so the notice is sent in both
 * Portuguese (the app's default locale) and English.
 */
export function buildInactivityWarningEmail({ email, name, deleteAfter }: InactivityEmailInput) {
  const loginUrl = `${SITE_URL}/login`;
  const datePt = deleteAfter.toLocaleDateString('pt-PT', { dateStyle: 'long', timeZone: 'UTC' });
  const dateEn = deleteAfter.toLocaleDateString('en-GB', { dateStyle: 'long', timeZone: 'UTC' });

  const pt = {
    greeting: name ? `Olá ${name},` : 'Olá,',
    body: `A sua conta Beaver Savings não é utilizada há quase 2 anos. Para proteger os seus dados, vamos eliminá-la, juntamente com todas as suas informações de poupança, a partir de ${datePt}.`,
    keep: 'Para manter a sua conta, basta iniciar sessão antes dessa data.',
    ignore: 'Se já não precisa da conta, não tem de fazer nada.',
  };
  const en = {
    greeting: name ? `Hi ${name},` : 'Hi,',
    body: `Your Beaver Savings account has not been used for almost 2 years. To protect your data, we will delete it, together with all of your savings information, on or after ${dateEn}.`,
    keep: 'To keep your account, simply sign in before that date.',
    ignore: "If you no longer need the account, you don't need to do anything.",
  };

  const subject =
    'A sua conta Beaver Savings será eliminada | Your Beaver Savings account will be deleted';

  const text = [
    pt.greeting,
    '',
    pt.body,
    pt.keep,
    pt.ignore,
    '',
    '---',
    '',
    en.greeting,
    '',
    en.body,
    en.keep,
    en.ignore,
    '',
    loginUrl,
  ].join('\n');

  const p = (value: string) =>
    `<p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#526357;">${escapeHtml(value)}</p>`;

  const button = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 28px;">
      <tr>
        <td align="center" bgcolor="#287545" style="border-radius:8px;">
          <a href="${escapeHtml(loginUrl)}" target="_blank"
            style="display:inline-block;padding:14px 26px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;">
            Iniciar sessão / Sign in &rarr;
          </a>
        </td>
      </tr>
    </table>`;

  const section = (m: typeof pt) => [m.greeting, m.body, m.keep, m.ignore].map(p).join('');

  const html = renderEmailLayout({
    lang: 'pt',
    title: 'Conta inativa · Inactive account',
    preheader: pt.body,
    tagline: 'Poupe passo a passo. · Save bit by bit.',
    content: `${section(pt)}${button}<hr style="border:none;border-top:1px solid #e7ecdf;margin:0 0 24px;" />${section(en)}`,
    footerNote: `Este email foi enviado para ${email}. · This email was sent to ${email}.`,
    websiteLabel: 'beaver-savings.vercel.app',
  });

  return { subject, text, html };
}
