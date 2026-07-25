import { NextResponse } from 'next/server';
import { sendTransactionalEmail } from '@/lib/email';

/**
 * Route POST /api/email/send
 * Envoie un e-mail réels aux clients ou commerçants.
 */
export async function POST(req: Request) {
  try {
    const { to, subject, message, businessName } = await req.json();

    if (!to || !subject || !message) {
      return NextResponse.json({ error: 'Champs requis manquants (to, subject, message).' }, { status: 400 });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e7e5e4; border-radius: 16px;">
        <div style="background-color: #b45309; padding: 16px; border-radius: 12px; text-align: center; color: #ffffff; font-weight: bold; font-size: 20px;">
          ${businessName || 'MenuFid Restaurant'}
        </div>
        <div style="padding: 24px 0; color: #1c1917; line-height: 1.6; font-size: 14px;">
          ${message.replace(/\n/g, '<br/>')}
        </div>
        <div style="border-top: 1px solid #f5f5f4; padding-top: 16px; text-align: center; color: #78716c; font-size: 12px;">
          Envoyé via le service de fidélité MenuFid
        </div>
      </div>
    `;

    const result = await sendTransactionalEmail({
      to,
      subject,
      html: htmlContent,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('[Email API Route Error]', error);
    return NextResponse.json({ error: 'Erreur lors de l\'envoi de l\'e-mail.' }, { status: 500 });
  }
}
