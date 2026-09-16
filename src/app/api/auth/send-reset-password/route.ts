import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rateLimit';

/**
 * POST /api/auth/send-reset-password
 * Envoie un lien de réinitialisation de mot de passe sécurisé par email via Supabase Auth.
 */
export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    const rateCheck = checkRateLimit(`send-reset-${ip}`, { limit: 5, windowMs: 60 * 1000 });

    if (!rateCheck.success) {
      return NextResponse.json({ error: 'Trop de demandes. Veuillez patienter une minute.' }, { status: 429 });
    }

    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Adresse email requise' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://www.menufid.site';
    const redirectTo = `${origin}/pro/reset-password`;

    // 1. Envoyer le mail de réinitialisation via Supabase Auth
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo
    });

    if (resetError) {
      console.error('[SendResetPassword Error]:', resetError);
      return NextResponse.json({ error: resetError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[SendResetPassword Server Error]:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'envoi' }, { status: 500 });
  }
}
