import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";

import { CartProvider } from "@/components/cart/cart-provider";
import { CookieConsent } from "@/components/cookies/cookie-consent";
import { BodyRouteClass } from "@/components/layout/body-route-class";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { getSession } from "@/lib/auth";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });

export const metadata: Metadata = {
  title: "Prismarq Comunicação Visual",
  description:
    "Sistema online de gráfica para configurar, enviar arte, acompanhar pedidos e operar a produção com agilidade.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="pt-BR" className={`${inter.variable} ${sora.variable}`}>
      <body className="min-h-screen bg-[#05070d] font-sans text-white antialiased">
        <a
          href="#main"
          className="focus-ring absolute left-4 top-4 z-50 -translate-y-20 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition focus:translate-y-0"
        >
          Pular para o conteúdo
        </a>
        <CartProvider>
          <BodyRouteClass />
          <div className="mx-auto min-h-screen min-w-0 max-w-[1600px] px-4 pb-32 pt-3 sm:px-6 sm:pb-10 sm:pt-5 lg:px-8">
            <SiteHeader session={session} />
            <main id="main" className="mt-3 sm:mt-6">
              {children}
            </main>
            <SiteFooter />
          </div>
          <CookieConsent />
          <WhatsAppFloat />
        </CartProvider>
      </body>
    </html>
  );
}
