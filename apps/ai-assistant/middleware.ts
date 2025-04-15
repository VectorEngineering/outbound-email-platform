import { navigationConfig } from '@/config/navigation';
import { EU_COUNTRIES } from './constants/countries';
import { geolocation } from '@vercel/functions';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const disabledRoutes = Object.values(navigationConfig)
  .flatMap((section) => section.sections)
  .flatMap((group) => group.items)
  .filter((item) => item.disabled && item.url !== '#')
  .map((item) => item.url);

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const geo = geolocation(request);
  const country = geo.countryRegion || '';

  response.headers.set('x-user-country', country);

  const isEuRegion = EU_COUNTRIES.includes(country);
  response.headers.set('x-user-eu-region', String(isEuRegion));

  if (process.env.NODE_ENV === 'development') {
    response.headers.set('x-user-eu-region', 'true');
  }

  const pathname = request.nextUrl.pathname;
  if (disabledRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/mail/inbox', request.url));
  }

  return response;
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
