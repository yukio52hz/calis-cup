import type { EmailOtpType } from "@supabase/supabase-js";

import { NextResponse, type NextRequest } from "next/server";

import { ROUTES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/server/supabase/server";

// Destino de los enlaces de email de Supabase (confirmar cuenta, recuperar
// contraseña). Acepta token_hash (plantillas personalizadas, funciona desde
// cualquier dispositivo) o code (plantillas por defecto, flujo PKCE).
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? ROUTES.dashboard;
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : ROUTES.dashboard;

  const supabase = await createSupabaseServerClient();
  const { error } =
    tokenHash && type
      ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
      : code
        ? await supabase.auth.exchangeCodeForSession(code)
        : { error: new Error("Enlace inválido") };

  if (error) {
    const url = new URL(ROUTES.login, request.url);

    url.searchParams.set("error", "link");

    return NextResponse.redirect(url);
  }

  return NextResponse.redirect(new URL(next, request.url));
}
