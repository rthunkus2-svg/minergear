import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fs from "fs";
import path from "path";
import {
  refreshPrices,
  getCachedPrices,
  isCacheStale,
  getLastFetchTime,
} from "./price-fetcher";

const SUBSCRIBERS_FILE = path.join(process.cwd(), "subscribers.json");

function loadSubscribers(): string[] {
  try {
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      return JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, "utf-8"));
    }
  } catch {}
  return [];
}

function saveSubscribers(list: string[]) {
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(list, null, 2));
}

// Refresh loop — runs every 4 hours
let refreshInterval: ReturnType<typeof setInterval> | null = null;

function startPriceRefreshLoop() {
  // Initial fetch on startup (delayed 5s to let server finish booting)
  setTimeout(() => {
    refreshPrices().catch((err) =>
      console.error("[PriceFetcher] Initial fetch failed:", err)
    );
  }, 5000);

  // Repeat every 4 hours
  refreshInterval = setInterval(
    () => {
      refreshPrices().catch((err) =>
        console.error("[PriceFetcher] Scheduled fetch failed:", err)
      );
    },
    4 * 60 * 60 * 1000
  );
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Email subscription endpoint
  app.post("/api/subscribe", (req, res) => {
    const email = (req.query.email as string || "").trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Invalid email" });
    }
    const subs = loadSubscribers();
    if (!subs.includes(email)) {
      subs.push(email);
      saveSubscribers(subs);
    }
    res.json({ success: true, message: "Subscribed" });
  });

  app.get("/api/subscribers", (_req, res) => {
    const subs = loadSubscribers();
    res.json({ count: subs.length, emails: subs });
  });

  // ─── Live Price Endpoints ───────────────────────────────

  /** GET /api/prices — Return all cached live prices */
  app.get("/api/prices", (_req, res) => {
    const cache = getCachedPrices();
    const stale = isCacheStale();
    const lastUpdated = getLastFetchTime();
    res.json({
      prices: cache,
      stale,
      lastUpdated: lastUpdated ? new Date(lastUpdated).toISOString() : null,
    });
  });

  /** GET /api/prices/:productId — Return prices for a single product */
  app.get("/api/prices/:productId", (req, res) => {
    const { productId } = req.params;
    const cache = getCachedPrices();
    const prices = cache[productId] || [];
    res.json({
      productId,
      prices,
      stale: isCacheStale(),
      lastUpdated: getLastFetchTime()
        ? new Date(getLastFetchTime()).toISOString()
        : null,
    });
  });

  /** POST /api/prices/refresh — Trigger an on-demand refresh */
  app.post("/api/prices/refresh", async (_req, res) => {
    try {
      const cache = await refreshPrices();
      const productCount = Object.keys(cache).length;
      const priceCount = Object.values(cache).reduce(
        (sum, arr) => sum + arr.length,
        0
      );
      res.json({
        success: true,
        products: productCount,
        priceEntries: priceCount,
        lastUpdated: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Refresh failed" });
    }
  });

  // Start the background price refresh loop
  startPriceRefreshLoop();

  return httpServer;
}
