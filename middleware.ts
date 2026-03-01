import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/dashboard", "/projects", "/issues"];
const authPaths = new Set(["/login", "/register"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user is trying to access protected routes
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    // Note: We can't access localStorage in middleware
    // Middleware runs on the server, localStorage is client-side only
    // We'll handle auth on the client side instead
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (authPaths.has(pathname)) {
    // Note: We can't access localStorage in middleware
    // We'll handle this on the client side
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
