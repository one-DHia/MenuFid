import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

/**
 * Route POST /api/email/subscription-reminder
 * Envoie un e-mail de relance automatique à un restaurateur qui s'est inscrit mais n'a pas encore choisi d'abonnement.
 */
export async function POST(req: Request) {
  try {
    const { email, businessName, merchantId } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'L\'e-mail est requis' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://menufid.site';
    const finishUrl = `${appUrl}/pricing?merchantId=${merchantId || ''}`;

    const subject = `🚀 Finalisez votre abonnement MenuFid pour ${businessName || 'votre établissement'}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #334155;">
        <h2 style="color: #78350f;">Bonjour ${businessName || ''} 👋</h2>
        <p>Vous avez créé votre compte sur <strong>MenuFid</strong>, mais vous n'avez pas encore choisi votre formule d'abonnement pour activer votre menu QR et votre carte de fidélité.</p>
        <p>Pour commencer à recevoir vos premiers clients et booster vos revenus dès aujourd'hui, choisissez votre formule à partir de seulement <strong>5€/mois</strong> :</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${finishUrl}" style="background-color: #b45309; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block;">
            Finaliser mon Abonnement (Dès 5€/mois) &rarr;
          </a>
        </div>
        <p style="font-size: 12px; color: #64748b;">Abonnement sans engagement. Support client dédié 7j/7.</p>
      </div>
    `;

    await sendEmail({ to: email, subject, html });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[Subscription Reminder Error]', error);
    return NextResponse.json({ error: 'Erreur lors de l\'envoi de la relance.' }, { status: 500 });
  }
}
