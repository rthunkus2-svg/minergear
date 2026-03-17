import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  Zap,
  Cpu,
  TrendingUp,
  Shield,
  Coins,
  ArrowRight,
  RefreshCw,
  Flame,
  Pickaxe,
  Globe,
  Wallet,
  ChevronRight,
} from "lucide-react";

interface CoinPrice {
  usd: number;
  usd_24h_change: number;
}

interface PriceData {
  bitcoin: CoinPrice;
  ethereum: CoinPrice;
  litecoin: CoinPrice;
  dogecoin: CoinPrice;
  kaspa: CoinPrice;
}

const COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", icon: "₿" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", icon: "Ξ" },
  { id: "litecoin", symbol: "LTC", name: "Litecoin", icon: "Ł" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", icon: "Ð" },
  { id: "kaspa", symbol: "KAS", name: "Kaspa", icon: "K" },
];

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
}

function PriceTicker() {
  const { data, isLoading, isError, dataUpdatedAt } = useQuery<PriceData>({
    queryKey: ["/crypto-prices"],
    queryFn: async () => {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin,dogecoin,kaspa&vs_currencies=usd&include_24hr_change=true"
      );
      if (!res.ok) throw new Error("Failed to fetch prices");
      return res.json();
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });

  if (isError) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center text-sm text-destructive">
        Unable to load live prices. Please try again later.
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Live Crypto Prices
        </h3>
        {dataUpdatedAt > 0 && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            Updates every 60s
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {COINS.map((coin) => {
          if (isLoading) {
            return (
              <div key={coin.id} className="bg-background/60 rounded-lg p-3 space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-3 w-14" />
              </div>
            );
          }
          const priceInfo = data?.[coin.id as keyof PriceData];
          const change = priceInfo?.usd_24h_change ?? 0;
          const isPositive = change >= 0;
          return (
            <div
              key={coin.id}
              className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/40 hover:border-primary/30 transition-colors"
              data-testid={`ticker-${coin.symbol.toLowerCase()}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-lg font-bold text-primary">{coin.icon}</span>
                <span className="text-xs font-medium text-muted-foreground">{coin.symbol}</span>
              </div>
              <div className="text-base font-bold text-foreground">
                {priceInfo ? formatPrice(priceInfo.usd) : "—"}
              </div>
              <div
                className={`text-xs font-medium ${
                  isPositive ? "text-emerald-500" : "text-red-500"
                }`}
              >
                {isPositive ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
        </div>
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">{children}</div>
      </CardContent>
    </Card>
  );
}

function HighlightBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm text-foreground">
      {children}
    </div>
  );
}

export default function Mining101() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
          {/* Hero */}
          <div className="text-center space-y-3">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Mining <span className="text-primary">101</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Everything you need to know about cryptocurrency, how mining works, and why thousands
              of people are mining from home.
            </p>
          </div>

          {/* Live Ticker */}
          <PriceTicker />

          {/* What is Cryptocurrency */}
          <SectionCard icon={Coins} title="What is Cryptocurrency?">
            <p>
              Cryptocurrency is digital money that runs on a decentralized network called a{" "}
              <strong className="text-foreground">blockchain</strong>. Unlike traditional currencies
              controlled by banks and governments, crypto is maintained by thousands of computers
              around the world — including, potentially, yours.
            </p>
            <p>
              Every transaction is recorded on a public ledger that anyone can verify but no one can
              alter. This means no middlemen, no bank fees on transfers, and no single point of
              failure.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-background/80 rounded-lg p-3 border border-border/40">
                <span className="text-lg font-bold text-primary">₿</span>
                <h4 className="font-semibold text-foreground text-sm mt-1">Bitcoin (BTC)</h4>
                <p className="text-xs mt-1">
                  The original cryptocurrency — digital gold. Capped at 21 million coins, making it
                  scarce by design. The most widely held and trusted crypto asset.
                </p>
              </div>
              <div className="bg-background/80 rounded-lg p-3 border border-border/40">
                <span className="text-lg font-bold text-primary">Ξ</span>
                <h4 className="font-semibold text-foreground text-sm mt-1">Ethereum (ETH)</h4>
                <p className="text-xs mt-1">
                  More than just money — it powers smart contracts and decentralized apps. The
                  backbone of DeFi, NFTs, and Web3.
                </p>
              </div>
              <div className="bg-background/80 rounded-lg p-3 border border-border/40">
                <span className="text-lg font-bold text-primary">Ł</span>
                <h4 className="font-semibold text-foreground text-sm mt-1">Litecoin (LTC)</h4>
                <p className="text-xs mt-1">
                  Known as digital silver to Bitcoin's gold. Faster transactions and lower fees, making
                  it great for everyday payments.
                </p>
              </div>
              <div className="bg-background/80 rounded-lg p-3 border border-border/40">
                <span className="text-lg font-bold text-primary">Ð</span>
                <h4 className="font-semibold text-foreground text-sm mt-1">Dogecoin (DOGE)</h4>
                <p className="text-xs mt-1">
                  Started as a meme, became a movement. A massive community, low transaction fees, and
                  merged-mining with Litecoin using Scrypt ASICs.
                </p>
              </div>
            </div>
          </SectionCard>

          {/* How Mining Works */}
          <SectionCard icon={Pickaxe} title="How Does Mining Work?">
            <p>
              Mining is the process of using specialized hardware to verify and secure cryptocurrency
              transactions. Think of miners as the accountants of the blockchain — they confirm that
              every transaction is legitimate and add it to the permanent record.
            </p>
            <p>
              Your mining hardware (called an <strong className="text-foreground">ASIC miner</strong>)
              races to solve complex mathematical puzzles. The first miner to solve the puzzle gets to
              add the next "block" of transactions to the blockchain — and earns a{" "}
              <strong className="text-foreground">block reward</strong> for doing so.
            </p>
            <HighlightBox>
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Current Bitcoin Block Reward: 3.125 BTC</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Every ~10 minutes, a miner somewhere in the world earns 3.125 Bitcoin for solving a
                    block. At current prices, that's a substantial payout — and it could be you.
                  </p>
                </div>
              </div>
            </HighlightBox>
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Transactions are broadcast</p>
                  <p className="text-xs">When someone sends Bitcoin, the transaction enters a waiting pool.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Miners compete to solve the puzzle</p>
                  <p className="text-xs">
                    Your ASIC miner runs trillions of calculations per second (terahashes) trying to
                    find the solution.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Winner takes the reward</p>
                  <p className="text-xs">
                    The first miner to find the answer gets the block reward plus transaction fees.
                    Everyone else starts on the next block.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-background/80 rounded-lg p-4 border border-border/40 mt-2">
              <h4 className="font-semibold text-foreground text-sm mb-2">Pool Mining vs Solo Mining</h4>
              <p className="text-xs">
                <strong className="text-foreground">Pool mining</strong> means combining your hashpower
                with other miners to find blocks more consistently and split the rewards. Steady,
                predictable income.
              </p>
              <p className="text-xs mt-2">
                <strong className="text-foreground">Solo mining</strong> means going it alone — lower
                odds of hitting a block, but when you do, the entire reward is yours. Small miners like
                the Bitaxe have{" "}
                <span className="text-primary font-medium">actually hit full Bitcoin blocks</span>,
                earning their owners 3.125 BTC in a single moment. It's like the lottery, but you get
                to keep the ticket running 24/7.
              </p>
            </div>
          </SectionCard>

          {/* Why Mine From Home */}
          <SectionCard icon={Flame} title="Why Mine From Home?">
            <p>
              Home mining has exploded in popularity — and for good reason. It's not just about
              profit. It's about participating in something revolutionary from your own home.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-3 bg-background/80 rounded-lg p-3 border border-border/40">
                <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Financial Sovereignty</p>
                  <p className="text-xs mt-1">
                    Be your own bank. Mine your own Bitcoin. No permission needed from anyone.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-background/80 rounded-lg p-3 border border-border/40">
                <TrendingUp className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Passive Income</p>
                  <p className="text-xs mt-1">
                    Set it and forget it. Your miner works 24/7, stacking sats while you sleep.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-background/80 rounded-lg p-3 border border-border/40">
                <Flame className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Heat Your Home</p>
                  <p className="text-xs mt-1">
                    Miners produce heat as a byproduct. In winter, your miner doubles as a space
                    heater — offsetting heating costs while earning crypto.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-background/80 rounded-lg p-3 border border-border/40">
                <Globe className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Strengthen the Network</p>
                  <p className="text-xs mt-1">
                    Every home miner makes Bitcoin more decentralized and censorship-resistant. You're
                    directly contributing to the network's security.
                  </p>
                </div>
              </div>
            </div>
            <HighlightBox>
              <p className="font-medium text-foreground">
                Real talk: A Bitaxe Gamma costs under $100 and uses about 15 watts — less than a light
                bulb. You won't get rich from it, but you're in the game. Solo miners with small
                devices have hit full blocks worth tens of thousands of dollars. It happens.
              </p>
            </HighlightBox>
            <p>
              For more serious setups, industrial ASIC miners like the Antminer S21 Pro can generate
              meaningful daily revenue depending on your electricity rate. Many home miners in areas
              with cheap power are running profitable operations from their garage or basement.
            </p>
          </SectionCard>

          {/* Getting Started */}
          <SectionCard icon={Cpu} title="Getting Started">
            <p>
              Ready to start mining? Here's what you need:
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Cpu className="h-3 w-3 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">A Miner</p>
                  <p className="text-xs">
                    From a $77 Bitaxe for hobby solo mining to a $5,000+ Antminer S21 Pro for serious
                    hashpower. Pick based on your budget, noise tolerance, and power availability.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="h-3 w-3 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Power Supply</p>
                  <p className="text-xs">
                    Small miners like Bitaxe use USB-C. Industrial miners need a proper PSU and
                    typically a 240V circuit. Know your electrical setup before buying.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Globe className="h-3 w-3 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Internet Connection</p>
                  <p className="text-xs">
                    Mining uses surprisingly little bandwidth. A basic home internet connection is all
                    you need. Hardwired Ethernet is recommended for reliability.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Wallet className="h-3 w-3 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">A Wallet</p>
                  <p className="text-xs">
                    You'll need a Bitcoin wallet to receive your mining rewards. Hardware wallets
                    (cold storage) are the most secure option for holding your crypto.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-2">
              <p className="font-medium text-foreground text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Know Your Electricity Cost
              </p>
              <p className="text-xs mt-1">
                Your electricity rate is the single biggest factor in mining profitability. Check your
                utility bill — anything under $0.10/kWh is considered good for mining. Many miners
                target off-peak rates or negotiate commercial power contracts.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/">
                <Button
                  className="w-full sm:w-auto gap-2"
                  data-testid="button-browse-miners"
                >
                  Browse Miners & Accessories
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </SectionCard>
        </div>
      </main>
      <Footer />
    </div>
  );
}
