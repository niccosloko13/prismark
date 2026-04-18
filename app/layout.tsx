import type { Metadata } from "next";

import { CartProvider } from "@/components/cart/cart-provider";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { getSession } from "@/lib/auth";

import "./globals.css";

export const metadata: Metadata = {
  title: "Prismarq Comunicacao Visual",
  description:
    "Sistema online de grafica para configurar, enviar arte, acompanhar pedidos e operar a producao com agilidade.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="pt-BR">
      <body className="bg-white font-sans text-ink antialiased">
        <a
          href="#main"
          className="focus-ring absolute left-4 top-4 z-50 -translate-y-20 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition focus:translate-y-0"
        >
          Pular para o conteudo
        </a>
        <CartProvider>
          <div className="mx-auto min-h-screen max-w-[1600px] px-4 pb-8 pt-3 sm:px-5 sm:pb-10 sm:pt-4 lg:px-8">
            <SiteHeader session={session} />
            <main id="main" className="mt-5 sm:mt-6">
              {children}
            </main>
            <SiteFooter />
          </div>
          <WhatsAppFloat />
        </CartProvider>
      </body>
    </html>
  );
}
