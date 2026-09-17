import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyDriverSessionToken } from '@/lib/driverAuth';

export async function POST(req: NextRequest) {
  try {
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

    const body = await req.json();
    const orderId = String(body.orderId || '');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Identifiant de commande manquant.' },
        { status: 400 }
      );
    }

    // Récupérer la commande
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('merchant_id', session.merchantId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: 'Commande introuvable ou non autorisée pour votre établissement.' },
        { status: 404 }
      );
    }

    if (order.order_status === 'delivered') {
      return NextResponse.json(
        { success: false, error: 'Cette commande a déjà été marquée comme livrée.' },
        { status: 400 }
      );
    }

    const isCash = order.payment_method === 'cash_on_delivery';

    if (isCash) {
      // 💵 ENCAISSEMENT EN ESPÈCES : Mise à jour atomique & ajout sécurisé de 1 point de fidélité
      const { data: updatedOrder, error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          order_status: 'delivered',
          driver_cash_collected: true,
          points_awarded: true,
          assigned_driver_id: session.driverId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .eq('points_awarded', false) // Verrou d'idempotence anti-double clic
        .select()
        .single();

      if (updateError || !updatedOrder) {
        return NextResponse.json(
          { success: false, error: 'La commande a déjà été traitée ou les points ont déjà été crédités.' },
          { status: 409 }
        );
      }

      // Crédit de 1 point de fidélité sur le compte client
      if (order.customer_phone) {
        try {
          // 1. Trouver ou créer le client par numéro de téléphone
          let customerId: string | null = null;
          const { data: existingCustomer } = await supabaseAdmin
            .from('customers')
            .select('id')
            .eq('phone', order.customer_phone)
            .maybeSingle();

          if (existingCustomer) {
            customerId = existingCustomer.id;
          } else {
            const { data: newCustomer } = await supabaseAdmin
              .from('customers')
              .insert({
                phone: order.customer_phone,
                full_name: order.customer_name || 'Client',
                email: order.customer_email || null,
              })
              .select('id')
              .single();
            if (newCustomer) customerId = newCustomer.id;
          }

          if (customerId) {
            // 2. Trouver ou créer la carte de fidélité pour ce restaurant
            const { data: existingCard } = await supabaseAdmin
              .from('loyalty_cards')
              .select('id, stamps_count, total_visits')
              .eq('customer_id', customerId)
              .eq('merchant_id', session.merchantId)
              .maybeSingle();

            if (existingCard) {
              const newStamps = (existingCard.stamps_count || 0) + 1;
              const newVisits = (existingCard.total_visits || 0) + 1;

              await supabaseAdmin
                .from('loyalty_cards')
                .update({
                  stamps_count: newStamps,
                  total_visits: newVisits,
                  last_visit_at: new Date().toISOString(),
                })
                .eq('id', existingCard.id);

              await supabaseAdmin.from('stamp_transactions').insert({
                loyalty_card_id: existingCard.id,
                merchant_id: session.merchantId,
                stamps_change: 1,
                note: `+1 point fidélité livraison espèces encaissée (Livreur: ${session.name})`,
              });
            } else {
              const { data: newCard } = await supabaseAdmin
                .from('loyalty_cards')
                .insert({
                  customer_id: customerId,
                  merchant_id: session.merchantId,
                  stamps_count: 1,
                  total_visits: 1,
                  last_visit_at: new Date().toISOString(),
                })
                .select('id')
                .single();

              if (newCard) {
                await supabaseAdmin.from('stamp_transactions').insert({
                  loyalty_card_id: newCard.id,
                  merchant_id: session.merchantId,
                  stamps_change: 1,
                  note: `+1er point fidélité livraison espèces encaissée (Livreur: ${session.name})`,
                });
              }
            }
          }
        } catch (stampErr) {
          console.error('[DriverDelivery] Erreur attribution tampon fidélité:', stampErr);
        }
      }

      return NextResponse.json({
        success: true,
        pointsAwarded: true,
        message: 'Livraison en espèces encaissée avec succès ! +1 Point de fidélité crédité au client.',
      });
    } else {
      // 💳 PAIEMENT STRIPE (Déjà encaissé en ligne) : Marquer comme livrée sans double point
      await supabaseAdmin
        .from('orders')
        .update({
          order_status: 'delivered',
          assigned_driver_id: session.driverId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      return NextResponse.json({
        success: true,
        pointsAwarded: false,
        message: 'Livraison confirmée. Le paiement Stripe et le point fidélité avaient déjà été traités en ligne.',
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Erreur interne lors de la validation de livraison.' },
      { status: 500 }
    );
  }
}
