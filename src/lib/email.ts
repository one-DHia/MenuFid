/**
 * lib/email.ts
 * ─────────────────────────────────────────────────────────────
 * Service d'expédition d'e-mails transactionnels via Resend API (Domaine Vérifié: menufid.site).
 */

import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
export const resend = new Resend(resendApiKey);

export interface SendEmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendTransactionalEmail(payload: SendEmailPayload) {
  const fromAddress = payload.from || process.env.EMAIL_FROM_ADDRESS || 'MenuFid <contact@menufid.site>';

  const data = await resend.emails.send({
    from: fromAddress,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  });
  return { success: true, data };
}

export const sendEmail = sendTransactionalEmail;
