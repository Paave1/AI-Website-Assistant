import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import createMiddleware from 'next-intl/middleware';

const locales = ['en', 'fi'] as const;
const defaultLocale = 'en';

const intlMiddleware = createMiddleware({
  locales: Array.from(locales),
  defaultLocale
});

function isValidBasicAuth(authorization: string | null): boolean {
  if (!authorization || !authorization.startsWith('Basic ')) return false;
  const expectedUser = process.env.BASIC_AUTH_USER || '';
  const expectedPass = process.env.BASIC_AUTH_PASS || '';
  if (!expectedUser || !expectedPass) return true; // no-op if not configured
  try {
    const base64Credentials = authorization.slice('Basic '.length).trim();
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
    const [username, password] = credentials.split(':');
    return username === expectedUser && password === expectedPass;
  } catch {
    return false;
  }
}

export default function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;

  // Basic auth for /admin (any locale prefix handled after)
  if (pathname.startsWith('/admin') || pathname.match(/^\/(en|fi)\/admin(\/|$)/)) {
    const header = request.headers.get('authorization');
    const ok = isValidBasicAuth(header);
    if (!ok) {
      return new NextResponse('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin", charset="UTF-8"' }
      });
    }
  }

  return intlMiddleware(request);
}

export const config = {
  // Skip next internal and static
  matcher: ['/((?!_next|.*\..*).*)']
};



