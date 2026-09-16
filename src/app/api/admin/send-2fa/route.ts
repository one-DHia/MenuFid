import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendTransactionalEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    const rateCheck = checkRateLimit(`send-2fa-${ip}`, { limit: 5, windowMs: 60 * 1000 });
    if (!rateCheck.success) {
      return NextResponse.json({ error: 'Trop de tentatives. Veuillez patienter une minute.' }, { status: 429 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // 🔒 1. Verify user is actually in admins table
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('id')
      .eq('id', userId)
      .single();

    if (adminError || !admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 🔒 2. Get the actual genuine verified email of the admin from auth
    const { data: authUserData, error: authUserErr } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (authUserErr || !authUserData?.user?.email) {
      return NextResponse.json({ error: 'Admin email not found' }, { status: 404 });
    }

    const recipientEmail = authUserData.user.email;

    // 🔒 3. Generate a secure 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

    // Save to DB
    const { error: insertError } = await supabaseAdmin
      .from('admin_2fa_codes')
      .insert({
        admin_id: userId,
        code,
        expires_at: expiresAt.toISOString()
      });

    if (insertError) {
      console.error('Error inserting 2FA code:', insertError);
      return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 });
    }

    // Send the email to the admin's genuine email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e7e5e4; border-radius: 16px;">
        <div style="background-color: #10b981; padding: 16px; border-radius: 12px; text-align: center; color: #ffffff; font-weight: bold; font-size: 20px;">
          MenuFid - Admin Security
        </div>
        <div style="padding: 24px 0; color: #1c1917; line-height: 1.6; font-size: 16px; text-align: center;">
          Voici votre code de sécurité (A2F) pour accéder au portail Super-Admin :<br/><br/>
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #047857;">${code}</span>
          <br/><br/>
          Ce code expirera dans 10 minutes. S'il n'a pas été demandé par vous, ignorez ce message.
        </div>
      </div>
    `;

    try {
      await sendTransactionalEmail({
        to: recipientEmail,
        subject: 'Votre code de connexion Admin (2FA) - MenuFid',
        html: htmlContent,
      });
    } catch (emailErr) {
      console.error('Failed to send 2FA email:', emailErr);
    }

    return NextResponse.json({ success: true, message: '2FA code sent successfully' });
  } catch (error: any) {
    console.error('Send 2FA error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
