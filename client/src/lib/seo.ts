// Shared SEO metadata. Used at runtime (usePageMeta) and at build time
// (script/prerender.ts) so crawlers and the SPA always agree.
// Keep imports relative (no "@/" alias) so the build script can load this file.
import type { Miner } from "../data/miners";

export const SITE_URL = "https://minergear.io";
export const SITE_NAME = "MinerGear";

export interface PageMeta {
  path: string;
  title: string;
  description: string;
  image?: string;
  jsonLd?: Record<string, unknown>[];
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icons/icon-512.png`,
  email: "minergear.io@gmail.com",
};

export const homeMeta: PageMeta = {
  path: "/",
  title: "MinerGear — ASIC Miner Prices, Specs & Accessories Guide (2026)",
  description:
    "Compare 2026 ASIC and home Bitcoin miners — Antminer S23, Avalon A16, Whatsminer, Bitaxe and more — with vendor prices, specs, and the power supplies, cooling and accessories each one needs.",
};

export const learnMeta: PageMeta = {
  path: "/learn",
  title: "Mining 101 — Beginner's Guide to Bitcoin Mining Hardware | MinerGear",
  description:
    "Learn the basics of crypto mining hardware: hashrate, efficiency (J/TH), power, cooling, noise, pools and firmware — and how to choose your first miner.",
};

export const disclaimerMeta: PageMeta = {
  path: "/disclaimer",
  title: "Disclaimer & Affiliate Disclosure | MinerGear",
  description:
    "MinerGear's legal disclaimer and FTC affiliate disclosure. As an Amazon Associate I earn from qualifying purchases.",
};

export const notFoundMeta: PageMeta = {
  path: "/404",
  title: "Page Not Found | MinerGear",
  description: "This page doesn't exist. Browse ASIC miners and accessories on MinerGear.",
};

function usd(price: string): number | null {
  if (!price.trim().startsWith("$")) return null;
  const n = parseFloat(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function minerMeta(miner: Miner, imagePath?: string): PageMeta {
  const path = `/miner/${miner.id}`;
  const legacy = miner.legacy ? " (legacy)" : "";
  const title = `${miner.name}${legacy} — Price, Specs & Accessories | MinerGear`;
  const description =
    `${miner.name} by ${miner.manufacturer}: ${miner.hashrate}, ${miner.power}, ${miner.efficiency}. ` +
    `Compare prices from ${miner.vendors.length} vendor${miner.vendors.length === 1 ? "" : "s"} (${miner.priceRange}) ` +
    `and see ${miner.accessories.length} recommended accessories.`;
  const image = imagePath ? `${SITE_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}` : undefined;

  const offers = miner.vendors
    .map((v) => ({ v, price: usd(v.price) }))
    .filter((o): o is { v: typeof o.v; price: number } => o.price !== null)
    .map(({ v, price }) => ({
      "@type": "Offer",
      price: price.toFixed(2),
      priceCurrency: "USD",
      availability: v.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: v.url,
      seller: { "@type": "Organization", name: v.store },
    }));

  const product: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: miner.name,
    brand: { "@type": "Brand", name: miner.manufacturer },
    description,
    url: `${SITE_URL}${path}`,
    category: "Cryptocurrency Mining Hardware",
    additionalProperty: [
      { "@type": "PropertyValue", name: "Algorithm", value: miner.algorithm },
      { "@type": "PropertyValue", name: "Hashrate", value: miner.hashrate },
      { "@type": "PropertyValue", name: "Power", value: miner.power },
      { "@type": "PropertyValue", name: "Efficiency", value: miner.efficiency },
    ],
  };
  if (image) product.image = image;
  if (offers.length > 0) {
    const prices = offers.map((o) => parseFloat(o.price));
    product.offers = {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: Math.min(...prices).toFixed(2),
      highPrice: Math.max(...prices).toFixed(2),
      offerCount: offers.length,
      offers,
    };
  }
  return { path, title, description, image, jsonLd: [product] };
}
