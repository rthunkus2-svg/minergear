/**
 * Weekly vendor price refresh.
 *
 * Reads every "Where to Buy" vendor URL from client/src/data/miners.ts,
 * asks the vendor's public storefront API for the current price/stock
 * (WooCommerce Store API or Shopify product .js), and writes
 * client/src/data/live-prices.json. The site bundles that file at build time.
 *
 * Safety rules:
 *  - Only vendors already listed in miners.ts are refreshed (URLs and
 *    affiliate parameters always come from miners.ts, never from this file).
 *  - A fetched price is rejected if it is < 50% or > 200% of the curated
 *    baseline (catches wrong variants / bundles / placeholder prices).
 *  - Any failure (timeout, 403/429, non-JSON) just keeps the curated price.
 *
 * Run: npx tsx script/fetch-prices.ts
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { miners } from "../client/src/data/miners";

type Platform = "woocommerce" | "shopify";
interface Source { platform: Platform; base: string; slug: string }

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const OUT = resolve(import.meta.dirname, "../client/src/data/live-prices.json");
const UA = "Mozilla/5.0 (compatible; MinerGearPriceBot/1.0; +https://www.minergear.io)";

const WOO_HOSTS: Record<string, string> = {
  "www.cryptominerbros.com": "https://www.cryptominerbros.com",
  "cryptominerbros.com": "https://www.cryptominerbros.com",
  "asicmarketplace.com": "https://asicmarketplace.com",
  "www.solosatoshi.com": "https://www.solosatoshi.com",
  "solosatoshi.com": "https://www.solosatoshi.com",
  "bt-miners.com": "https://bt-miners.com",
};
const SHOPIFY_HOSTS: Record<string, string> = {
  "heliumdeploy.com": "https://heliumdeploy.com",
  "bitcoinmerch.com": "https://bitcoinmerch.com",
  "www.wattum.com": "https://www.wattum.com",
  "wattum.com": "https://www.wattum.com",
  "powermining.com": "https://powermining.com",
  "www.powermining.com": "https://powermining.com",
};

export function sourceFor(url: string): Source | null {
  let u: URL;
  try { u = new URL(url); } catch { return null; }
  const parts = u.pathname.split("/").filter(Boolean);
  const wooBase = WOO_HOSTS[u.hostname];
  if (wooBase) {
    const i = parts.findIndex((p) => p === "product" || p === "products");
    if (i >= 0 && parts[i + 1]) return { platform: "woocommerce", base: wooBase, slug: decodeURIComponent(parts[i + 1]) };
  }
  const shopBase = SHOPIFY_HOSTS[u.hostname];
  if (shopBase) {
    const i = parts.indexOf("products");
    if (i >= 0 && parts[i + 1]) return { platform: "shopify", base: shopBase, slug: decodeURIComponent(parts[i + 1]) };
  }
  return null;
}

async function getJson(url: string, attempt = 0): Promise<any | null> {
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(15000) });
    if ((r.status === 429 || r.status >= 500) && attempt < 2) {
      await sleep(10000 * (attempt + 1));
      return getJson(url, attempt + 1);
    }
    if (!r.ok) {
      if (process.env.DEBUG) console.log(`    HTTP ${r.status} ${url}`);
      return null;
    }
    const text = await r.text();
    try { return JSON.parse(text); } catch { return null; }
  } catch (e) {
    if (attempt < 2) { await sleep(5000); return getJson(url, attempt + 1); }
    if (process.env.DEBUG) console.log(`    error ${url}: ${(e as Error).message}`);
    return null;
  }
}

async function fetchPrice(src: Source): Promise<{ price: number; inStock: boolean } | null> {
  if (src.platform === "woocommerce") {
    const data = await getJson(`${src.base}/wp-json/wc/store/v1/products?slug=${encodeURIComponent(src.slug)}&per_page=10`);
    // The Store API can return individual variations (and even other products'
    // variations) for a slug query. Only accept the parent product whose own
    // permalink is this slug, so we never pick up a variant/bundle price.
    const p = Array.isArray(data)
      ? data.find((x: any) => x?.type !== "variation" && typeof x?.permalink === "string" &&
          new URL(x.permalink).pathname.split("/").filter(Boolean).pop() === src.slug)
      : null;
    if (!p?.prices?.price) return null;
    const minor = Number(p.prices.currency_minor_unit ?? 2);
    const price = parseInt(p.prices.price, 10) / 10 ** minor;
    if (p.prices.currency_code && p.prices.currency_code !== "USD") return null;
    return price > 0 ? { price, inStock: Boolean(p.is_in_stock && p.is_purchasable) } : null;
  }
  // Shopify's public /products/<handle>.js includes availability (the .json variant does not).
  const data = await getJson(`${src.base}/products/${encodeURIComponent(src.slug)}.js`);
  const cents = Number(data?.price_min ?? data?.price);
  if (!data || !(cents > 0)) return null;
  return { price: cents / 100, inStock: Boolean(data.available) };
}

function baseline(price: string): number | null {
  if (!price.trim().startsWith("$")) return null;
  const n = parseFloat(price.replace(/[^0-9.]/g, ""));
  return n > 0 ? n : null;
}

async function main() {
  const now = new Date().toISOString();
  const prices: Record<string, any[]> = {};
  let ok = 0, rejected = 0, failed = 0, skipped = 0;

  for (const m of miners) {
    for (const v of m.vendors) {
      const src = sourceFor(v.url);
      const base = baseline(v.price);
      if (!src || base === null) { skipped++; continue; }
      const res = await fetchPrice(src);
      await sleep(src.platform === "shopify" ? 2000 : 750); // be polite to vendor APIs
      if (!res) { failed++; console.log(`  - ${m.id} @ ${v.store}: no data (kept ${v.price})`); continue; }
      if (res.price < base * 0.5 || res.price > base * 2) {
        rejected++;
        console.log(`  ! ${m.id} @ ${v.store}: $${res.price} outside sanity band of ${v.price}, kept curated`);
        continue;
      }
      ok++;
      (prices[m.id] ??= []).push({ vendor: v.store, price: res.price, inStock: res.inStock, url: v.url, affiliate: v.affiliate, lastUpdated: now });
    }
  }
  for (const k of Object.keys(prices)) prices[k].sort((a, b) => a.price - b.price);

  console.log(`Updated ${ok}, rejected ${rejected}, failed ${failed}, skipped (unsupported vendor) ${skipped}`);

  if (ok === 0) {
    console.log("No prices fetched; leaving existing snapshot untouched.");
    return;
  }
  // Keep previous values for listings that failed this run, so one bad week doesn't wipe data.
  if (existsSync(OUT)) {
    try {
      const prev = JSON.parse(readFileSync(OUT, "utf8"));
      for (const [id, list] of Object.entries<any[]>(prev.prices ?? {})) {
        for (const lp of list) {
          const stillListed = miners.find((m) => m.id === id)?.vendors.some((v) => v.store === lp.vendor && v.url === lp.url);
          if (stillListed && !(prices[id] ?? []).some((x) => x.vendor === lp.vendor)) (prices[id] ??= []).push(lp);
        }
        prices[id]?.sort((a, b) => a.price - b.price);
      }
    } catch { /* ignore malformed previous snapshot */ }
  }
  writeFileSync(OUT, JSON.stringify({ prices, stale: false, lastUpdated: now }, null, 2) + "\n");
  console.log(`Wrote ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
