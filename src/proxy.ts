import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * proxy.ts / Route Guard
 * ─────────────────────────────────────────────────────────────
 * Sécurité des Routes SaaS :
 * 1. Bloque tous les accès non authentifiés au /dashboard (* /login)
 * 2. Redirige les commerçants déjà connectés de /login & /register vers le /dashboard
 * 3. Gestion transparente du sous-domaine / domaine personnalisé pour les menus QR et cartes fidélité
 */

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Exclure les fichiers statiques, API Next.js et Sentry tunnel
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/monitoring') ||
    url.pathname.startsWith('/static') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Vérifier le cookie d'authentification du commerçant (ou session Supabase)
  const allCookies = request.cookies.getAll();
  const hasMerchantSession = allCookies.some(
    (c) => c.name === 'menufid_merchant_id' || c.name.startsWith('sb-')
  );

  const isProProtectedRoute = (
    url.pathname.startsWith('/pro/') && 
    !['/pro/login', '/pro/register', '/pro/forgot-password', '/pro/reset-password', '/pro/deleted'].includes(url.pathname)
  ) || url.pathname.startsWith('/dashboard');

  // 🔒 1. Protection du SaaS Pro : Redirection immédiate vers /pro/login si non connecté
  if (isProProtectedRoute && !hasMerchantSession) {
    url.pathname = '/pro/login';
    return NextResponse.redirect(url);
  }

  // 🌐 3. Routage Domaine Personnalisé (Menu QR & Carte Fidélité)
  const mainDomains = ['localhost', 'menufid.site', 'menufid.com', 'menufid.vercel.app', 'vercel.app'];
  const isMainDomain = mainDomains.some((domain) => hostname.includes(domain));

  if (!isMainDomain) {
    if (url.pathname.startsWith('/loyalty')) {
      const customerId = url.pathname.split('/').pop() || '';
      if (customerId && customerId !== 'loyalty') {
        url.pathname = `/loyalty/domain/${hostname}/${customerId}`;
      } else {
        url.pathname = `/loyalty/domain/${hostname}/register`;
      }
    } else {
      url.pathname = `/menu/domain/${hostname}${url.pathname}`;
    }

    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
