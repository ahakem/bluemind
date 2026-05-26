import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const DIVE_SITE_DOMAINS = ['freedive.one', 'www.freedive.one'];
const BLUEMIND_MAIN = 'https://bluemindfreediving.nl';

// Pages that belong to the Blue Mind school, not the dive directory
const SCHOOL_PATHS = [
  '/training', '/schedule', '/membership', '/community',
  '/gallery', '/contact', '/judging', '/documents', '/reviews', '/welcome',
];

export function middleware(request: NextRequest) {
  const host =
    request.headers.get('x-forwarded-host') ??
    request.headers.get('host') ??
    '';
  const isDiveSiteDomain =
    DIVE_SITE_DOMAINS.some((d) => host.includes(d)) ||
    process.env.NEXT_PUBLIC_FREEDIVE_ONE === 'true';

  if (isDiveSiteDomain) {
    const { pathname } = request.nextUrl;

    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/dive-sites', request.url));
    }

    // About → freedive.one-specific page
    if (pathname === '/about') {
      return NextResponse.rewrite(new URL('/dive-sites/about', request.url));
    }

    // Legal pages → freedive.one-specific pages
    if (pathname === '/privacy-policy') {
      return NextResponse.rewrite(new URL('/dive-sites/privacy', request.url));
    }
    if (pathname === '/terms-of-service') {
      return NextResponse.rewrite(new URL('/dive-sites/terms', request.url));
    }

    // School pages → redirect to Blue Mind main site
    if (SCHOOL_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
      return NextResponse.redirect(`${BLUEMIND_MAIN}${pathname}`);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
