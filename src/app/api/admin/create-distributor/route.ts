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

    const { name, email, password, code, city, country, commission_rate } = await request.json();

    if (!name || !email || !password || !code) {
      return NextResponse.json({ error: 'Name, email, password, and code are required' }, { status: 400 });
    }

    // 🔒 Validation mot de passe côté serveur
    if (password.length < 8) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' }, { status: 400 });
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins une lettre et un chiffre.' }, { status: 400 });
    }

    // 1. Create the Auth User for the distributor
    const { data: authData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'distributor' }
    });

    if (createAuthError) {
      console.error('Auth create error:', createAuthError);
      return NextResponse.json({ error: createAuthError.message }, { status: 500 });
    }

    const newDistributorId = authData.user.id;

    // 2. Insert into distributors table
    const { error: insertError } = await supabaseAdmin
      .from('distributors')
      .insert({
        user_id: newDistributorId,
        name,
        email,
        code,
        city: city || null,
        country: country || null,
        commission_rate: commission_rate || 10.00
      });

    if (insertError) {
      console.error('Distributors insert error:', insertError);
      // Optional: Delete auth user if distributor insert fails
      await supabaseAdmin.auth.admin.deleteUser(newDistributorId);
      return NextResponse.json({ error: insertError.message || 'Failed to insert distributor record' }, { status: 500 });
    }

    // 3. Log the action
    await supabaseAdmin
      .from('admin_logs')
      .insert({
        admin_id: user.id,
        action: 'create_distributor',
        target_id: newDistributorId,
        details: { name, email, code }
      });

    return NextResponse.json({ success: true, message: 'Distributor created successfully' });
  } catch (error: any) {
    console.error('Create distributor error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
