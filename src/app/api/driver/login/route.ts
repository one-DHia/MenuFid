import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyPassword, createDriverSessionToken } from '@/lib/driverAuth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = String(body.username || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Identifiant et mot de passe requis.' },
        { status: 400 }
      );
    }

    // Récupérer le livreur actif par identifiant
    const { data: driver, error: driverError } = await supabaseAdmin
      .from('delivery_drivers')
      .select('id, merchant_id, name, username, password_hash, is_active, phone')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (driverError || !driver) {
      return NextResponse.json(
        { success: false, error: 'Identifiant ou mot de passe incorrect.' },
        { status: 401 }
      );
    }

    // Vérification cryptographique du mot de passe
    const isValid = verifyPassword(password, driver.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Identifiant ou mot de passe incorrect.' },
        { status: 401 }
      );
    }

    // Récupérer le nom du restaurant
    const { data: merchant } = await supabaseAdmin
      .from('merchants')
      .select('id, business_name, city, currency')
      .eq('id', driver.merchant_id)
      .single();

    // Créer le jeton de session signé HMAC
    const sessionToken = createDriverSessionToken({
      driverId: driver.id,
      merchantId: driver.merchant_id,
      name: driver.name,
      username: driver.username,
    });

    const isProduction = process.env.NODE_ENV === 'production';
    const response = NextResponse.json({
      success: true,
      driver: {
        id: driver.id,
        name: driver.name,
        username: driver.username,
        merchant_id: driver.merchant_id,
        restaurant_name: merchant?.business_name || 'Restaurant',
        currency: merchant?.currency || 'EUR',
      },
      token: sessionToken,
    });

    // Poser le cookie HTTP-Only sécurisé
    response.cookies.set('menufid_driver_token', sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 heures
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur lors de la connexion.' },
      { status: 500 }
    );
  }
}
