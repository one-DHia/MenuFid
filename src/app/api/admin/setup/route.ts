import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // 🔒 Validation mot de passe côté serveur
    if (password.length < 8) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' }, { status: 400 });
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins une lettre et un chiffre.' }, { status: 400 });
    }

    // 1. Verify that 0 admins exist (Security measure)
    const { count, error: countError } = await supabaseAdmin
      .from('admins')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Count error:', countError);
      return NextResponse.json({ error: 'Database check failed' }, { status: 500 });
    }

    if (count && count > 0) {
      return NextResponse.json({ error: 'Setup already completed. Access denied.' }, { status: 403 });
    }

    // 2. Create the user in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error('Auth create error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const userId = authData.user.id;

    // 3. Add the user to admins table
    const { error: insertError } = await supabaseAdmin
      .from('admins')
      .insert({
        id: userId,
        email,
        role: 'superadmin'
      });

    if (insertError) {
      console.error('Admins insert error:', insertError);
      // Rollback: delete auth user if admins insert fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: 'Failed to insert admin record' }, { status: 500 });
    }

    // 4. Log the action
    await supabaseAdmin
      .from('admin_logs')
      .insert({
        admin_id: userId,
        action: 'system_initialized',
        details: { message: 'First super admin created successfully.' }
      });

    return NextResponse.json({ success: true, message: 'Super admin created successfully' });
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
