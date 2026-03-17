import { Link } from "wouter";
import { legalDisclaimer } from "@/data/miners";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Scale } from "lucide-react";

export default function Disclaimer() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="px-4 pt-4">
          <div className="mx-auto max-w-3xl">
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

        <section className="px-4 pt-4 pb-12">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-2.5 mb-2">
              <Scale className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold tracking-tight">{legalDisclaimer.title}</h1>
            </div>
            <p className="text-xs text-muted-foreground mb-8">
              Last updated: {legalDisclaimer.lastUpdated}
            </p>

            <div className="space-y-6">
              {legalDisclaimer.sections.map((section, i) => (
                <Card key={i} data-testid={`section-${i}`}>
                  <CardContent className="p-5 sm:p-6">
                    <h2 className="text-sm font-semibold mb-3">{section.heading}</h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
