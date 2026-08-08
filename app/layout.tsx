import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  return {
    metadataBase: new URL(origin),
    title: "PreçoCerto — Economia Real em Feijó",
    description: "Compare preços reais em supermercados e comércios de Feijó. Encontre a melhor cesta e economize antes de comprar.",
    applicationName: "PreçoCerto",
    keywords: ["preços", "Feijó", "Acre", "supermercados", "economia", "cesta básica"],
    icons: { icon: "/favicon.png", apple: "/favicon.png" },
    openGraph: { title: "PreçoCerto — Economia Real em Feijó", description: "Antes de comprar, compare com o PreçoCerto.", locale: "pt_BR", type: "website", images: [{ url: `${origin}/og-profissional.png`, width: 1200, height: 630, alt: "PreçoCerto — Compre melhor. Gaste menos." }] },
    twitter: { card: "summary_large_image", title: "PreçoCerto", description: "O menor preço, na hora certa.", images: [`${origin}/og-profissional.png`] },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
