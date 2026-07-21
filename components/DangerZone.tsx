import { cn } from '@/lib/utils';

/**
 * Separated bottom section for irreversible actions (cloud console pattern).
 */
export function DangerZone({
  children,
  className,
  description = 'These actions are irreversible. Confirm carefully.',
}: {
  children: React.ReactNode;
  className?: string;
  description?: string;
}) {
  return (
    <section
      className={cn(
        'mt-8 space-y-4 rounded-lg border border-destructive/40 bg-destructive/5 p-4',
        className
      )}
      aria-labelledby="danger-zone-heading"
    >
      <div className="space-y-1">
        <h2
          id="danger-zone-heading"
          className="text-lg font-semibold text-destructive"
        >
          Danger zone
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}
