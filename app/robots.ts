import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/app", "/login", "/cadastro", "/checkout", "/perfil", "/financas"] },
    ],
    sitemap: "/sitemap.xml",
  };
}
