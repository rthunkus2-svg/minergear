import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { VendorListing, Product } from "@/data/miners";

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
 * Fetch all live prices from the backend (cached server-side for 4 hours).
 * On the client we refetch every 30 minutes but the backend will return
 * the same cached data most of the time.
 */
export function useLivePrices() {
  return useQuery<LivePriceResponse>({
    queryKey: ["/api/prices"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/prices");
      return res.json();
    },
    staleTime: 30 * 60 * 1000, // 30 min
    refetchInterval: 30 * 60 * 1000,
    retry: 1,
  });
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

  // Start with updated static vendors
  const merged: VendorListing[] = staticVendors.map((sv) => {
    const live = liveMap.get(sv.store.toLowerCase());
    if (live) {
      liveMap.delete(sv.store.toLowerCase()); // consumed
      return {
        ...sv,
        price: fmt(live.price),
        inStock: live.inStock,
        url: live.url,
        affiliate: live.affiliate,
      };
    }
    return sv;
  });

  // Add any live vendors that weren't in static list
  for (const lp of liveMap.values()) {
    merged.push({
      store: lp.vendor,
      price: fmt(lp.price),
      inStock: lp.inStock,
      url: lp.url,
      affiliate: lp.affiliate,
      notes: "",
    });
  }

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
  livePrices: LivePrice[] | undefined
): { priceRange: string; priceNum: number } {
  if (!livePrices || livePrices.length === 0)
    return { priceRange: staticRange, priceNum: staticNum };

  const prices = livePrices.map((lp) => lp.price);
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
        url: live.url,
        affiliate: live.affiliate,
      };
    }
    return p;
  });
}
