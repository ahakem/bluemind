import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const DIVE_SITE_DOMAINS = ['freedive.one', 'www.freedive.one'];
const BLUEMIND_MAIN = 'https://bluemindfreediving.nl';

const SCHOOL_PATHS = [
  '/training', '/schedule', '/membership', '/community',
  '/gallery', '/contact', '/judging', '/documents', '/reviews', '/welcome',
];

// Paths on freedive.one that are NOT dive-site paths and should pass through as-is
const FREEDIVE_OWN_PATHS = [
  '/blog', '/about', '/privacy-policy', '/terms-of-service',
  '/admin', '/api', '/submit', '/_next',
];

function isFreediveOwnPath(pathname: string) {
  return FREEDIVE_OWN_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export function middleware(request: NextRequest) {
  const host =
    request.headers.get('x-forwarded-host') ??
    request.headers.get('host') ??
    '';

  const isDiveSiteDomain =
    DIVE_SITE_DOMAINS.some((d) => host.includes(d)) ||
    process.env.NEXT_PUBLIC_FREEDIVE_ONE === 'true';

  if (!isDiveSiteDomain) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // ── Already internally rewritten — skip to avoid infinite loop ──────────
  if (request.headers.get('x-freedive-rewrite') === '1') {
    return NextResponse.next();
  }

  // ── Root → dive sites listing ────────────────────────────────────────────
  if (pathname === '/') {
    return rewrite(request, '/dive-sites');
  }

  // ── Legal / about → dedicated freedive.one pages ────────────────────────
  if (pathname === '/about')           return rewrite(request, '/dive-sites/about');
  if (pathname === '/privacy-policy')  return rewrite(request, '/dive-sites/privacy');
  if (pathname === '/terms-of-service') return rewrite(request, '/dive-sites/terms');
  if (pathname === '/submit')          return rewrite(request, '/dive-sites/submit');

  // ── Strip /dive-sites prefix → redirect to clean URL ────────────────────
  if (pathname === '/dive-sites') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  if (pathname.startsWith('/dive-sites/')) {
    const clean = pathname.slice('/dive-sites'.length); // e.g. /country/egypt
    return NextResponse.redirect(new URL(clean, request.url));
  }

  // ── School pages → redirect to Blue Mind ────────────────────────────────
  if (SCHOOL_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.redirect(`${BLUEMIND_MAIN}${pathname}`);
  }

  // ── Clean dive-site paths → rewrite to /dive-sites/* ────────────────────
  if (!isFreediveOwnPath(pathname)) {
    return rewrite(request, '/dive-sites' + pathname);
  }

  return NextResponse.next();
}

function rewrite(request: NextRequest, destination: string) {
  const url = new URL(destination, request.url);
  // Copy search params so filters (?continent=Europe etc.) are preserved
  request.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));
  const headers = new Headers(request.headers);
  headers.set('x-freedive-rewrite', '1');
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
