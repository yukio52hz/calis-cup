import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/server/supabase/proxy";
import { ROUTES } from "@/lib/constants";

const PROTECTED_PREFIXES = [
  ROUTES.dashboard,
  ROUTES.admin,
  ROUTES.onboarding,
  ROUTES.resetPassword,
];

// Refresca la sesión de Supabase y hace un chequeo optimista de login.
// Perfil y rol se verifican en server/auth/dal.ts.
export async function proxy(request: NextRequest) {
  const { response, isSignedIn } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (
    !isSignedIn &&
    PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    const url = new URL(ROUTES.login, request.url);

    url.searchParams.set("next", pathname);

    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Todo excepto internals de Next y archivos estáticos
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
