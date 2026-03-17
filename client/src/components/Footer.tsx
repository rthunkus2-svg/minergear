import { Link } from "wouter";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";

export default function Footer() {
  return (
    <footer className="border-t border-border/60 mt-16 py-8 px-4">
      <div className="mx-auto max-w-6xl flex flex-col items-center gap-4 text-xs text-muted-foreground">
        {/* Nav Links */}
        <div className="flex items-center gap-4" data-testid="footer-nav">
          <Link href="/">
            <span className="hover:text-foreground cursor-pointer transition-colors" data-testid="footer-link-home">
              Miners
            </span>
          </Link>
          <span className="text-border">|</span>
          <Link href="/affiliate-guide">
            <span className="hover:text-foreground cursor-pointer transition-colors" data-testid="footer-link-affiliate">
              Affiliate Guide
            </span>
          </Link>
          <span className="text-border">|</span>
          <Link href="/disclaimer">
            <span className="hover:text-foreground cursor-pointer transition-colors" data-testid="footer-link-disclaimer">
              Disclaimer
            </span>
          </Link>
        </div>

        <p className="text-center max-w-lg leading-relaxed">
          Some links may support this project at no extra cost to you.
          Prices are approximate — always verify before purchasing. Not financial advice.
        </p>

        <PerplexityAttribution />
      </div>
    </footer>
  );
}
