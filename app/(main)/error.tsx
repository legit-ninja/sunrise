'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-start gap-4 px-6 py-12">
      <h1 className="text-3xl font-bold text-foreground">Something went wrong</h1>
      <p className="text-muted-foreground">
        This page failed to load. Try again, or return to Overview. If the problem
        continues, refresh your session or pick another project.
      </p>
      {error.digest ? (
        <p className="font-mono text-xs text-muted-foreground">
          Reference: {error.digest}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/">Overview</Link>
        </Button>
      </div>
    </div>
  );
}
