import PrecoCertoApp from "../PrecoCertoApp";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ path: string[] }> }): Promise<Metadata> {
  const { path } = await params;
  const pathname = `/${path.join("/")}`;
  const privateRoute = pathname.startsWith("/admin") || pathname.startsWith("/app") || ["/login", "/cadastro", "/onboarding", "/checkout", "/perfil", "/financas"].some(route => pathname.startsWith(route));
  return { robots: privateRoute ? { index: false, follow: false } : { index: true, follow: true }, alternates: { canonical: pathname } };
}

export default function AnyPrecoCertoRoute() {
  return <PrecoCertoApp />;
}
