import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const PUBLIC_PATHS = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let public auth routes through unconditionally
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Every other route requires the auth cookie set by src/lib/auth.ts
  const authCookie = request.cookies.get('telohive_auth');

  if (!authCookie?.value) {
    const loginUrl = new URL('/login', request.url);
    // Preserve intended destination so the login page can redirect back
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run on every path except:
     *  - Next.js internals (_next/static, _next/image)
     *  - Static assets (favicon, sitemap, robots)
     *  - API routes
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)',
  ],
};
