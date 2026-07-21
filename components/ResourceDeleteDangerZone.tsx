'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DangerZone } from '@/components/DangerZone';
import { ConfirmDestructiveDialog } from '@/components/ConfirmDestructiveDialog';

type ResourceDeleteDangerZoneProps = {
  /** Display name shown in confirm copy */
  resourceName: string;
  /** Kind for copy, e.g. "instance", "volume" */
  resourceKind: string;
  /** Consequence sentence after the name */
  consequence: string;
  confirmLabel?: string;
  description?: string;
  redirectTo: string;
  onDelete: () => Promise<void>;
};

export function ResourceDeleteDangerZone({
  resourceName,
  resourceKind,
  consequence,
  confirmLabel = 'Delete',
  description,
  redirectTo,
  onDelete,
}: ResourceDeleteDangerZoneProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      try {
        await onDelete();
        setOpen(false);
        router.push(redirectTo);
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : `Failed to delete ${resourceKind}. Try again.`
        );
      }
    });
  };

  return (
    <>
      <DangerZone description={description}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-foreground">
            Delete this {resourceKind} permanently.
          </p>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              setError(null);
              setOpen(true);
            }}
          >
            {confirmLabel} {resourceKind}
          </Button>
        </div>
      </DangerZone>
      <ConfirmDestructiveDialog
        open={open}
        onOpenChange={setOpen}
        title={`${confirmLabel} ${resourceKind}?`}
        description={`This will permanently delete "${resourceName}". ${consequence}`}
        confirmLabel={confirmLabel}
        pending={pending}
        error={error}
        onConfirm={handleConfirm}
      />
    </>
  );
}
