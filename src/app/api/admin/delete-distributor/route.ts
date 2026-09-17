import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

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

    const { distributorId } = await request.json();

    if (!distributorId) {
      return NextResponse.json({ error: 'Distributor ID is required' }, { status: 400 });
    }

    // 1. Get the distributor to find their user_id
    const { data: distributor, error: fetchError } = await supabaseAdmin
      .from('distributors')
      .select('user_id, email, name')
      .eq('id', distributorId)
      .single();

    if (fetchError || !distributor) {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
    }

    // 2. Delete the auth user
    if (distributor.user_id) {
      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(distributor.user_id);
      if (deleteAuthError) {
        console.error('Error deleting auth user:', deleteAuthError);
      }
    }

    // 3. Delete the distributor row
    const { error: deleteError } = await supabaseAdmin
      .from('distributors')
      .delete()
      .eq('id', distributorId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // 4. Log the action
    await supabaseAdmin
      .from('admin_logs')
      .insert({
        admin_id: user.id,
        action: 'delete_distributor',
        target_id: distributorId,
        details: { email: distributor.email, name: distributor.name }
      });

    return NextResponse.json({ success: true, message: 'Distributor deleted successfully' });
  } catch (error: any) {
    console.error('Delete distributor error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
