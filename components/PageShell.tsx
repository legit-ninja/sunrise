import { cn } from "@/lib/utils";

/**
 * Content gutter for pages outside ServiceLayout.
 * Matches header px-6 and ServiceLayout inset p-6 (24px — same as
 * RideConnect --section-gap / --page-padding-x).
 * Do not nest inside ServiceLayout (double padding) or pad root <main>
 * (would inset service sidebars).
 */
export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("px-6 py-6", className)}>{children}</div>;
}
