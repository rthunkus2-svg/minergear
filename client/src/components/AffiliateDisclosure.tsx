import { Link } from "wouter";

export const AMAZON_ASSOCIATE_SENTENCE =
  "As an Amazon Associate I earn from qualifying purchases.";

/** FTC affiliate disclosure. Shown next to every "Where to Buy" list and in the footer. */
export default function AffiliateDisclosure({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <p
      className={`text-xs text-muted-foreground leading-relaxed ${className}`}
      data-testid="affiliate-disclosure"
    >
      <span className="font-semibold">Affiliate disclosure:</span>{" "}
      {AMAZON_ASSOCIATE_SENTENCE} Some other store links on MinerGear are also affiliate links, so we
      may earn a commission if you buy through them, at no extra cost to you.
      {!compact && (
        <>
          {" "}
          This doesn't change our recommendations.{" "}
          <Link href="/disclaimer">
            <span className="underline hover:text-foreground cursor-pointer">Learn more</span>
          </Link>
          .
        </>
      )}
    </p>
  );
}
