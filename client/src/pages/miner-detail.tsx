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
import { minerImages } from "@/data/miner-images";
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

const categoryBorderColors: Record<AccessoryCategory, string> = {
  power: "border-yellow-500/50",
  cooling: "border-blue-400/50",
  firmware: "border-green-500/50",
  upgrade: "border-purple-500/50",
  infrastructure: "border-orange-500/50",
};

const categoryBgColors: Record<AccessoryCategory, string> = {
  power: "bg-yellow-500/10",
  cooling: "bg-blue-400/10",
  firmware: "bg-green-500/10",
  upgrade: "bg-purple-500/10",
  infrastructure: "bg-orange-500/10",
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

function MinerDetailImage({ minerId, name }: { minerId: string; name: string }) {
  const src = minerImages[minerId];
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="w-full aspect-[16/9] max-h-[280px] rounded-xl bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
        <Cpu className="h-16 w-16 text-muted-foreground/30" />
      </div>
    );
  }

  return (
    <div className="w-full aspect-[16/9] max-h-[280px] rounded-xl bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-800/80 dark:to-slate-900/60 overflow-hidden flex items-center justify-center p-8">
      <img
        src={src}
        alt={name}
        className="w-full h-full object-contain drop-shadow-lg"
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

function VendorTable({ vendors }: { vendors: VendorListing[] }) {
  const sorted = [...vendors].sort((a, b) => {
    const priceA = parseFloat(a.price.replace(/[^0-9.]/g, "")) || 0;
    const priceB = parseFloat(b.price.replace(/[^0-9.]/g, "")) || 0;
    return priceA - priceB;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" data-testid="table-vendors">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Vendor</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Price</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">Stock</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Notes</th>
            <th className="text-right py-3 px-4 font-medium text-muted-foreground"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((v, i) => (
            <tr
              key={v.url}
              className={`border-b border-border/50 ${i === 0 ? "bg-primary/5" : ""}`}
              data-testid={`vendor-row-${i}`}
            >
              <td className="py-3 px-4">
                <span className="font-medium text-base">{v.store}</span>
              </td>
              <td className="py-3 px-4 font-bold whitespace-nowrap text-base">
                {v.price}
                {i === 0 && (
                  <span className="text-xs text-primary ml-1.5 font-normal">Best</span>
                )}
              </td>
              <td className="py-3 px-4 hidden sm:table-cell">
                {v.inStock ? (
                  <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm">
                    <CheckCircle className="h-4 w-4" /> In Stock
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                    <XCircle className="h-4 w-4" /> Out of Stock
                  </span>
                )}
              </td>
              <td className="py-3 px-4 text-muted-foreground hidden md:table-cell max-w-[200px] truncate text-sm">
                {v.notes}
              </td>
              <td className="py-3 px-4 text-right">
                <a
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`link-vendor-buy-${i}`}
                >
                  <Button
                    size="sm"
                    variant={i === 0 ? "default" : "outline"}
                    className="h-9 text-sm gap-1.5"
                  >
                    Buy <ExternalLink className="h-3.5 w-3.5" />
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
      <CardContent className="p-5 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 ${colorClass}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`text-xs px-2 py-0.5 ${rankColor(accessory.rank)}`}>
                <Award className="h-3 w-3 mr-0.5" />
                {rankLabel(accessory.rank)}
              </Badge>
              {accessory.essential && (
                <Badge variant="default" className="text-xs px-2 py-0.5 gap-0.5">
                  <Star className="h-3 w-3" /> Essential
                </Badge>
              )}
            </div>
            <h4 className="font-bold text-base mt-2 leading-tight">
              {accessory.name}
            </h4>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {accessory.description}
        </p>

        {/* Setup Insight (collapsible) */}
        <Collapsible open={insightOpen} onOpenChange={setInsightOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-sm gap-1.5 text-muted-foreground hover:text-foreground w-full justify-start px-2"
              data-testid={`button-insight-${accessory.id}`}
            >
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Setup Insight
              <ChevronDown
                className={`h-3.5 w-3.5 ml-auto transition-transform ${insightOpen ? "rotate-180" : ""}`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="rounded-md bg-muted/50 p-3 mt-1 text-sm text-muted-foreground leading-relaxed border border-border/50">
              {accessory.insight}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Products */}
        <div className="space-y-2 pt-1">
          <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
            <ShoppingCart className="h-4 w-4" /> Where to Buy
          </span>
          <div className="space-y-2">
            {sortedProducts.map((product) => (
              <div
                key={product.url}
                className="flex items-center justify-between gap-2 rounded-md border border-border/50 p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{product.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {product.store}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-bold whitespace-nowrap">{product.price}</span>
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`link-buy-${accessory.id}-${product.store.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1 px-3">
                      Buy <ExternalLink className="h-3 w-3" />
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
                className="h-8 text-sm text-muted-foreground gap-1 -ml-2"
                data-testid="link-back"
              >
                <ChevronLeft className="h-4 w-4" /> All Miners
              </Button>
            </Link>
          </div>
        </div>

        {/* Miner Hero */}
        <section className="px-4 pt-2 pb-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-6 items-start">
              {/* Image */}
              <MinerDetailImage minerId={miner.id} name={miner.name} />

              {/* Info */}
              <div>
                <span className="text-sm text-muted-foreground uppercase tracking-wide">{miner.manufacturer}</span>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">{miner.name}</h1>

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {tierLabels[miner.tier]}
                  </Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {miner.algorithm}
                  </Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1 font-bold">
                    {miner.priceRange}
                  </Badge>
                  {essentialCount > 0 && (
                    <Badge variant="outline" className="text-sm px-3 py-1 text-primary border-primary/30">
                      {essentialCount} essential item{essentialCount !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <StatCard icon={Cpu} label="Hashrate" value={miner.hashrate} />
                  <StatCard icon={Zap} label="Power" value={miner.power} />
                  <StatCard icon={Gauge} label="Efficiency" value={miner.efficiency} />
                  <StatCard icon={Thermometer} label="Cooling" value={miner.cooling} />
                  <StatCard icon={Plug} label="Voltage" value={miner.voltage} />
                  <StatCard icon={Calendar} label="Released" value={String(miner.releaseYear)} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Where to Buy */}
        <section className="px-4 pb-10">
          <div className="mx-auto max-w-6xl">
            <Card>
              <CardContent className="p-5 sm:p-6">
                <h2 className="text-2xl font-bold mb-5 flex items-center gap-2.5">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                  Where to Buy This Miner
                </h2>
                <VendorTable vendors={miner.vendors} />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Accessories by Category */}
        <section className="px-4 pb-10">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-2">
              Accessories & Upgrades
            </h2>
            <p className="text-base text-muted-foreground mb-8">
              {miner.accessories.length} recommended item{miner.accessories.length !== 1 ? "s" : ""} for your {miner.name} — listed in order of importance.
            </p>

            <div className="space-y-10">
              {accessoriesByCategory.map((group) => {
                const CatIcon = categoryIcons[group.category];
                const catColor = categoryColors[group.category];
                const catBorder = categoryBorderColors[group.category];
                const catBg = categoryBgColors[group.category];
                return (
                  <div key={group.category}>
                    {/* Category Header — Large & Bold */}
                    <div className={`flex items-center gap-4 mb-6 pb-4 border-b-2 ${catBorder}`}>
                      <div className={`p-3 rounded-xl ${catBg}`}>
                        <CatIcon className={`h-8 w-8 ${catColor}`} />
                      </div>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-extrabold leading-tight tracking-tight">
                          {accessoryCategoryLabels[group.category]}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          {group.items.length} option{group.items.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
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
        <section className="px-4 pb-10">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold mb-4">
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
                      className="cursor-pointer text-sm hover:border-primary/50 hover:text-primary gap-1 py-1.5 px-3"
                      data-testid={`link-related-${m.id}`}
                    >
                      {m.name}
                      <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
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
      className="rounded-lg border border-card-border bg-card p-3.5 space-y-1.5"
      data-testid={`stat-${label.toLowerCase()}`}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs uppercase tracking-wider font-medium">{label}</span>
      </div>
      <div className="text-base font-bold truncate">{value}</div>
    </div>
  );
}
