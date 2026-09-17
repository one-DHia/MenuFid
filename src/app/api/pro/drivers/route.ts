import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { hashPassword } from '@/lib/driverAuth';

async function getAuthenticatedMerchant(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;

  const { data: merchant } = await supabaseAdmin
    .from('merchants')
    .select('id, business_name')
    .eq('user_id', user.id)
    .single();

  return merchant || null;
}

// GET: Liste des livreurs du restaurant
export async function GET(req: NextRequest) {
  try {
    const merchant = await getAuthenticatedMerchant(req);
    if (!merchant) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const { data: drivers, error } = await supabaseAdmin
      .from('delivery_drivers')
      .select('id, name, username, phone, is_active, created_at')
      .eq('merchant_id', merchant.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: true, drivers: [] });
    }

    return NextResponse.json({ success: true, drivers: drivers || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Création d'un livreur avec identifiant et mot de passe personnalisés
export async function POST(req: NextRequest) {
  try {
    const merchant = await getAuthenticatedMerchant(req);
    if (!merchant) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const name = String(body.name || '').trim();
    const username = String(body.username || '').trim().toLowerCase();
    const password = String(body.password || '');
    const phone = String(body.phone || '').trim() || null;

    if (!name || !username || !password) {
      return NextResponse.json(
        { success: false, error: 'Nom, identifiant et mot de passe requis.' },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { success: false, error: 'Le mot de passe doit contenir au moins 4 caractères.' },
        { status: 400 }
      );
    }

    // Vérifier si l'identifiant existe déjà pour ce restaurant
    const { data: existing } = await supabaseAdmin
      .from('delivery_drivers')
      .select('id')
      .eq('merchant_id', merchant.id)
      .eq('username', username)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, error: `L'identifiant "${username}" est déjà utilisé dans votre restaurant.` },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);

    const { data: newDriver, error: insertError } = await supabaseAdmin
      .from('delivery_drivers')
      .insert({
        merchant_id: merchant.id,
        name,
        username,
        password_hash: passwordHash,
        phone,
        is_active: true,
      })
      .select('id, name, username, phone, is_active, created_at')
      .single();

    if (insertError) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création du livreur: ' + insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Livreur ${name} créé avec succès !`,
      driver: newDriver,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PATCH: Activer/Désactiver un livreur ou réinitialiser son mot de passe
export async function PATCH(req: NextRequest) {
  try {
    const merchant = await getAuthenticatedMerchant(req);
    if (!merchant) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const driverId = String(body.driverId || '');
    if (!driverId) {
      return NextResponse.json({ success: false, error: 'Identifiant du livreur requis.' }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {};
    if (typeof body.is_active === 'boolean') {
      updatePayload.is_active = body.is_active;
    }
    if (body.password) {
      updatePayload.password_hash = hashPassword(String(body.password));
    }
    if (body.phone !== undefined) {
      updatePayload.phone = body.phone;
    }

    const { data: updated, error } = await supabaseAdmin
      .from('delivery_drivers')
      .update(updatePayload)
      .eq('id', driverId)
      .eq('merchant_id', merchant.id)
      .select('id, name, username, phone, is_active, created_at')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, driver: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Supprimer un livreur
export async function DELETE(req: NextRequest) {
  try {
    const merchant = await getAuthenticatedMerchant(req);
    if (!merchant) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const driverId = searchParams.get('id');
    if (!driverId) {
      return NextResponse.json({ success: false, error: 'ID livreur manquant' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('delivery_drivers')
      .delete()
      .eq('id', driverId)
      .eq('merchant_id', merchant.id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Livreur supprimé' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
