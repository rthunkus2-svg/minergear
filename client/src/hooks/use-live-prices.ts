import type { VendorListing, Product } from "@/data/miners";
import livePriceSnapshot from "@/data/live-prices.json";

export interface LivePrice {
  vendor: string;
  price: number;
  maxPrice?: number;
  inStock: boolean;
  url: string;
  affiliate: boolean;
  lastUpdated: string;
}

export interface LivePriceResponse {
  prices: Record<string, LivePrice[]>;
  stale: boolean;
  lastUpdated: string | null;
}

/**
 * Vendor prices are refreshed by a weekly GitHub Action
 * (.github/workflows/refresh-prices.yml -> script/fetch-prices.ts), which
 * commits client/src/data/live-prices.json. The site is fully static on
 * Vercel, so there is no /api backend: the snapshot is bundled at build
 * time. If the snapshot is empty or malformed, pages fall back to the
 * curated prices in miners.ts with no network calls and no console errors.
 */
function loadSnapshot(): LivePriceResponse | undefined {
  const raw = livePriceSnapshot as unknown as Partial<LivePriceResponse> | null;
  if (!raw || typeof raw !== "object" || !raw.prices || typeof raw.prices !== "object") {
    return undefined;
  }
  return {
    prices: raw.prices as Record<string, LivePrice[]>,
    stale: Boolean(raw.stale),
    lastUpdated: typeof raw.lastUpdated === "string" ? raw.lastUpdated : null,
  };
}

const snapshot = loadSnapshot();

export function useLivePrices(): { data: LivePriceResponse | undefined } {
  return { data: snapshot };
}

/** Format a number as a price string like "$1,299.00" */
function fmt(price: number): string {
  return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Merge live vendor prices into the static VendorListing[] for a miner.
 * Live prices override the static price & stock fields, sorted best-price-first.
 * Static vendors without live data keep their original values.
 */
export function mergeVendorPrices(
  staticVendors: VendorListing[],
  livePrices: LivePrice[] | undefined
): VendorListing[] {
  if (!livePrices || livePrices.length === 0) return staticVendors;

  // Build a map of live data keyed by vendor name (case-insensitive)
  const liveMap = new Map<string, LivePrice>();
  for (const lp of livePrices) {
    liveMap.set(lp.vendor.toLowerCase(), lp);
  }

  // Only update vendors we already list (keeps curated, affiliate-tagged URLs)
  const merged: VendorListing[] = staticVendors.map((sv) => {
    const live = liveMap.get(sv.store.toLowerCase());
    if (live) {
      liveMap.delete(sv.store.toLowerCase()); // consumed
      return {
        ...sv,
        price: fmt(live.price),
        inStock: live.inStock,
      };
    }
    return sv;
  });

  // Sort by price ascending
  merged.sort((a, b) => {
    const pa = parseFloat(a.price.replace(/[^0-9.]/g, "")) || 0;
    const pb = parseFloat(b.price.replace(/[^0-9.]/g, "")) || 0;
    return pa - pb;
  });

  return merged;
}

/**
 * Compute a live priceRange and priceNum from live data.
 * Falls back to static values when no live data.
 */
export function livePriceRange(
  staticRange: string,
  staticNum: number,
  livePrices: LivePrice[] | undefined,
  staticVendors?: VendorListing[]
): { priceRange: string; priceNum: number } {
  if (!livePrices || livePrices.length === 0 || !staticVendors)
    return { priceRange: staticRange, priceNum: staticNum };

  const merged = mergeVendorPrices(staticVendors, livePrices);
  const prices = merged
    .filter((v) => v.price.trim().startsWith("$"))
    .map((v) => parseFloat(v.price.replace(/[^0-9.]/g, "")))
    .filter((n) => n > 0);
  if (prices.length === 0) return { priceRange: staticRange, priceNum: staticNum };
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return {
    priceRange: min === max ? fmt(min) : `${fmt(min)} – ${fmt(max)}`,
    priceNum: min,
  };
}

/**
 * Merge live prices into an accessory Product[].
 * Matches by accessory product id → live data keyed by acc id.
 */
export function mergeAccessoryPrices(
  products: Product[],
  allLivePrices: Record<string, LivePrice[]>,
  accId: string
): Product[] {
  const livePrices = allLivePrices[accId];
  if (!livePrices || livePrices.length === 0) return products;

  // Build a map keyed by vendor name
  const liveMap = new Map<string, LivePrice>();
  for (const lp of livePrices) {
    liveMap.set(lp.vendor.toLowerCase(), lp);
  }

  return products.map((p) => {
    const live = liveMap.get(p.store.toLowerCase());
    if (live) {
      return {
        ...p,
        price: fmt(live.price),
        inStock: live.inStock,
      };
    }
    return p;
  });
}
