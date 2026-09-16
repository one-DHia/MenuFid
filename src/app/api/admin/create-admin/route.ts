import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
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

    // Verify user is an admin
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('id')
      .eq('id', user.id)
      .single();

    if (adminError || !admin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

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

    // Create the user in Auth
    const { data: authData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createAuthError) {
      console.error('Auth create error:', createAuthError);
      return NextResponse.json({ error: createAuthError.message }, { status: 500 });
    }

    const newUserId = authData.user.id;

    // Add to admins table
    const { error: insertError } = await supabaseAdmin
      .from('admins')
      .insert({
        id: newUserId,
        email,
        role: 'superadmin'
      });

    if (insertError) {
      console.error('Admins insert error:', insertError);
      // Rollback: delete auth user if admins insert fails
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return NextResponse.json({ error: 'Failed to insert admin record' }, { status: 500 });
    }

    // Log the action
    await supabaseAdmin
      .from('admin_logs')
      .insert({
        admin_id: user.id,
        action: 'create_admin',
        target_id: newUserId,
        details: { email }
      });

    return NextResponse.json({ success: true, message: 'Admin created successfully' });
  } catch (error: any) {
    console.error('Create admin error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
