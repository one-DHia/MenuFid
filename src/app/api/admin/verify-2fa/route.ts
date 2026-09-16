import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    const rateCheck = checkRateLimit(`verify-2fa-${ip}`, { limit: 5, windowMs: 60 * 1000 });
    if (!rateCheck.success) {
      return NextResponse.json({ error: 'Trop de tentatives. Veuillez patienter une minute.' }, { status: 429 });
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify user with Supabase Admin
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    // Check if code is valid and not expired
    const { data: codes, error: codesError } = await supabaseAdmin
      .from('admin_2fa_codes')
      .select('*')
      .eq('admin_id', user.id)
      .eq('code', code)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (codesError || !codes || codes.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    // Delete the code so it can't be used again
    await supabaseAdmin
      .from('admin_2fa_codes')
      .delete()
      .eq('id', codes[0].id);

    // Log the successful login
    await supabaseAdmin
      .from('admin_logs')
      .insert({
        admin_id: user.id,
        action: 'login',
        details: { message: 'Admin logged in successfully via 2FA' }
      });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('verify-2fa error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
