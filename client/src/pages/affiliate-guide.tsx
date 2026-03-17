import { Link } from "wouter";
import { affiliatePrograms } from "@/data/miners";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ExternalLink,
  DollarSign,
  Clock,
  Wallet,
  Smartphone,
  Globe,
  Download,
} from "lucide-react";

export default function AffiliateGuide() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="px-4 pt-4">
          <div className="mx-auto max-w-4xl">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground gap-1 -ml-2"
                data-testid="link-back"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Header */}
        <section className="px-4 pt-4 pb-8">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center gap-2.5 mb-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold tracking-tight">Affiliate Guide</h1>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              Earn commissions by recommending mining hardware and accessories. Here are the affiliate programs used by MinerGear, with step-by-step signup instructions.
            </p>
          </div>
        </section>

        {/* Programs */}
        <section className="px-4 pb-10">
          <div className="mx-auto max-w-4xl space-y-4">
            {affiliatePrograms.map((program, i) => (
              <Card key={i} data-testid={`program-${i}`}>
                <CardContent className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <h2 className="text-sm font-semibold">{program.name}</h2>
                    <a
                      href={program.signupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`link-signup-${i}`}
                    >
                      <Button size="sm" className="h-7 text-xs gap-1">
                        Sign Up <ExternalLink className="h-3 w-3" />
                      </Button>
                    </a>
                  </div>

                  {/* Key stats */}
                  <div className="flex flex-wrap gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <DollarSign className="h-3.5 w-3.5 text-green-500" />
                      <span>{program.commission}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-blue-500" />
                      <span>{program.cookie}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Wallet className="h-3.5 w-3.5 text-purple-500" />
                      <span>{program.payout}</span>
                    </div>
                  </div>

                  {/* Steps */}
                  <div>
                    <span className="text-xs font-medium text-muted-foreground mb-2 block">
                      How to Sign Up
                    </span>
                    <ol className="space-y-1.5">
                      {program.steps.map((step, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs">
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-4 w-4 flex items-center justify-center shrink-0 mt-0.5 p-0 rounded-full"
                          >
                            {j + 1}
                          </Badge>
                          <span className="text-muted-foreground leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Notes */}
                  <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground leading-relaxed border border-border/50">
                    {program.notes}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* App Store Publishing Guide */}
        <section className="px-4 pb-12">
          <div className="mx-auto max-w-4xl">
            <Card data-testid="section-app-publishing">
              <CardContent className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <h2 className="text-base font-semibold">App Store Publishing</h2>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  MinerGear is a Progressive Web App (PWA) — it can be installed directly on mobile devices from the browser without going through an app store.
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-md bg-muted/50 p-3 border border-border/50">
                    <Globe className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-medium block mb-1">PWA Installation (Recommended)</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Users can install MinerGear directly from their mobile browser. On iOS: tap the Share button → "Add to Home Screen". On Android: tap the browser menu → "Install App" or "Add to Home Screen". The app will appear as a native icon and run in a standalone window.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-md bg-muted/50 p-3 border border-border/50">
                    <Download className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-medium block mb-1">Native App Store Distribution</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        For true App Store (iOS/Android) distribution, you can wrap this web app using Capacitor (by Ionic) or create a React Native version. The Capacitor approach is fastest — it wraps the existing web app in a native shell:
                      </p>
                      <ol className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <li>1. Install Capacitor: <code className="font-mono text-[10px] bg-background px-1 rounded">npm install @capacitor/core @capacitor/cli</code></li>
                        <li>2. Initialize: <code className="font-mono text-[10px] bg-background px-1 rounded">npx cap init</code></li>
                        <li>3. Add platforms: <code className="font-mono text-[10px] bg-background px-1 rounded">npx cap add ios</code> and <code className="font-mono text-[10px] bg-background px-1 rounded">npx cap add android</code></li>
                        <li>4. Build the web app and sync: <code className="font-mono text-[10px] bg-background px-1 rounded">npm run build && npx cap sync</code></li>
                        <li>5. Open in Xcode/Android Studio to submit to app stores</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>Recommendation:</strong> Start with the PWA approach since it's already functional and requires zero additional development. Most MinerGear users are tech-savvy enough to install a PWA. Consider native app store distribution only if you need push notifications, in-app purchases, or broader discoverability.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
