import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { checkRateLimit } from '@/lib/rateLimit';

/**
 * GET /api/merchants/[slug]/track-scan
 * 🔒 SÉCURISÉ : Utilise supabaseAdmin pour garantir l'incrémentation SQL du scan_count
 * avec rate limiting pour éviter les abus.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // 🔒 Rate limiting : 5 req/min par IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    const rateCheck = checkRateLimit(`track-scan-${ip}`, { limit: 5, windowMs: 60 * 1000 });

    if (!rateCheck.success) {
      // Retourner succès silencieusement pour ne pas bloquer l'UX
      return NextResponse.json({ success: true, throttled: true });
    }

    const { slug } = await params;

    // Valider le slug
    if (!slug || !/^[a-z0-9_-]+$/i.test(slug)) {
      return NextResponse.json({ error: 'Slug invalide' }, { status: 400 });
    }

    const { data: merchant, error: fetchError } = await supabaseAdmin
      .from('merchants')
      .select('id, scan_count')
      .eq('slug', slug)
      .single();
      
    if (fetchError || !merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }
    
    const newCount = (merchant.scan_count || 0) + 1;
    
    const { error: updateError } = await supabaseAdmin
      .from('merchants')
      .update({ scan_count: newCount })
      .eq('id', merchant.id);
      
    if (updateError) {
      console.error('[TrackScan Error]:', updateError);
      return NextResponse.json({ error: 'Failed to update scan count' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, count: newCount });
  } catch (error) {
    console.error('[TrackScan Server Error]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
