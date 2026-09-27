import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { fontDisplay, fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import { getSession } from "@/server/auth/session";
import { signOutAction } from "@/features/users/auth-actions";

import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#11141c" },
    { media: "(prefers-color-scheme: dark)", color: "#11141c" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html suppressHydrationWarning lang="es">
      <head />
      {/* suppressHydrationWarning: extensiones (ej. ColorZilla) agregan atributos al body */}
      <body
        suppressHydrationWarning
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable,
          fontDisplay.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", forcedTheme: "dark" }}>
          <div className="relative flex min-h-screen flex-col">
            <Navbar
              isAdmin={session?.profile?.role === "admin"}
              isSignedIn={Boolean(session)}
              signOutAction={signOutAction}
            />
            <main className="flex-grow">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
