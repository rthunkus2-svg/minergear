import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { miners, manufacturers, categoryLabels, tierLabels, catalogLastUpdated } from "@/data/miners";
import { minerImages } from "@/data/miner-images";
import type { Miner } from "@/data/miners";
import { useLivePrices, livePriceRange } from "@/hooks/use-live-prices";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePageMeta } from "@/hooks/use-page-meta";
import { homeMeta } from "@/lib/seo";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Cpu,
  Zap,
  Gauge,
  DollarSign,
  Filter,
  X,
  Wrench,
  ChevronRight,
  Download,
  Smartphone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type SortOption =
  | "newest"
  | "alpha"
  | "price-asc"
  | "price-desc"
  | "hashrate-desc"
  | "power-asc"
  | "efficiency-asc";

const sortLabels: Record<SortOption, string> = {
  "efficiency-asc": "Efficiency: Best First",
  newest: "Newest First",
  alpha: "Alphabetical",
  "price-asc": "Price: Low → High",
  "price-desc": "Price: High → Low",
  "hashrate-desc": "Hashrate: High → Low",
  "power-asc": "Power: Low → High",
};

// J/TH (SHA-256) and J/MH (Scrypt) are different units, so efficiency is only
// compared within an algorithm. SHA-256 is listed first.
const algoOrder = (m: Miner) => (m.algorithm === "SHA-256" ? 0 : 1);

interface MinerWithLivePrice extends Miner {
  livePriceRange?: string;
  livePriceNum?: number;
}

function sortMiners(list: MinerWithLivePrice[], sortBy: SortOption): MinerWithLivePrice[] {
  const sorted = [...list];
  switch (sortBy) {
    case "newest":
      return sorted.sort(
        (a, b) =>
          Number(!!a.legacy) - Number(!!b.legacy) ||
          b.releaseYear - a.releaseYear ||
          a.name.localeCompare(b.name),
      );
    case "alpha":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "price-asc":
      return sorted.sort((a, b) => (a.livePriceNum ?? a.priceNum) - (b.livePriceNum ?? b.priceNum));
    case "price-desc":
      return sorted.sort((a, b) => (b.livePriceNum ?? b.priceNum) - (a.livePriceNum ?? a.priceNum));
    case "hashrate-desc":
      return sorted.sort((a, b) => b.hashrateNum - a.hashrateNum);
    case "power-asc":
      return sorted.sort((a, b) => a.powerNum - b.powerNum);
    case "efficiency-asc":
      return sorted.sort(
        (a, b) =>
          Number(!!a.legacy) - Number(!!b.legacy) ||
          algoOrder(a) - algoOrder(b) ||
          a.algorithm.localeCompare(b.algorithm) ||
          a.efficiencyNum - b.efficiencyNum,
      );
    default:
      return sorted;
  }
}

