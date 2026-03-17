import { useMemo, useState } from "react";
import { useParams, Link } from "wouter";
import {
  miners,
  accessoryCategoryLabels,
  tierLabels,
  type AccessoryCategory,
  type Accessory,
  type VendorListing,
} from "@/data/miners";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronLeft,
  Cpu,
  Zap,
  Gauge,
  Thermometer,
  Plug,
  Calendar,
  ExternalLink,
  Snowflake,
  Activity,
  TrendingUp,
  Cable,
  Star,
  ShoppingCart,
  CheckCircle,
  XCircle,
  ChevronDown,
  Lightbulb,
  Award,
} from "lucide-react";

const categoryIcons: Record<AccessoryCategory, typeof Zap> = {
  power: Zap,
  cooling: Snowflake,
  firmware: Activity,
  upgrade: TrendingUp,
  infrastructure: Cable,
};

const categoryColors: Record<AccessoryCategory, string> = {
  power: "text-yellow-500 dark:text-yellow-400",
  cooling: "text-blue-400 dark:text-blue-300",
  firmware: "text-green-500 dark:text-green-400",
  upgrade: "text-purple-500 dark:text-purple-400",
  infrastructure: "text-orange-500 dark:text-orange-400",
};

const categoryOrder: AccessoryCategory[] = [
  "power",
  "cooling",
  "firmware",
  "upgrade",
  "infrastructure",
];

function rankLabel(rank: number): string {
  if (rank === 1) return "#1 Recommended";
  return `#${rank}`;
}

function rankColor(rank: number): string {
  if (rank === 1) return "bg-primary text-primary-foreground";
  if (rank === 2) return "bg-secondary text-secondary-foreground";
  return "bg-muted text-muted-foreground";
}

