import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Exclude static assets, api routes, and Next.js internals
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/static') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Define main SaaS domains
  const mainDomains = ['localhost', 'menufid.site', 'menufid.com', 'menufid.vercel.app', 'vercel.app'];
  const isMainDomain = mainDomains.some(domain => hostname.includes(domain));

  if (!isMainDomain) {
    // This is a custom domain (e.g. menu.myrestaurant.com)
    // We rewrite the request to the dynamic custom domain route
    console.log(`[Middleware] Rewriting custom domain ${hostname} request to /menu/domain/${hostname}`);
    
    // Rewrite path from '/' to '/menu/domain/[hostname]'
    // or '/loyalty/[customerId]' to '/loyalty/domain/[hostname]/[customerId]'
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

// Configure middleware matcher
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. Static files (e.g. favicon.ico, images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
