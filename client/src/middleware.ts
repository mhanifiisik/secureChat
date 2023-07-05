import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  if (pathname === '/chat') {
    const token = request.cookies.get('token');

    if (!token) {
      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/chat'],
};
