import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Route POST /api/account/export
 * Exporte toutes les données du restaurant (profil, catégories, articles, récompenses)
 * au format JSON pour archivage / portabilité RGPD avant suppression de compte.
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Session invalide ou expirée.' }, { status: 401 });
    }

    const { merchantId } = await req.json();

    if (!merchantId) {
      return NextResponse.json({ error: 'Identifiant marchand manquant.' }, { status: 400 });
    }

    if (user.id !== merchantId) {
      return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403 });
    }

    // 1. Profil du restaurant
    const { data: merchant } = await supabaseAdmin
      .from('merchants')
      .select('id, business_name, slug, city, country, plan_tier, primary_color, google_maps_url, instagram_url, created_at')
      .eq('id', merchantId)
      .maybeSingle();

    if (!merchant) {
      return NextResponse.json({ error: 'Établissement introuvable.' }, { status: 404 });
    }

    // 2. Catégories du menu
    const { data: categories } = await supabaseAdmin
      .from('categories')
      .select('id, name, display_order, is_active')
      .eq('merchant_id', merchantId)
      .order('display_order', { ascending: true });

    // 3. Articles du menu
    const { data: menuItems } = await supabaseAdmin
      .from('menu_items')
      .select('id, category_id, name, description, price, allergens, dietary_tags, is_available, is_featured')
      .eq('merchant_id', merchantId);

    // 4. Récompenses de fidélité
    const { data: rewards } = await supabaseAdmin
      .from('rewards')
      .select('id, title, description, stamps_required, is_active')
      .eq('merchant_id', merchantId);

    // 5. Compte des clients
    const { count: customerCount } = await supabaseAdmin
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .eq('merchant_id', merchantId);

    const exportData = {
      export_date: new Date().toISOString(),
      platform: 'MenuFid Pro',
      restaurant: merchant,
      summary: {
        total_categories: categories?.length || 0,
        total_menu_items: menuItems?.length || 0,
        total_rewards: rewards?.length || 0,
        total_customers: customerCount || 0,
      },
      categories: categories || [],
      menu_items: menuItems || [],
      rewards: rewards || [],
    };

    return NextResponse.json(exportData);
  } catch (error: any) {
    console.error('[Account Export Error]:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de l\'exportation des données.' }, { status: 500 });
  }
}
