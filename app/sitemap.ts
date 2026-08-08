import type { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const routes = ["/", "/buscar", "/precos", "/melhores-precos", "/precos-por-categoria", "/comparador", "/onde-comprar", "/estabelecimentos", "/mapa", "/farmacias", "/cesta", "/cesta-basica", "/planos", "/colaborar", "/lojista", "/privacidade", "/fale-conosco"];
  return routes.map((route, index) => ({ url: `${origin}${route}`, changeFrequency: index === 0 ? "daily" : "weekly", priority: index === 0 ? 1 : .7 }));
}
