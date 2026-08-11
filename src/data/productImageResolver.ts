import type { Product } from "./catalog";

type AssetMeta = { url?: string; original_filename?: string; content_type?: string };

const assetModules = import.meta.glob("../assets/*.{png,jpg,jpeg,webp,avif}.asset.json", {
  eager: true,
  import: "default",
}) as Record<string, AssetMeta>;

const normalize = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/\.(png|jpe?g|webp|avif)$/g, "")
  .replace(/[^a-z0-9]+/g, "")
  .trim();

const localAssets = Object.entries(assetModules)
  .map(([path, meta]) => {
    if (!meta?.url) return null;
    const source = meta.original_filename || path.replace(/^.*\//, "").replace(/\.asset\.json$/i, "");
    return { url: meta.url, key: normalize(source) };
  })
  .filter((item): item is { url: string; key: string } => Boolean(item?.url && item.key));

export function resolveProductImage(product: Product): string | undefined {
  if (product.image_url) return product.image_url;

  const candidates = [
    product.slug ? normalize(String(product.slug)) : "",
    normalize(product.name || ""),
    normalize([product.name, product.brand, product.size].filter(Boolean).join(" ")),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const exact = localAssets.find(asset => asset.key === candidate);
    if (exact) return exact.url;
  }

  // Only use a fuzzy match when both keys are specific enough to avoid
  // assigning an unrelated image to a generic product name.
  for (const candidate of candidates.filter(key => key.length >= 8)) {
    const fuzzy = localAssets.find(asset =>
      asset.key.length >= 8 && (asset.key.includes(candidate) || candidate.includes(asset.key)),
    );
    if (fuzzy) return fuzzy.url;
  }

  return undefined;
}
