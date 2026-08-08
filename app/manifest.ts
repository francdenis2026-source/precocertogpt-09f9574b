import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PreçoCerto — Economia Real em Feijó",
    short_name: "PreçoCerto",
    description: "Compare preços reais e monte a cesta mais econômica de Feijó.",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F8FC",
    theme_color: "#102A43",
    orientation: "portrait",
    lang: "pt-BR",
    icons: [
      { src: "/favicon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
