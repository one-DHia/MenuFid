import { NextResponse } from 'next/server';
import { sendTransactionalEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rateLimit';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Route POST /api/email/send
 * 🔒 SÉCURISÉ : Requiert une authentification Bearer token + Rate Limiting strict
 * pour empêcher tout usage d'open email relay / spam.
 */
export async function POST(req: Request) {
  // 1. Rate Limiting (5 emails par minute par IP)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous-client';
  const rateCheck = checkRateLimit(`api-email-send-${ip}`, { limit: 5, windowMs: 60 * 1000 });

  if (!rateCheck.success) {
    return NextResponse.json({ error: 'Limite d\'envoi atteinte. Veuillez patienter.' }, { status: 429 });
  }

  try {
    // 2. Vérifier l'authentification (Bearer token)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Session invalide ou expirée.' }, { status: 401 });
    }

    const { to, subject, message, businessName } = await req.json();

    if (!to || !subject || !message) {
      return NextResponse.json({ error: 'Champs requis manquants (to, subject, message).' }, { status: 400 });
    }

    // Validation du format de l'e-mail destinataire
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json({ error: 'Format d\'adresse email invalide.' }, { status: 400 });
    }

    // Sanitisation des champs pour éviter les injections HTML
    const safeSubject = String(subject).slice(0, 200).replace(/[\r\n]/g, ' ');
    const safeBusinessName = String(businessName || 'MenuFid').slice(0, 100).replace(/[<>]/g, '');
    const safeMessage = String(message).slice(0, 4000).replace(/[<>]/g, '');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e7e5e4; border-radius: 16px;">
        <div style="background-color: #000000; padding: 16px; border-radius: 12px; text-align: center; color: #ffffff; font-weight: bold; font-size: 20px;">
          ${safeBusinessName}
        </div>
        <div style="padding: 24px 0; color: #1c1917; line-height: 1.6; font-size: 14px;">
          ${safeMessage.replace(/\n/g, '<br/>')}
        </div>
        <div style="border-top: 1px solid #f5f5f4; padding-top: 16px; text-align: center; color: #78716c; font-size: 12px;">
          Envoyé via MenuFid
        </div>
      </div>
    `;

    const result = await sendTransactionalEmail({
      to,
      subject: safeSubject,
      html: htmlContent,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Erreur lors de l\'envoi de l\'e-mail.' }, { status: 500 });
  }
}
