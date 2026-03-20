/**
 * Automated Price Fetcher
 * Fetches live prices from vendor APIs (Shopify + WooCommerce)
 * and caches results in memory with configurable TTL.
 */

// --- Vendor API configurations ---

interface VendorConfig {
  name: string;
  type: "shopify" | "woocommerce";
  baseUrl: string;
  /** Map of our miner/product ID → vendor product slug */
  productMap: Record<string, string>;
  /** Affiliate URL builder */
  buildUrl: (slug: string) => string;
  affiliateTag: boolean;
}

const vendors: VendorConfig[] = [
  {
    name: "Solo Satoshi",
    type: "woocommerce",
    baseUrl: "https://www.solosatoshi.com",
    affiliateTag: true,
    buildUrl: (slug) => `https://www.solosatoshi.com/aff/6679/product/${slug}/`,
    productMap: {
      // Miners
      "bitaxe-gamma": "bitaxe-gamma",
      "bitaxe-gamma-duo": "bitaxe-duo-bitcoin-solo-miner-650-model",
      "bitaxe-gt": "bitaxe-gt-gamma-turbo",
      "bitaxe-touch": "bitaxe-touch",
      "nerdqaxepp": "nerdqaxe-plus-plus",
      "avalon-nano-3s": "avalon-nano-3s-bitcoin-solo-miner",
      "avalon-mini-3": "canaan-avalon-mini-3-37-5th-bitcoin-home-mining-space-heater",
      "avalon-q": "canaan-avalon-q-90th-bitcoin-home-miner",
      // Accessories
      "acc-bitaxe-30w-psu": "bitaxe-power-supply-5v-6a-30w",
      "acc-bitaxe-fan": "bitaxe-replacement-fan",
      "acc-bitaxe-oled": "bitaxe-replacement-oled-screen",
      "acc-bitaxe-heatsink": "bitaxe-heatsink-upgrade",
      "acc-52pi-mosfet": "52pi-copper-mosfet-heatsink-kit-for-bitaxe-and-nerdaxe",
      "acc-meanwell-50-5v": "mean-well-lrs-50-5",
      "acc-meanwell-600-12v": "mean-well-lrs-600-12-600w-12v-50a-switching-power-supply",
      "acc-meanwell-350-5v": "mean-well-lrs-350-5-300w-5v-60a-switching-power-supply",
      "acc-noctua-a8": "noctua-nf-a8-pwm-premium-quiet-fan-4-pin-80mm-brown",
      "acc-12v-10a-psu": "12v-10a-120w-switching-power-supply-with-5-5x2-1-jack",
      "acc-12v-xt30-psu": "12-4v-10a-124w-switching-power-supply-with-xt30-connector",
      "acc-thermalright-fan": "thermalright-tl-9015b-92mm-slim-pwm-fan",
      "acc-bitaxe-stand": "stackable-bitaxe-stand",
      "acc-bitaxe-fan-adapter": "bitaxe-fan-adapter",
    },
  },
  {
    name: "Helium Deploy",
    type: "shopify",
    baseUrl: "https://heliumdeploy.com",
    affiliateTag: true,
    buildUrl: (slug) => `https://heliumdeploy.com/products/${slug}?sca_ref=10850489.OFZKz7luYd`,
    productMap: {
      "bitaxe-gamma": "bitaxe-gamma-601-v1-0-1-2th-s",
      "nerdqaxepp": "nerdqaxe-rev-6-1-pro-6th-s",
      "nerdoctaxe": "nerdoctaxe-home-bitcoin-miner-up-to-12th-s",
      "avalon-nano-3s": "avalon-nano-3s-6th-s",
      "antminer-s21-xp": "bitmain-antminer-s21-xp-270-th-s",
      "antminer-l9": "bitmain-antminer-l9-16gh-s",
      "antminer-l7": "bitmain-antminer-l7-9-5-gh-s",
      "antminer-t21": "bitmain-antminer-t21-190-th-s",
      "whatsminer-m60s": "microbt-whatsminer-m60s-186-th-s",
    },
  },
  {
    name: "Bitcoin Merch",
    type: "shopify",
    baseUrl: "https://bitcoinmerch.com",
    affiliateTag: true,
    buildUrl: (slug) => `https://bitcoinmerch.com/products/${slug}?aff=876`,
    productMap: {
      "bitaxe-gamma": "bitcoin-merch-bitaxe-601-gamma-power-supply-bitcoin-miner-1-2th-s",
      "bitaxe-gamma-duo": "bitcoin-merch-bitaxe-gamma-duo-650-1-6th-s-w-power-supply",
      "nerdqaxepp": "bitcoin-merch-nerdqaxe-4-8th-s-multi-chip-btc-miner",
      "nerdoctaxe": "bitcoin-merch-nerdoctaxe-9-6th-s",
      "antminer-t21": "bitmain-antminer-t21-190th-s-3610w",
      "antminer-s21": "bitmain-antminer-s21-200th",
      // Accessories
      "acc-nerdqaxe-cooling-kit": "bitcoin-merch-nerdqaxe-120mm-performance-air-cooling-upgrade-kit",
      "acc-bitaxe-heatsink-bm": "bitcoin-merch-heatsink-upgrade-for-bitaxe-supra-gamma-copy",
      "acc-nerdqaxe-fan-replacement": "bitcoin-merch-nerdqaxe-fan-replacement",
      "acc-nerdqaxe-jumbo-screen": "bitcoin-merch-jumbo-nerdqaxe-screen-upgrade",
    },
  },
  {
    name: "Crypto Miner Bros",
    type: "woocommerce",
    baseUrl: "https://www.cryptominerbros.com",
    affiliateTag: true,
    buildUrl: (slug) => `https://www.cryptominerbros.com/product/${slug}/?ref=kcuwuiay`,
    productMap: {
      "antminer-s21-xp": "bitmain-antminer-s21-xp-bitcoin-miner",
      "antminer-s21-pro": "bitmain-antminer-s21-pro-bitcoin-miner-234th-s",
      "antminer-s21-plus": "bitmain-antminer-s21-plus-bitcoin-miner",
      "antminer-s21": "bitmain-antminer-s21-bitcoin-asic-miner",
      "antminer-s23": "bitmain-antminer-s23-bitcoin-miner",
      "antminer-l9": "bitmain-antminer-l9-dogecoin-miner",
      "antminer-l7": "bitmain-antminer-l7-9-16gh-s",
      "whatsminer-m60s": "microbt-whatsminer-m60s-bitcoin-miner",
      "whatsminer-m50s": "microbt-whatsminer-m50s-126th-s-bitcoin-miner",
      "avalon-q": "canaan-avalon-q-bitcoin-miner",
      "avalon-nano-3s": "canaan-avalon-nano-3s-home-miner-6th-s",
      "avalon-mini-3": "canaan-avalon-mini-3-bitcoin-miner",
      "nerdoctaxe": "nerdminer-nerdoctaxe-bitcoin-miner",
      "nerdqaxepp": "nerdminer-nerdqaxe-plus-plus-bitcoin-miner",
      "bitaxe-gamma": "bitaxe-gamma-601-bitcoin-miner",
      // Accessories/Parts
      "acc-apw17-psu": "antminer-apw17-1215c-replacement-power-supply",
      "acc-apw12-psu": "antminer-apw12-1215-replacement-power-supply",
      "acc-p221-psu": "microbt-whatsminer-p221-replacement-power-supply",
      "acc-s21-fan": "bitmain-antminer-fan-7200rpm",
      "acc-s21pro-fan": "bitmain-antminer-fan-6400rpm",
      "acc-avalon-q-fan": "canaan-avalon-fan-avalon-q",
      "acc-c19-cable": "power-cable-cord-c19-16-a-replacement-power-cable",
    },
  },
  {
    name: "BT-Miners",
    type: "woocommerce",
    baseUrl: "https://bt-miners.com",
    affiliateTag: false,
    buildUrl: (slug) => `https://bt-miners.com/product/${slug}/`,
    productMap: {
      "antminer-s21-xp": "bitmain-antminer-s21-xp-270th-s-bitcoin-miner-bt-miners",
      "antminer-s21-pro": "bitmain-antminer-s21-pro-234th-s-bitcoin-miner-bt-miners",
      "antminer-s21-plus": "bitmain-antminer-s21-235th-s-bitcoin-miner-bt-miners",
      "antminer-s21": "bitmain-antminer-s21-200th-s-bitcoin-miner-bt-miners",
      "antminer-s23": "bitmain-antminer-s23-318th-s-bitcoin-miner-bt-miners",
      "antminer-t21": "bitmain-antminer-t21-190th-s-bitcoin-miner-bt-miners",
      "antminer-l9": "bitmain-antminer-l9-16gh-s-litecoin-miner-bt-miners",
      "antminer-l7": "bitmain-antminer-l7-litecoin-miner-bt-miners",
      "whatsminer-m60s": "microbt-whatsminer-m60s-186th-s-bitcoin-miner-bt-miners",
      "whatsminer-m50s": "microbt-whatsminer-m50s-126th-s-bitcoin-miner-bt-miners",
      "nerdoctaxe": "nerdminer-nerdoctaxe-9-6th-s-bitcoin-solo-miner-bt-miners",
      "nerdqaxepp": "nerdminer-nerdqaxe-rev-6-1-6th-s-bitcoin-miner-bt-miners",
    },
  },
  {
    name: "ASIC Marketplace",
    type: "woocommerce",
    baseUrl: "https://asicmarketplace.com",
    affiliateTag: false,
    buildUrl: (slug) => `https://asicmarketplace.com/product/${slug}/`,
    productMap: {
      "antminer-s21-xp": "bitmain-antminer-s21-xp-bitcoin-miner",
      "antminer-s21-pro": "bitmain-antminer-s21-pro-btc-miner",
      "antminer-s21-plus": "bitmain-antminer-s21-plus-bitcoin-miner",
      "antminer-s23": "bitmain-antminer-s23-bitcoin-miner",
      "bitaxe-gamma": "bitaxe-gamma-601-bitcoin-miner",
    },
  },
];

