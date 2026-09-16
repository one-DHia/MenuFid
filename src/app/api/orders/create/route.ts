import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { checkRateLimit } from '@/lib/rateLimit';
import { sanitizeInputText } from '@/lib/security';

/**
 * POST /api/orders/create
 * 🛡️ Cybersécurité & Anti-Fraude :
 * 1. Calcul 100% côté serveur des prix & totaux depuis `menu_items`. Le client ne peut pas falsifier les prix.
 * 2. Rate Limiting par IP & Téléphone (max 5 commandes/heure) anti-Spam DoS (fausses commandes à la porte).
 * 3. Validation de l'heure du restaurant sur l'horloge atomique du serveur (Timezone official).
 * 4. Contrôle bloquant du Panier Minimum (min_order_amount).
 * 5. Honeypot anti-bots invisibles.
 * 6. Sanitization HTML/XSS de l'adresse et des instructions.
 */
export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const body = await req.json();

    const {
      merchantId,
      merchantSlug,
      items,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      deliveryNotes,
      orderType = 'delivery',
      paymentMethod = 'cash_on_delivery',
      websiteHoneypot,
    } = body;

    // 1. Détection Honeypot (Bot Trap)
    if (websiteHoneypot && websiteHoneypot.trim() !== '') {
      return NextResponse.json({ success: true, message: 'Order processed' });
    }

    // 2. Validation des champs obligatoires
    if (!customerName || !customerPhone || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Veuillez renseigner votre nom, téléphone et au moins un article.' },
        { status: 400 }
      );
    }

    if (orderType === 'delivery' && !customerAddress) {
      return NextResponse.json(
        { error: "L'adresse de livraison est obligatoire." },
        { status: 400 }
      );
    }

    // 3. Rate Limiting anti-Spam DoS (max 5 commandes par heure par IP et par téléphone)
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    const rateLimitKey = `order-${ip}-${cleanPhone}`;
    const rateCheck = checkRateLimit(rateLimitKey, { limit: 5, windowMs: 60 * 60 * 1000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Trop de commandes passées récemment. Veuillez patienter avant de renouveler.' },
        { status: 429 }
      );
    }

    // 4. Récupération du restaurant
    let merchantQuery = supabaseAdmin.from('merchants').select('*');
    if (merchantId) {
      merchantQuery = merchantQuery.eq('id', merchantId);
    } else if (merchantSlug) {
      merchantQuery = merchantQuery.eq('slug', merchantSlug);
    } else {
      return NextResponse.json({ error: 'Restaurant non spécifié.' }, { status: 400 });
    }

    const { data: merchant, error: merchantErr } = await merchantQuery.single();
    if (merchantErr || !merchant) {
      return NextResponse.json({ error: 'Restaurant introuvable.' }, { status: 404 });
    }

    if (merchant.is_suspended) {
      return NextResponse.json(
        { error: "Cet établissement n'est pas disponible actuellement." },
        { status: 403 }
      );
    }

    // 5. Vérification du statut Pause Cuisine (Rush)
    if (merchant.orders_paused) {
      return NextResponse.json(
        { error: 'La prise de commande est temporairement suspendue par le restaurant (Coup de feu en cuisine).' },
        { status: 403 }
      );
    }

    // 6. Vérification des Horaires d'Ouverture (Horloge atomique serveur avec fuseau)
    const timezone = merchant.currency === 'DZD' ? 'Africa/Algiers' : 'Europe/Paris';
    const nowTimeStr = new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timezone,
    }).format(new Date());

    if (merchant.delivery_hours) {
      try {
        const hours = typeof merchant.delivery_hours === 'string'
          ? JSON.parse(merchant.delivery_hours)
          : merchant.delivery_hours;

        if (hours?.open && hours?.close) {
          const open = hours.open.replace(':', '');
          const close = hours.close.replace(':', '');
          const current = nowTimeStr.replace(':', '');

          // Gestion des heures normales ou traversant minuit
          let isOpen = false;
          if (open <= close) {
            isOpen = current >= open && current <= close;
          } else {
            // Traverse minuit (ex: 18:00 à 02:00)
            isOpen = current >= open || current <= close;
          }

          if (!isOpen) {
            return NextResponse.json(
              { error: `Le restaurant ne prend pas de commandes à cette heure. Horaires : ${hours.open} - ${hours.close}.` },
              { status: 403 }
            );
          }
        }
      } catch (e) {
        // En cas d'erreur de parse, continuer
      }
    }

    // 7. 🛡️ CALCUL 100% CÔTÉ SERVEUR (Protection Parameter / Price Tampering)
    const itemIds = items.map((i: any) => i.itemId || i.item_id).filter(Boolean);
    const { data: dbItems, error: itemsErr } = await supabaseAdmin
      .from('menu_items')
      .select('id, name, price, is_available')
      .in('id', itemIds)
      .eq('merchant_id', merchant.id);

    if (itemsErr || !dbItems || dbItems.length === 0) {
      return NextResponse.json({ error: 'Articles du panier invalides ou introuvables.' }, { status: 400 });
    }

    const dbItemsMap = new Map(dbItems.map((item: any) => [item.id, item]));

    let calculatedSubtotal = 0;
    const verifiedOrderItems = [];

    for (const clientItem of items) {
      const id = clientItem.itemId || clientItem.item_id;
      const quantity = Math.max(1, Math.min(50, Math.floor(Number(clientItem.quantity) || 1)));
      const dbItem = dbItemsMap.get(id);

      if (!dbItem) {
        return NextResponse.json({ error: `Article introuvable dans la carte.` }, { status: 400 });
      }

      if (dbItem.is_available === false) {
        return NextResponse.json({ error: `L'article "${dbItem.name}" n'est plus disponible.` }, { status: 400 });
      }

      const itemPrice = Number(dbItem.price) || 0;
      calculatedSubtotal += itemPrice * quantity;

      verifiedOrderItems.push({
        item_id: dbItem.id,
        name: dbItem.name,
        price: itemPrice,
        quantity,
        notes: sanitizeInputText(clientItem.notes || ''),
      });
    }

    // 8. Vérification du Panier Minimum (min_order_amount)
    const minOrderRequired = Number(merchant.min_order_amount) || 0;
    if (orderType === 'delivery' && calculatedSubtotal < minOrderRequired) {
      return NextResponse.json(
        {
          error: `Le montant minimum de commande pour la livraison est de ${minOrderRequired} ${merchant.currency || 'EUR'}. Votre panier est de ${calculatedSubtotal.toFixed(2)} ${merchant.currency || 'EUR'}.`,
        },
        { status: 400 }
      );
    }

    // 9. Calcul des frais de livraison et du total final
    const deliveryFee = orderType === 'delivery' ? (Number(merchant.delivery_fee) || 0) : 0;
    const finalTotalAmount = Number((calculatedSubtotal + deliveryFee).toFixed(2));

    // 10. Génération du numéro de commande (#ORD-XXXX)
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${randomDigits}`;

    // 11. Sanitisation des champs textes contre les injections XSS
    const sanitizedName = sanitizeInputText(customerName);
    const sanitizedAddress = customerAddress ? sanitizeInputText(customerAddress) : null;
    const sanitizedNotes = deliveryNotes ? sanitizeInputText(deliveryNotes) : null;

    // 12. Insertion dans la table `orders`
    const { data: newOrder, error: insertErr } = await supabaseAdmin
      .from('orders')
      .insert({
        merchant_id: merchant.id,
        order_number: orderNumber,
        customer_name: sanitizedName,
        customer_phone: cleanPhone,
        customer_email: customerEmail ? customerEmail.trim().toLowerCase() : null,
        customer_address: sanitizedAddress,
        delivery_notes: sanitizedNotes,
        order_type: orderType,
        items: verifiedOrderItems,
        subtotal: calculatedSubtotal,
        delivery_fee: deliveryFee,
        total_amount: finalTotalAmount,
        currency: merchant.currency || 'EUR',
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cash_on_delivery' ? 'cash_on_delivery' : 'pending',
        order_status: 'pending',
      })
      .select()
      .single();

    if (insertErr) {
      console.error('Order creation insert error:', insertErr);
      return NextResponse.json({ error: "Erreur lors de l'enregistrement de la commande." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      order: newOrder,
      message: 'Commande enregistrée avec succès !',
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne du serveur' }, { status: 500 });
  }
}
