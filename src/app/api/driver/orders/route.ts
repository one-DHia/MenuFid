import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyDriverSessionToken } from '@/lib/driverAuth';

export async function GET(req: NextRequest) {
  try {
    // Lire le token depuis le cookie ou le header Authorization
    const token =
      req.cookies.get('menufid_driver_token')?.value ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Session livreur requise.' },
        { status: 401 }
      );
    }

    const session = verifyDriverSessionToken(token);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session expirée. Veuillez vous reconnecter.' },
        { status: 401 }
      );
    }

    // Récupérer les commandes en cours de ce restaurant assignées à ce livreur ou disponibles
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('merchant_id', session.merchantId)
      .in('order_status', ['accepted', 'preparing', 'in_delivery'])
      .or(`assigned_driver_id.eq.${session.driverId},assigned_driver_id.is.null`)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ success: true, orders: [] });
    }

    return NextResponse.json({
      success: true,
      orders: orders || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Erreur interne lors de la récupération des commandes.' },
      { status: 500 }
    );
  }
}
