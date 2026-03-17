import { useState, useMemo } from "react";
import { Link } from "wouter";
import { miners, manufacturers, categoryLabels, tierLabels } from "@/data/miners";
import type { Miner } from "@/data/miners";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  ChevronRight,
  Filter,
  X,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type SortOption =
  | "alpha"
  | "price-asc"
  | "price-desc"
  | "hashrate-desc"
  | "power-asc"
  | "efficiency-asc";

const sortLabels: Record<SortOption, string> = {
  alpha: "Alphabetical",
  "price-asc": "Price: Low → High",
  "price-desc": "Price: High → Low",
  "hashrate-desc": "Hashrate: High → Low",
  "power-asc": "Power: Low → High",
  "efficiency-asc": "Efficiency: Best First",
};

function sortMiners(list: Miner[], sortBy: SortOption): Miner[] {
  const sorted = [...list];
  switch (sortBy) {
    case "alpha":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "price-asc":
      return sorted.sort((a, b) => a.priceNum - b.priceNum);
    case "price-desc":
      return sorted.sort((a, b) => b.priceNum - a.priceNum);
    case "hashrate-desc":
      return sorted.sort((a, b) => b.hashrateNum - a.hashrateNum);
    case "power-asc":
      return sorted.sort((a, b) => a.powerNum - b.powerNum);
    case "efficiency-asc":
      return sorted.sort((a, b) => a.efficiencyNum - b.efficiencyNum);
    default:
      return sorted;
  }
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("alpha");
  const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    const list = miners.filter((m) => {
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
    });
    return sortMiners(list, sortBy);
  }, [search, selectedManufacturer, selectedTier, selectedCategory, sortBy]);

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
        <section className="px-4 pt-10 pb-8">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-xl font-bold tracking-tight">
              Miner<span className="text-primary">Gear</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1.5 max-w-xl leading-relaxed">
              Find the right power supplies, cooling upgrades, firmware, and accessories for your crypto mining hardware — with real prices and direct purchase links.
            </p>
          </div>
        </section>

        {/* Search, Sort & Filters */}
        <section className="px-4 pb-6">
          <div className="mx-auto max-w-6xl space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search miners (e.g. S21, Avalon Q, Bitaxe)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10"
                  data-testid="input-search"
                />
              </div>
              <Button
                variant={showFilters ? "secondary" : "outline"}
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={() => setShowFilters(!showFilters)}
                data-testid="button-toggle-filters"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Sort by:</span>
              <Select
                value={sortBy}
                onValueChange={(v) => setSortBy(v as SortOption)}
              >
                <SelectTrigger className="h-8 text-xs w-[200px]" data-testid="select-sort">
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
            </div>

            {showFilters && (
              <div className="space-y-3 p-4 rounded-lg bg-card border border-card-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Filters
                  </span>
                  {hasFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-7 text-xs gap-1"
                      data-testid="button-clear-filters"
                    >
                      <X className="h-3 w-3" /> Clear
                    </Button>
                  )}
                </div>
                {/* Category */}
                <div>
                  <span className="text-xs text-muted-foreground mb-1.5 block">Category</span>
                  <div className="flex flex-wrap gap-1.5">
                    {uniqueCategories.map((cat) => (
                      <Badge
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "outline"}
                        className="cursor-pointer text-xs"
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
                  <span className="text-xs text-muted-foreground mb-1.5 block">Tier</span>
                  <div className="flex flex-wrap gap-1.5">
                    {uniqueTiers.map((tier) => (
                      <Badge
                        key={tier}
                        variant={selectedTier === tier ? "default" : "outline"}
                        className="cursor-pointer text-xs"
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
                  <span className="text-xs text-muted-foreground mb-1.5 block">Manufacturer</span>
                  <div className="flex flex-wrap gap-1.5">
                    {manufacturers.map((mfg) => (
                      <Badge
                        key={mfg}
                        variant={selectedManufacturer === mfg ? "default" : "outline"}
                        className="cursor-pointer text-xs"
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
        <section className="px-4 pb-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-muted-foreground">
                {filtered.length} miner{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((miner) => (
                <Link key={miner.id} href={`/miner/${miner.id}`}>
                  <Card
                    className="cursor-pointer group transition-colors hover:border-primary/40 h-full"
                    data-testid={`card-miner-${miner.id}`}
                  >
                    <CardContent className="p-4 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs text-muted-foreground">
                            {miner.manufacturer}
                          </div>
                          <h3 className="font-semibold text-sm truncate">
                            {miner.name}
                          </h3>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Cpu className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{miner.hashrate}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Zap className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{miner.power}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Gauge className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{miner.efficiency}</span>
                        </div>
                      </div>

                      {/* Price Range */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <DollarSign className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="font-medium">{miner.priceRange}</span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {tierLabels[miner.tier]}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {miner.algorithm}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 text-primary border-primary/30"
                        >
                          <Wrench className="h-2.5 w-2.5 mr-0.5" />
                          {miner.accessories.length} accessories
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-sm">No miners found matching your filters.</p>
                <Button
                  variant="link"
                  onClick={() => {
                    clearFilters();
                    setSearch("");
                  }}
                  className="mt-2 text-xs"
                  data-testid="button-clear-all"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