// --- Price fetching logic ---

interface LivePrice {
  vendor: string;
  price: number;
  maxPrice?: number;
  inStock: boolean;
  url: string;
  affiliate: boolean;
  lastUpdated: string;
}

interface PriceCache {
  [productId: string]: LivePrice[];
}

let priceCache: PriceCache = {};
let lastFetchTime: number = 0;
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours

async function fetchShopifyProduct(baseUrl: string, slug: string): Promise<{ price: number; maxPrice: number; inStock: boolean } | null> {
  try {
    const url = `${baseUrl}/products/${slug}.json`;
    const resp = await fetch(url, {
      headers: { "User-Agent": "MinerGear/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return null;
    const data = await resp.json() as any;
    const product = data.product;
    if (!product) return null;

    const variants = product.variants || [];
    const prices = variants.map((v: any) => parseFloat(v.price)).filter((p: number) => p > 0);
    const available = variants.some((v: any) => v.available);

    return {
      price: Math.min(...prices),
      maxPrice: Math.max(...prices),
      inStock: available,
    };
  } catch {
    return null;
  }
}

async function fetchWooCommerceProduct(baseUrl: string, slug: string): Promise<{ price: number; maxPrice: number; inStock: boolean } | null> {
  try {
    const url = `${baseUrl}/wp-json/wc/store/v1/products?slug=${slug}&per_page=1`;
    const resp = await fetch(url, {
      headers: { "User-Agent": "MinerGear/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return null;
    const data = await resp.json() as any[];
    if (!data || data.length === 0) return null;

    const product = data[0];
    const prices = product.prices || {};
    const priceRaw = prices.price || "0";
    const price = parseInt(priceRaw, 10) / 100;
    const inStock = product.is_purchasable && product.is_in_stock;

    return { price, maxPrice: price, inStock };
  } catch {
    return null;
  }
}

async function fetchVendorPrices(vendor: VendorConfig): Promise<{ productId: string; data: LivePrice }[]> {
  const results: { productId: string; data: LivePrice }[] = [];
  const fetcher = vendor.type === "shopify" ? fetchShopifyProduct : fetchWooCommerceProduct;

  // Fetch in parallel with concurrency limit of 3
  const entries = Object.entries(vendor.productMap);
  for (let i = 0; i < entries.length; i += 3) {
    const batch = entries.slice(i, i + 3);
    const batchResults = await Promise.allSettled(
      batch.map(async ([productId, slug]) => {
        const priceData = await fetcher(vendor.baseUrl, slug);
        if (priceData && priceData.price > 0) {
          return {
            productId,
            data: {
              vendor: vendor.name,
              price: priceData.price,
              maxPrice: priceData.maxPrice !== priceData.price ? priceData.maxPrice : undefined,
              inStock: priceData.inStock,
              url: vendor.buildUrl(slug),
              affiliate: vendor.affiliateTag,
              lastUpdated: new Date().toISOString(),
            },
          };
        }
        return null;
      })
    );

    for (const result of batchResults) {
      if (result.status === "fulfilled" && result.value) {
        results.push(result.value);
      }
    }
  }

  return results;
}

export async function refreshPrices(): Promise<PriceCache> {
  console.log(`[PriceFetcher] Refreshing prices from ${vendors.length} vendors...`);
  const newCache: PriceCache = {};

  const allResults = await Promise.allSettled(
    vendors.map((v) => fetchVendorPrices(v))
  );

  for (const result of allResults) {
    if (result.status === "fulfilled") {
      for (const { productId, data } of result.value) {
        if (!newCache[productId]) newCache[productId] = [];
        newCache[productId].push(data);
      }
    }
  }

  // Sort each product's prices low to high
  for (const key of Object.keys(newCache)) {
    newCache[key].sort((a, b) => a.price - b.price);
  }

  priceCache = newCache;
  lastFetchTime = Date.now();

  const productCount = Object.keys(newCache).length;
  const priceCount = Object.values(newCache).reduce((sum, arr) => sum + arr.length, 0);
  console.log(`[PriceFetcher] Cached ${priceCount} prices for ${productCount} products`);

  return newCache;
}

export function getCachedPrices(): PriceCache {
  return priceCache;
}

export function isCacheStale(): boolean {
  return Date.now() - lastFetchTime > CACHE_TTL;
}

export function getLastFetchTime(): number {
  return lastFetchTime;
}
