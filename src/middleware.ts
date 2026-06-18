import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { authLimiter, clientIpFromHeaders, enforceRateLimit } from '@/lib/ratelimit';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/auth')) {
    const ip = clientIpFromHeaders(request.headers);
    const rate = await enforceRateLimit(authLimiter, `auth:${ip}`);
    if (!rate.success) {
      return NextResponse.json({ error: rate.error }, { status: 429 });
    }
  }

  // Basic protection for /admin - full auth check in server components/layouts
  if (pathname.startsWith('/admin')) {
    const sessionToken = request.cookies.get('better-auth.session_token')?.value;
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    // Role check happens in /admin/layout.tsx via requireAdmin()
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/auth/:path*'],
};