function MinerImage({ minerId, name }: { minerId: string; name: string }) {
  const src = minerImages[minerId];
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="w-full aspect-[4/3] rounded-t-lg bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
        <Cpu className="h-12 w-12 text-muted-foreground/30" />
      </div>
    );
  }

  return (
    <div className="w-full aspect-[4/3] rounded-t-lg bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-800/80 dark:to-slate-900/60 overflow-hidden flex items-center justify-center p-6">
      <img
        src={src}
        alt={name}
        className="w-full h-full object-contain drop-shadow-md"
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export default function Home() {
  usePageMeta(homeMeta);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("efficiency-asc");
  const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { data: livePriceData } = useLivePrices();

  const filtered = useMemo(() => {
    const list: MinerWithLivePrice[] = miners
      .filter((m) => {
        const q = search.toLowerCase();
        const matchesSearch =
          !q ||
          m.name.toLowerCase().includes(q) ||
          m.manufacturer.toLowerCase().includes(q) ||
          m.algorithm.toLowerCase().includes(q) ||
          m.hashrate.toLowerCase().includes(q);
        const matchesMfg = !selectedManufacturer || m.manufacturer === selectedManufacturer;
        const matchesTier = !selectedTier || m.tier === selectedTier;
        const matchesCategory = !selectedCategory || m.category === selectedCategory;
        return matchesSearch && matchesMfg && matchesTier && matchesCategory;
      })
      .map((m) => {
        const lp = livePriceData?.prices?.[m.id];
        const { priceRange, priceNum } = livePriceRange(m.priceRange, m.priceNum, lp, m.vendors);
        return { ...m, livePriceRange: priceRange, livePriceNum: priceNum };
      });
    return sortMiners(list, sortBy);
  }, [search, selectedManufacturer, selectedTier, selectedCategory, sortBy, livePriceData]);

  const allWithLive = useMemo<MinerWithLivePrice[]>(
    () =>
      miners.map((m) => {
        const { priceRange, priceNum } = livePriceRange(m.priceRange, m.priceNum, livePriceData?.prices?.[m.id], m.vendors);
        return { ...m, livePriceRange: priceRange, livePriceNum: priceNum };
      }),
    [livePriceData],
  );

  const currentModels = filtered.filter((m) => !m.legacy);
  const legacyModels = filtered.filter((m) => m.legacy);

  const hasFilters = selectedManufacturer || selectedTier || selectedCategory;

  const clearFilters = () => {
    setSelectedManufacturer(null);
    setSelectedTier(null);
    setSelectedCategory(null);
  };

  const uniqueCategories = [...new Set(miners.map((m) => m.category))];
  const uniqueTiers = [...new Set(miners.map((m) => m.tier))];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="px-4 pt-10 pb-6">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Mining <span className="text-primary">Hardware</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg mt-2 max-w-3xl leading-relaxed">
              Compare current-generation ASIC and home miners by efficiency (J/TH), with the right power supplies, cooling, firmware, and accessories — real prices and direct purchase links.
            </p>
            <p className="text-xs text-muted-foreground mt-2" data-testid="text-catalog-updated">
              Catalog last updated {catalogLastUpdated} · Vendor prices refresh weekly
            </p>
          </div>
        </section>

        {/* Top Picks */}
        <section className="px-4 pb-6">
          <div className="mx-auto max-w-7xl">
            <TopPicks list={allWithLive} />
          </div>
        </section>

        {/* Get the App Banner */}
        <section className="px-4 pb-6">
          <div className="mx-auto max-w-7xl">
            <GetTheAppBanner />
          </div>
        </section>

        {/* Search, Sort & Filters */}
        <section className="px-4 pb-6">
          <div className="mx-auto max-w-7xl space-y-3">
            <div className="flex gap-2 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search miners..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-11 text-base"
                  data-testid="input-search"
                />
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={sortBy}
                  onValueChange={(v) => setSortBy(v as SortOption)}
                >
                  <SelectTrigger className="h-11 text-sm w-[200px]" data-testid="select-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(sortLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key} data-testid={`sort-option-${key}`}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant={showFilters ? "secondary" : "outline"}
                  size="icon"
                  className="h-11 w-11 shrink-0"
                  onClick={() => setShowFilters(!showFilters)}
                  data-testid="button-toggle-filters"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="space-y-3 p-4 rounded-lg bg-card border border-card-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Filters
                  </span>
                  {hasFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-8 text-sm gap-1"
                      data-testid="button-clear-filters"
                    >
                      <X className="h-3 w-3" /> Clear
                    </Button>
                  )}
                </div>
                {/* Category */}
                <div>
                  <span className="text-sm text-muted-foreground mb-1.5 block">Category</span>
                  <div className="flex flex-wrap gap-2">
                    {uniqueCategories.map((cat) => (
                      <Badge
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "outline"}
                        className="cursor-pointer text-sm px-3 py-1"
                        onClick={() =>
                          setSelectedCategory(selectedCategory === cat ? null : cat)
                        }
                        data-testid={`badge-cat-${cat}`}
                      >
                        {categoryLabels[cat] || cat}
                      </Badge>
                    ))}
                  </div>
                </div>
                {/* Tier */}
                <div>
                  <span className="text-sm text-muted-foreground mb-1.5 block">Tier</span>
                  <div className="flex flex-wrap gap-2">
                    {uniqueTiers.map((tier) => (
                      <Badge
                        key={tier}
                        variant={selectedTier === tier ? "default" : "outline"}
                        className="cursor-pointer text-sm px-3 py-1"
                        onClick={() =>
                          setSelectedTier(selectedTier === tier ? null : tier)
                        }
                        data-testid={`badge-tier-${tier}`}
                      >
                        {tierLabels[tier] || tier}
                      </Badge>
                    ))}
                  </div>
                </div>
                {/* Manufacturer */}
                <div>
                  <span className="text-sm text-muted-foreground mb-1.5 block">Manufacturer</span>
                  <div className="flex flex-wrap gap-2">
                    {manufacturers.map((mfg) => (
                      <Badge
                        key={mfg}
                        variant={selectedManufacturer === mfg ? "default" : "outline"}
                        className="cursor-pointer text-sm px-3 py-1"
                        onClick={() =>
                          setSelectedManufacturer(
                            selectedManufacturer === mfg ? null : mfg
                          )
                        }
                        data-testid={`badge-mfg-${mfg}`}
                      >
                        {mfg}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Miner Grid */}
        <section className="px-4 pb-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm text-muted-foreground">
                {currentModels.length} current miner{currentModels.length !== 1 ? "s" : ""}
                {legacyModels.length > 0 && ` · ${legacyModels.length} legacy`}
              </span>
            </div>
            <MinerGrid list={currentModels} />

            {legacyModels.length > 0 && (
              <div className="mt-12" data-testid="section-legacy">
                <h2 className="text-xl font-bold tracking-tight">Legacy &amp; Superseded Models</h2>
                <p className="text-sm text-muted-foreground mt-1 mb-5 max-w-3xl">
                  Older or less efficient models that have been replaced by newer hardware. They stay listed for current owners who need
                  parts and accessories, but we no longer recommend buying them new.
                </p>
                <MinerGrid list={legacyModels} />
              </div>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-base">No miners found matching your filters.</p>
                <Button
                  variant="link"
                  onClick={() => {
                    clearFilters();
                    setSearch("");
                  }}
                  className="mt-2 text-sm"
                  data-testid="button-clear-all"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Email Subscription */}
        <section className="px-4 pb-12">
          <div className="mx-auto max-w-7xl">
            <EmailSubscription />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

// "Top picks" are computed from the data, never hand-picked: the most
// efficient current (non-legacy) model in each group that at least one
// listed vendor shows in stock (falls back to any current model).
const pickGroups: { key: string; label: string; blurb: string; match: (m: Miner) => boolean }[] = [
  { key: "hydro", label: "Most Efficient Overall", blurb: "Hydro-cooled farm hardware", match: (m) => m.algorithm === "SHA-256" && m.tier === "industrial" && /hydro/i.test(m.cooling) },
  { key: "air", label: "Best Air-Cooled ASIC", blurb: "No liquid loop needed", match: (m) => m.algorithm === "SHA-256" && m.tier === "industrial" && /^air/i.test(m.cooling) },
  { key: "home", label: "Best Home Miner", blurb: "Quiet, runs on household power", match: (m) => m.algorithm === "SHA-256" && m.tier === "home" },
  { key: "hobby", label: "Best Solo / Hobby Miner", blurb: "Desktop open-source miners", match: (m) => m.algorithm === "SHA-256" && m.tier === "hobby" },
  { key: "scrypt", label: "Best Scrypt Miner", blurb: "Litecoin + Dogecoin", match: (m) => m.algorithm === "Scrypt" },
];

function pickBest(list: MinerWithLivePrice[], match: (m: Miner) => boolean) {
  const pool = list.filter((m) => !m.legacy && match(m));
  const inStock = pool.filter((m) => m.vendors.some((v) => v.inStock));
  const candidates = inStock.length ? inStock : pool;
  return [...candidates].sort((a, b) => a.efficiencyNum - b.efficiencyNum || b.hashrateNum - a.hashrateNum)[0];
}

function TopPicks({ list }: { list: MinerWithLivePrice[] }) {
  const picks = pickGroups
    .map((g) => ({ ...g, miner: pickBest(list, g.match) }))
    .filter((p): p is typeof p & { miner: MinerWithLivePrice } => !!p.miner);
  const leaderboard = list
    .filter((m) => !m.legacy && m.algorithm === "SHA-256")
    .sort((a, b) => a.efficiencyNum - b.efficiencyNum || b.hashrateNum - a.hashrateNum)
    .slice(0, 10);

  return (
    <div className="space-y-6" data-testid="section-top-picks">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Top Picks by Efficiency</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
          Efficiency (joules per terahash) decides what a miner costs to run. Lower is better. Each pick is the most efficient current model
          in its group that a listed vendor has in stock.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {picks.map(({ key, label, blurb, miner }) => (
          <Link key={key} href={`/miner/${miner.id}`}>
            <Card
              className="cursor-pointer group h-full p-4 transition-all hover:border-primary/40 hover:shadow-lg"
              data-testid={`card-pick-${key}`}
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">{label}</div>
              <div className="text-xs text-muted-foreground">{blurb}</div>
              <h3 className="font-bold text-base leading-tight mt-3 group-hover:text-primary transition-colors">{miner.name}</h3>
              <div className="flex items-baseline gap-1.5 mt-2">
                <Gauge className="h-4 w-4 text-primary shrink-0 self-center" />
                <span className="text-2xl font-bold">{miner.efficiency}</span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {miner.hashrate} · {miner.power}
              </div>
              <div className="text-sm font-semibold mt-2">{miner.livePriceRange || miner.priceRange}</div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="rounded-lg border border-card-border bg-card overflow-x-auto" data-testid="table-efficiency">
        <table className="w-full text-sm">
          <caption className="text-left px-4 pt-4 pb-2 font-semibold text-base">
            Most efficient Bitcoin (SHA-256) miners you can buy
          </caption>
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="px-4 py-2 font-medium">#</th>
              <th className="px-4 py-2 font-medium">Miner</th>
              <th className="px-4 py-2 font-medium">Efficiency</th>
              <th className="px-4 py-2 font-medium">Hashrate</th>
              <th className="px-4 py-2 font-medium">Power</th>
              <th className="px-4 py-2 font-medium">Cooling</th>
              <th className="px-4 py-2 font-medium">Price</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((m, i) => (
              <tr key={m.id} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-2 font-medium whitespace-nowrap">
                  <Link href={`/miner/${m.id}`} className="hover:text-primary hover:underline">
                    {m.name}
                  </Link>
                  {!m.vendors.some((v) => v.inStock) && (
                    <span className="ml-2 text-xs text-muted-foreground">(pre-order)</span>
                  )}
                </td>
                <td className="px-4 py-2 font-bold whitespace-nowrap">{m.efficiency}</td>
                <td className="px-4 py-2 whitespace-nowrap">{m.hashrate}</td>
                <td className="px-4 py-2 whitespace-nowrap">{m.power}</td>
                <td className="px-4 py-2 whitespace-nowrap">{m.cooling}</td>
                <td className="px-4 py-2 whitespace-nowrap">{m.livePriceRange || m.priceRange}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MinerGrid({ list }: { list: MinerWithLivePrice[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {list.map((miner) => (
        <Link key={miner.id} href={`/miner/${miner.id}`}>
          <Card
            className="cursor-pointer group transition-all hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 h-full overflow-hidden"
            data-testid={`card-miner-${miner.id}`}
          >
            {/* Large Image Area */}
            <MinerImage minerId={miner.id} name={miner.name} />

            {/* Info Area */}
            <div className="p-4 space-y-3">
              {/* Manufacturer + Name */}
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  {miner.manufacturer}
                </div>
                <h3 className="font-bold text-lg leading-tight mt-0.5 group-hover:text-primary transition-colors">
                  {miner.name}
                </h3>
              </div>

              {/* Specs Row */}
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Cpu className="h-3.5 w-3.5 shrink-0" />
                  <span className="whitespace-nowrap">{miner.hashrate}</span>
                </div>
                <span className="text-border">|</span>
                <div className="flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 shrink-0" />
                  <span className="whitespace-nowrap">{miner.power}</span>
                </div>
                <span className="text-border">|</span>
                <div className="flex items-center gap-1">
                  <Gauge className="h-3.5 w-3.5 shrink-0" />
                  <span className="whitespace-nowrap">{miner.efficiency}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border/50" />

              {/* Price + Badges */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-bold text-lg">{(miner as MinerWithLivePrice).livePriceRange || miner.priceRange}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {miner.legacy && (
                  <Badge
                    variant="outline"
                    className="text-xs px-2 py-0.5 text-amber-700 border-amber-500/40 dark:text-amber-400"
                    data-testid={`badge-legacy-${miner.id}`}
                  >
                    Legacy
                  </Badge>
                )}
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-0.5"
                >
                  {tierLabels[miner.tier]}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs px-2 py-0.5"
                >
                  {miner.algorithm}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs px-2 py-0.5 text-primary border-primary/30"
                >
                  <Wrench className="h-3 w-3 mr-0.5" />
                  {miner.accessories.length} accessories
                </Badge>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

// PWA "Get the App" Banner
function GetTheAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
    }
  };

  if (installed) return null;

  return (
    <div
      className="rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-5 flex flex-col sm:flex-row items-center gap-4"
      data-testid="banner-get-app"
    >
      <div className="flex items-center gap-3 shrink-0">
        <div className="p-2.5 rounded-lg bg-primary/10">
          <Smartphone className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-base">Get the MinerGear App</h3>
          <p className="text-sm text-muted-foreground">
            Install on your phone for quick access — works on iOS & Android
          </p>
        </div>
      </div>
      <div className="sm:ml-auto shrink-0">
        {deferredPrompt ? (
          <Button onClick={handleInstall} size="sm" className="gap-1.5" data-testid="button-install-app">
            <Download className="h-4 w-4" /> Install App
          </Button>
        ) : (
          <div className="text-sm text-muted-foreground text-center sm:text-right">
            <p className="font-medium">To install:</p>
            <p>iOS: Tap <span className="font-semibold">Share → Add to Home Screen</span></p>
            <p>Android: Tap <span className="font-semibold">Menu → Install App</span></p>
          </div>
        )}
      </div>
    </div>
  );
}

// Newsletter placeholder — no email service is connected yet, so we do not
// collect addresses or show a "subscribed" state.
function EmailSubscription() {
  return (
    <div
      className="rounded-xl border border-border bg-card p-6 sm:p-8 text-center"
      data-testid="section-email-subscribe"
    >
      <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
      <h2 className="text-2xl font-bold tracking-tight mb-2">
        Newsletter Coming Soon
      </h2>
      <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto mb-3">
        We're working on a newsletter for new mining hardware, price drops, and firmware updates.
        Until it launches, bookmark MinerGear or install the app — prices are refreshed weekly.
      </p>
      <p className="text-xs text-muted-foreground">
        Questions or tips? Email{" "}
        <a href="mailto:minergear.io@gmail.com" className="underline hover:text-foreground">
          minergear.io@gmail.com
        </a>
      </p>
    </div>
  );
}
