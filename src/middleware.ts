import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const DIVE_SITE_DOMAINS = ['freedive.one', 'www.freedive.one'];

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const isDiveSiteDomain = DIVE_SITE_DOMAINS.some((d) => host.includes(d));

  if (isDiveSiteDomain) {
    const { pathname } = request.nextUrl;

    // Root → serve dive sites listing
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/dive-sites', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
