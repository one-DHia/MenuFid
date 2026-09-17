import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/orders/customer?phone=...&merchantId=...&slug=...
 * Récupère l'historique des commandes d'un client dans un restaurant
 * avec le statut en direct et les coordonnées du livreur assigné.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    const merchantId = searchParams.get('merchantId');
    const merchantSlug = searchParams.get('slug');

    if (!phone) {
      return NextResponse.json(
        { error: 'Numéro de téléphone requis.' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 6) {
      return NextResponse.json(
        { error: 'Numéro de téléphone invalide.' },
        { status: 400 }
      );
    }

    let targetMerchantId = merchantId;

    if (!targetMerchantId && merchantSlug) {
      const { data: merchant } = await supabaseAdmin
        .from('merchants')
        .select('id')
        .eq('slug', merchantSlug)
        .maybeSingle();

      if (merchant) {
        targetMerchantId = merchant.id;
      }
    }

    let query = supabaseAdmin
      .from('orders')
      .select(`
        id,
        order_number,
        order_type,
        order_status,
        payment_method,
        payment_status,
        subtotal,
        delivery_fee,
        total_amount,
        currency,
        items,
        customer_address,
        delivery_notes,
        points_awarded,
        created_at,
        assigned_driver:delivery_drivers(
          id,
          name,
          phone
        )
      `)
      .eq('customer_phone', cleanPhone)
      .order('created_at', { ascending: false })
      .limit(20);

    if (targetMerchantId) {
      query = query.eq('merchant_id', targetMerchantId);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching customer orders:', error);
      // En cas de relation delivery_drivers non encore en cache, repli sans join
      const { data: fallbackOrders } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('customer_phone', cleanPhone)
        .order('created_at', { ascending: false })
        .limit(20);

      return NextResponse.json({ orders: fallbackOrders || [] });
    }

    return NextResponse.json({ orders: orders || [] });
  } catch (error: any) {
    console.error('Customer orders API error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne' },
      { status: 500 }
    );
  }
}