function VendorTable({ vendors }: { vendors: VendorListing[] }) {
  const sorted = [...vendors].sort((a, b) => {
    const priceA = parseFloat(a.price.replace(/[^0-9.]/g, "")) || 0;
    const priceB = parseFloat(b.price.replace(/[^0-9.]/g, "")) || 0;
    return priceA - priceB;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs" data-testid="table-vendors">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-3 font-medium text-muted-foreground">Vendor</th>
            <th className="text-left py-2 px-3 font-medium text-muted-foreground">Price</th>
            <th className="text-left py-2 px-3 font-medium text-muted-foreground hidden sm:table-cell">Stock</th>
            <th className="text-left py-2 px-3 font-medium text-muted-foreground hidden md:table-cell">Notes</th>
            <th className="text-right py-2 px-3 font-medium text-muted-foreground"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((v, i) => (
            <tr
              key={v.url}
              className={`border-b border-border/50 ${i === 0 ? "bg-primary/5" : ""}`}
              data-testid={`vendor-row-${i}`}
            >
              <td className="py-2.5 px-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium">{v.store}</span>

                </div>
              </td>
              <td className="py-2.5 px-3 font-semibold whitespace-nowrap">
                {v.price}
                {i === 0 && (
                  <span className="text-[9px] text-primary ml-1 font-normal">Best</span>
                )}
              </td>
              <td className="py-2.5 px-3 hidden sm:table-cell">
                {v.inStock ? (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-3 w-3" /> In Stock
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <XCircle className="h-3 w-3" /> Out of Stock
                  </span>
                )}
              </td>
              <td className="py-2.5 px-3 text-muted-foreground hidden md:table-cell max-w-[200px] truncate">
                {v.notes}
              </td>
              <td className="py-2.5 px-3 text-right">
                <a
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`link-vendor-buy-${i}`}
                >
                  <Button
                    size="sm"
                    variant={i === 0 ? "default" : "outline"}
                    className="h-7 text-xs gap-1"
                  >
                    Buy <ExternalLink className="h-3 w-3" />
                  </Button>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AccessoryItem({ accessory }: { accessory: Accessory }) {
  const [insightOpen, setInsightOpen] = useState(false);
  const Icon = categoryIcons[accessory.category];
  const colorClass = categoryColors[accessory.category];

  const sortedProducts = [...accessory.products].sort((a, b) => {
    const priceA = parseFloat(a.price.replace(/[^0-9.]/g, "")) || 0;
    const priceB = parseFloat(b.price.replace(/[^0-9.]/g, "")) || 0;
    return priceA - priceB;
  });

  return (
    <Card className="h-full" data-testid={`card-accessory-${accessory.id}`}>
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 ${colorClass}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`text-[10px] px-1.5 py-0 ${rankColor(accessory.rank)}`}>
                <Award className="h-2.5 w-2.5 mr-0.5" />
                {rankLabel(accessory.rank)}
              </Badge>
              {accessory.essential && (
                <Badge variant="default" className="text-[10px] px-1.5 py-0 gap-0.5">
                  <Star className="h-2.5 w-2.5" /> Essential
                </Badge>
              )}
            </div>
            <h4 className="font-semibold text-sm mt-1.5 leading-tight">
              {accessory.name}
            </h4>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {accessory.description}
        </p>

        {/* Setup Insight (collapsible) */}
        <Collapsible open={insightOpen} onOpenChange={setInsightOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground w-full justify-start px-2"
              data-testid={`button-insight-${accessory.id}`}
            >
              <Lightbulb className="h-3 w-3 text-yellow-500" />
              Setup Insight
              <ChevronDown
                className={`h-3 w-3 ml-auto transition-transform ${insightOpen ? "rotate-180" : ""}`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="rounded-md bg-muted/50 p-3 mt-1 text-xs text-muted-foreground leading-relaxed border border-border/50">
              {accessory.insight}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Products */}
        <div className="space-y-1.5 pt-1">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <ShoppingCart className="h-3 w-3" /> Where to Buy
          </span>
          <div className="space-y-1.5">
            {sortedProducts.map((product) => (
              <div
                key={product.url}
                className="flex items-center justify-between gap-2 rounded-md border border-border/50 p-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium truncate">{product.name}</div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <span>{product.store}</span>

                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold whitespace-nowrap">{product.price}</span>
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`link-buy-${accessory.id}-${product.store.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1 px-2">
                      Buy <ExternalLink className="h-2.5 w-2.5" />
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MinerDetail() {
  const { id } = useParams<{ id: string }>();
  const miner = useMemo(() => miners.find((m) => m.id === id), [id]);

  if (!miner) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <p className="text-muted-foreground">Miner not found.</p>
            <Link href="/">
              <Button variant="outline" size="sm" data-testid="link-back-home">
                <ChevronLeft className="h-4 w-4 mr-1" /> Back to all miners
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Group accessories by category in defined order
  const accessoriesByCategory = categoryOrder
    .map((cat) => ({
      category: cat,
      items: miner.accessories
        .filter((a) => a.category === cat)
        .sort((a, b) => a.rank - b.rank),
    }))
    .filter((g) => g.items.length > 0);

  const essentialCount = miner.accessories.filter((a) => a.essential).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="px-4 pt-4">
          <div className="mx-auto max-w-6xl">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground gap-1 -ml-2"
                data-testid="link-back"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> All Miners
              </Button>
            </Link>
          </div>
        </div>

        {/* Miner Info */}
        <section className="px-4 pt-2 pb-6">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="min-w-0">
                <span className="text-xs text-muted-foreground">{miner.manufacturer}</span>
                <h1 className="text-xl font-bold tracking-tight">{miner.name}</h1>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <StatCard icon={Cpu} label="Hashrate" value={miner.hashrate} />
              <StatCard icon={Zap} label="Power" value={miner.power} />
              <StatCard icon={Gauge} label="Efficiency" value={miner.efficiency} />
              <StatCard icon={Thermometer} label="Cooling" value={miner.cooling} />
              <StatCard icon={Plug} label="Voltage" value={miner.voltage} />
              <StatCard icon={Calendar} label="Released" value={String(miner.releaseYear)} />
            </div>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {tierLabels[miner.tier]}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {miner.algorithm}
              </Badge>
              <Badge variant="outline" className="text-xs font-semibold">
                {miner.priceRange}
              </Badge>
              {essentialCount > 0 && (
                <Badge variant="outline" className="text-xs text-primary border-primary/30">
                  {essentialCount} essential item{essentialCount !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>
        </section>

        {/* Where to Buy */}
        <section className="px-4 pb-8">
          <div className="mx-auto max-w-6xl">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                  Where to Buy This Miner
                </h2>
                <VendorTable vendors={miner.vendors} />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Accessories by Category */}
        <section className="px-4 pb-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-base font-semibold mb-6">
              Accessories & Upgrades
              <span className="text-xs text-muted-foreground font-normal ml-2">
                {miner.accessories.length} item{miner.accessories.length !== 1 ? "s" : ""}
              </span>
            </h2>

            <div className="space-y-8">
              {accessoriesByCategory.map((group) => {
                const CatIcon = categoryIcons[group.category];
                const catColor = categoryColors[group.category];
                return (
                  <div key={group.category}>
                    <div className="flex items-center gap-2 mb-3">
                      <CatIcon className={`h-4 w-4 ${catColor}`} />
                      <h3 className="text-sm font-semibold">
                        {accessoryCategoryLabels[group.category]}
                      </h3>
                      <span className="text-[10px] text-muted-foreground">
                        ({group.items.length})
                      </span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {group.items.map((acc) => (
                        <AccessoryItem key={acc.id} accessory={acc} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Related Miners */}
        <section className="px-4 pb-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-base font-semibold mb-3">
              Other {miner.manufacturer} Miners
            </h2>
            <div className="flex gap-2 flex-wrap">
              {miners
                .filter((m) => m.manufacturer === miner.manufacturer && m.id !== miner.id)
                .slice(0, 6)
                .map((m) => (
                  <Link key={m.id} href={`/miner/${m.id}`}>
                    <Badge
                      variant="outline"
                      className="cursor-pointer text-xs hover:border-primary/50 hover:text-primary gap-1 py-1"
                      data-testid={`link-related-${m.id}`}
                    >
                      {m.name}
                      <ChevronLeft className="h-3 w-3 rotate-180" />
                    </Badge>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Cpu;
  label: string;
  value: string;
}) {
  return (
    <div
      className="rounded-lg border border-card-border bg-card p-3 space-y-1"
      data-testid={`stat-${label.toLowerCase()}`}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] uppercase tracking-wider font-medium">{label}</span>
      </div>
      <div className="text-sm font-semibold truncate">{value}</div>
    </div>
  );
}
