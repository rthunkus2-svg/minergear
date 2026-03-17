import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Miners" },
  { href: "/learn", label: "Mining 101" },
  { href: "/disclaimer", label: "Disclaimer" },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 h-14">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2.5 cursor-pointer" data-testid="link-home">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-label="MinerGear logo">
              <rect x="2" y="2" width="28" height="28" rx="6" stroke="currentColor" strokeWidth="2" className="text-primary" />
              <rect x="7" y="8" width="4" height="4" rx="1" fill="currentColor" className="text-primary" />
              <rect x="14" y="8" width="4" height="4" rx="1" fill="currentColor" className="text-primary" />
              <rect x="21" y="8" width="4" height="4" rx="1" fill="currentColor" className="text-primary" />
              <rect x="7" y="14" width="4" height="4" rx="1" fill="currentColor" className="text-primary opacity-60" />
              <rect x="14" y="14" width="4" height="4" rx="1" fill="currentColor" className="text-primary opacity-60" />
              <rect x="21" y="14" width="4" height="4" rx="1" fill="currentColor" className="text-primary opacity-60" />
              <rect x="7" y="20" width="18" height="4" rx="1" fill="currentColor" className="text-primary opacity-40" />
            </svg>
            <span className="font-semibold text-base tracking-tight">
              Miner<span className="text-primary">Gear</span>
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" data-testid="nav-desktop">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 text-xs ${
                  location === link.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`nav-link-${link.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Right side: theme + mobile menu */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            data-testid="button-theme-toggle"
            className="h-9 w-9"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-md px-4 py-3 space-y-1" data-testid="nav-mobile">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start h-9 text-sm ${
                  location === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid={`mobile-nav-link-${link.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
