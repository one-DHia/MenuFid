import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // 1. Fetch the user details using Supabase Admin Auth
    const { data: { user }, error: fetchError } = await supabaseAdmin.auth.getUser(userId);
    if (fetchError || !user) {
      // If auth.getUser doesn't work for admin lookup, fallback to auth.admin.getUserById
      const { data: adminAuthData, error: adminFetchError } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (adminFetchError || !adminAuthData?.user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return proceedRollback(adminAuthData.user);
    }
    
    return proceedRollback(user);
  } catch (error: any) {
    console.error('Auth rollback error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function proceedRollback(user: any) {
  const userId = user.id;

  // 2. Security validation: Only allow rollback for users created in the last 5 minutes
  const createdAt = new Date(user.created_at);
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  if (diffMs > 5 * 60 * 1000) {
    return NextResponse.json({ error: 'Rollback window expired' }, { status: 400 });
  }

  // 3. Security validation: Ensure no profile exists in any profile tables (customers, admins, distributors, merchants)
  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (customer) {
    return NextResponse.json({ error: 'User profile already exists' }, { status: 400 });
  }

  const { data: admin } = await supabaseAdmin
    .from('admins')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (admin) {
    return NextResponse.json({ error: 'User profile already exists' }, { status: 400 });
  }

  const { data: distributor } = await supabaseAdmin
    .from('distributors')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (distributor) {
    return NextResponse.json({ error: 'User profile already exists' }, { status: 400 });
  }

  const { data: merchant } = await supabaseAdmin
    .from('merchants')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (merchant) {
    return NextResponse.json({ error: 'User profile already exists' }, { status: 400 });
  }

  // 4. Safely delete the Auth User
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (deleteError) {
    console.error('Delete auth user error:', deleteError);
    return NextResponse.json({ error: 'Failed to delete auth user' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
