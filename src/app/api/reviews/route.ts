import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Sanitization stricte pour prévenir les failles XSS
function sanitizeText(input: string): string {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '') // Supprime les balises < et >
    .replace(/javascript:/gi, '')
    .trim();
}

// GET: Récupère les avis approuvés pour la vitrine publique
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('restaurant_reviews')
      .select('id, restaurant_name, owner_name, city, rating, comment, created_at')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      // Si la table n'est pas encore créée ou vide, retourner un tableau vide sans planter
      return NextResponse.json({ success: true, reviews: [] });
    }

    return NextResponse.json({ success: true, reviews: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: true, reviews: [] });
  }
}

// POST: Soumission d'un avis par un restaurateur authentifié
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Connexion requise pour laisser un avis restaurateur.' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Session invalide ou expirée.' },
        { status: 401 }
      );
    }

    // Récupérer le restaurant associé à cet utilisateur
    const { data: merchant, error: merchantError } = await supabaseAdmin
      .from('merchants')
      .select('id, business_name, city')
      .eq('id', user.id)
      .single();

    if (merchantError || !merchant) {
      return NextResponse.json(
        { success: false, error: 'Aucun restaurant actif associé à ce compte.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const rawRating = Number(body.rating);
    const rawComment = String(body.comment || '');
    const rawOwnerName = String(body.owner_name || '');

    // Validation stricte
    if (isNaN(rawRating) || rawRating < 1 || rawRating > 5) {
      return NextResponse.json(
        { success: false, error: 'La note doit être comprise entre 1 et 5 étoiles.' },
        { status: 400 }
      );
    }

    const cleanComment = sanitizeText(rawComment);
    if (cleanComment.length < 5 || cleanComment.length > 600) {
      return NextResponse.json(
        { success: false, error: 'Le commentaire doit contenir entre 5 et 600 caractères.' },
        { status: 400 }
      );
    }

    const cleanOwnerName = sanitizeText(rawOwnerName) || null;

    // Upsert sécurisé (1 restaurant = 1 avis unique)
    const { data, error } = await supabaseAdmin
      .from('restaurant_reviews')
      .upsert(
        {
          merchant_id: merchant.id,
          restaurant_name: merchant.business_name || 'Restaurant Partenaire',
          owner_name: cleanOwnerName,
          city: merchant.city || 'France',
          rating: Math.round(rawRating),
          comment: cleanComment,
          is_approved: true, // Approuvé par défaut, modérable en base
          created_at: new Date().toISOString(),
        },
        { onConflict: 'merchant_id' }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de l’enregistrement de votre avis.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Votre avis a été publié avec succès !',
      review: data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur.' },
      { status: 500 }
    );
  }
}
