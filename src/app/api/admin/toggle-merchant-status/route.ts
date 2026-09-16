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

    const { merchantId, isSuspended, extendDays } = await request.json();

    if (!merchantId) {
      return NextResponse.json({ error: 'Merchant ID is required' }, { status: 400 });
    }

    const updates: Record<string, any> = {};

    if (extendDays && typeof extendDays === 'number') {
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + extendDays);
      updates.subscription_expires_at = newExpiry.toISOString();
      updates.is_suspended = false;
      updates.deactivated_at = null;
      updates.plan_status = 'active';
    } else if (typeof isSuspended === 'boolean') {
      updates.is_suspended = isSuspended;
      if (isSuspended) {
        updates.deactivated_at = new Date().toISOString();
        updates.plan_status = 'past_due';
      } else {
        updates.deactivated_at = null;
        updates.plan_status = 'active';
        // Si l'abonnement était expiré, on lui redonne 30 jours
        const newExpiry = new Date();
        newExpiry.setDate(newExpiry.getDate() + 30);
        updates.subscription_expires_at = newExpiry.toISOString();
      }
    }

    // Toggle status
    const { error: updateError } = await supabaseAdmin
      .from('merchants')
      .update(updates)
      .eq('id', merchantId);

    if (updateError) {
      console.error('Update merchant error:', updateError);
      return NextResponse.json({ error: 'Failed to update merchant' }, { status: 500 });
    }

    // Log the action
    await supabaseAdmin
      .from('admin_logs')
      .insert({
        admin_id: user.id,
        action: isSuspended ? 'suspend_merchant' : 'activate_merchant',
        target_id: merchantId,
        details: { merchant_id: merchantId }
      });

    return NextResponse.json({ success: true, message: 'Merchant status updated' });
  } catch (error: any) {
    console.error('Toggle merchant error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
