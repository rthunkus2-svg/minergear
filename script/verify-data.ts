// Data + build integrity checks. Run with `npm test` (after `npm run build`
// the built-output checks also run).
import { existsSync, readFileSync } from "fs";
import path from "path";
import { miners, legalDisclaimer } from "../client/src/data/miners";
import { minerImages } from "../client/src/data/miner-images";
import snapshot from "../client/src/data/live-prices.json";
import { AMAZON_ASSOCIATE_SENTENCE } from "../client/src/components/AffiliateDisclosure";

const root = path.resolve(import.meta.dirname, "..");
let failures = 0;
let checks = 0;
function check(ok: unknown, msg: string) {
  checks++;
  if (!ok) {
    failures++;
    console.error(`FAIL: ${msg}`);
  }
}

const AFF: Record<string, (u: URL) => boolean> = {
  "solosatoshi.com": (u) => u.pathname.startsWith("/aff/6679/"),
  "cryptominerbros.com": (u) => u.searchParams.get("ref") === "kcuwuiay",
  "heliumdeploy.com": (u) => u.searchParams.get("sca_ref") === "10850489.OFZKz7luYd",
  "bitcoinmerch.com": (u) => u.searchParams.get("aff") === "876",
};
const BANNED_NOTES = /commission|coupon|promo code|discount code|\b\d+(\.\d+)?\s*%\s*(off|commission)|affiliate rate/i;

const ids = new Set<string>();
const allLinks: { where: string; url: string; affiliate: boolean; price: string }[] = [];
for (const m of miners) {
  check(!ids.has(m.id), `duplicate miner id ${m.id}`);
  ids.add(m.id);
  check(m.vendors.length > 0, `${m.id} has no vendors`);
  check(m.accessories.length > 0, `${m.id} has no accessories`);
  check(m.releaseYear >= 2018 && m.releaseYear <= 2027, `${m.id} releaseYear ${m.releaseYear}`);
  if (minerImages[m.id]) {
    check(minerImages[m.id].startsWith("/miners/"), `${m.id} image path must be absolute /miners/...`);
    check(existsSync(path.join(root, "client/public", minerImages[m.id])), `${m.id} image file missing`);
  }
  for (const v of m.vendors) {
    allLinks.push({ where: `${m.id} vendor ${v.store}`, url: v.url, affiliate: v.affiliate, price: v.price });
    check(!BANNED_NOTES.test(v.notes), `${m.id} vendor ${v.store} note exposes internal info: "${v.notes}"`);
  }
  for (const a of m.accessories)
    for (const p of a.products) allLinks.push({ where: `${m.id}/${a.id} ${p.store}`, url: p.url, affiliate: p.affiliate, price: p.price });
}
check(ids.has("antminer-l7") && miners.find((m) => m.id === "antminer-l7")!.legacy, "antminer-l7 must be legacy");
check(ids.has("whatsminer-m50s") && miners.find((m) => m.id === "whatsminer-m50s")!.legacy, "whatsminer-m50s must be legacy");
for (const id of ["antminer-s23-hyd", "avalon-a16", "whatsminer-m70s-plus", "nerdqx"]) check(ids.has(id), `2026 model ${id} missing`);

for (const l of allLinks) {
  let u: URL;
  try {
    u = new URL(l.url);
  } catch {
    check(false, `${l.where}: invalid URL ${l.url}`);
    continue;
  }
  check(u.protocol === "https:", `${l.where}: not https ${l.url}`);
  check(/^(from\s+)?[$€£]\d/i.test(l.price.trim()) || /^(free|varies|see|check)\b/i.test(l.price.trim()), `${l.where}: odd price "${l.price}"`);
  const host = u.hostname.replace(/^www\./, "");
  if (host === "amazon.com") {
    check(u.searchParams.get("tag") === "mg20080-20", `${l.where}: Amazon link missing tag=mg20080-20 (${l.url})`);
    check(/^\/(dp\/[A-Z0-9]{10}|s)\/?$/.test(u.pathname), `${l.where}: Amazon link should be /dp/ASIN or /s search (${l.url})`);
  }
  if (AFF[host] && l.affiliate) check(AFF[host](u), `${l.where}: affiliate param missing/changed (${l.url})`);
}

// Disclosure
check(AMAZON_ASSOCIATE_SENTENCE === "As an Amazon Associate I earn from qualifying purchases.", "Amazon sentence altered");
check(JSON.stringify(legalDisclaimer).includes(AMAZON_ASSOCIATE_SENTENCE), "legal disclaimer missing Amazon sentence");
const detail = readFileSync(path.join(root, "client/src/pages/miner-detail.tsx"), "utf-8");
check((detail.match(/<AffiliateDisclosure/g) ?? []).length >= 2, "miner-detail must show disclosure near both Where to Buy sections");
check(readFileSync(path.join(root, "client/src/components/Footer.tsx"), "utf-8").includes("<AffiliateDisclosure"), "footer missing disclosure");

// No /api calls from the client, no fake subscribe state, no subscribers GET route
const clientSrc = ["hooks/use-live-prices.ts", "pages/home.tsx", "pages/miner-detail.tsx", "pages/mining-101.tsx"]
  .map((f) => readFileSync(path.join(root, "client/src", f), "utf-8"))
  .join("\n");
check(!/fetch\([^)]*["'`]\/api/.test(clientSrc), "client must not call /api");
check(!/You're subscribed/.test(clientSrc), "fake 'subscribed' state still present");
check(!/app\.get\(\s*["']\/api\/subscribers/.test(readFileSync(path.join(root, "server/routes.ts"), "utf-8")), "GET /api/subscribers must not exist");

// Snapshot shape
const snap = snapshot as any;
check(typeof snap === "object" && typeof snap.prices === "object", "live-prices.json shape");
for (const [id, list] of Object.entries<any[]>(snap.prices ?? {})) {
  check(ids.has(id), `snapshot has unknown miner ${id}`);
  for (const p of list) check(typeof p.price === "number" && p.price > 0 && typeof p.inStock === "boolean", `snapshot ${id}/${p.vendor} bad entry`);
}

// Built output (only if a build exists)
const dist = path.join(root, "dist/public");
if (existsSync(path.join(dist, "index.html"))) {
  for (const f of ["robots.txt", "sitemap.xml", "favicon.ico", "favicon.png", "favicon.svg"]) check(existsSync(path.join(dist, f)), `dist missing ${f}`);
  const sitemap = readFileSync(path.join(dist, "sitemap.xml"), "utf-8");
  for (const m of miners) {
    const f = path.join(dist, "miner", `${m.id}.html`);
    check(existsSync(f), `prerendered page missing for ${m.id}`);
    if (existsSync(f)) {
      const html = readFileSync(f, "utf-8");
      check(html.includes(`<link rel="canonical" href="https://minergear.io/miner/${m.id}" />`), `${m.id} canonical`);
      check(html.includes('"@type":"Product"'), `${m.id} Product JSON-LD`);
      check(html.includes(`<title>${m.name}`), `${m.id} title`);
    }
    check(sitemap.includes(`https://minergear.io/miner/${m.id}</loc>`), `sitemap missing ${m.id}`);
  }
  const home = readFileSync(path.join(dist, "index.html"), "utf-8");
  check(home.includes('"@type":"Organization"'), "home Organization JSON-LD");
  check(!/src="\.\/assets|href="\.\/assets/.test(home), "assets must use absolute paths for nested routes");
}

console.log(`${checks} checks, ${failures} failures (${allLinks.length} links, ${miners.length} miners)`);
process.exit(failures ? 1 : 0);
