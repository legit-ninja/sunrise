'use client';

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Hammer, Ban } from "lucide-react";
import { titleCase } from "title-case";
import { DataTable } from "@/components/DataTable";
import { ConfirmDestructiveDialog } from "@/components/ConfirmDestructiveDialog";
import { Badge } from "@/components/ui/badge";
import { cancelImageBuildJob } from "@/lib/image-build/actions";
import {
  isTerminalJobStatus,
  type Job,
  type JobStatus,
} from "@/lib/image-build/types";
import {
  imageBuildJobsQueryOptions,
  imageBuildTemplatesQueryOptions,
} from "@/hooks/queries/useImageBuildJobs";

function formatJobStatus(status: JobStatus) {
  return titleCase(status.replace(/_/g, " "));
}

function statusVariant(
  status: JobStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "succeeded":
      return "default";
    case "queued":
    case "building":
    case "uploading":
      return "secondary";
    case "failed":
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
}

interface ImageBuildsClientProps {
  regionId?: string;
  projectId?: string;
}

export function ImageBuildsClient({
  regionId,
  projectId,
}: ImageBuildsClientProps) {
  const queryClient = useQueryClient();
  const jobsQuery = useSuspenseQuery(
    imageBuildJobsQueryOptions(regionId, projectId),
  );
  const templatesQuery = useSuspenseQuery(imageBuildTemplatesQueryOptions());
  const [, startCancel] = useTransition();
  const [pending, setPending] = useState(false);
  const [cancelTargets, setCancelTargets] = useState<Job[]>([]);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const templateNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const template of templatesQuery.data) {
      map.set(template.id, template.name);
    }
    return map;
  }, [templatesQuery.data]);

  const invalidateJobs = () => {
    void queryClient.invalidateQueries({
      queryKey: [regionId, projectId, "image-build", "jobs"],
    });
  };

  const columns = useMemo<ColumnDef<Job>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <Link
            href={`#${row.original.id}`}
            className="block max-w-[12rem] truncate font-mono text-xs underline-offset-2 hover:underline"
          >
            {row.original.id}
          </Link>
        ),
        meta: { fieldType: "string", monospace: true, visible: true },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={statusVariant(row.original.status)}>
            {formatJobStatus(row.original.status)}
          </Badge>
        ),
        meta: { fieldType: "string", visible: true },
      },
      {
        accessorKey: "template_id",
        header: "Template",
        cell: ({ row }) =>
          templateNameById.get(row.original.template_id) ??
          row.original.template_id,
        meta: { fieldType: "string", visible: true },
      },
      {
        accessorKey: "result",
        header: "Error",
        cell: ({ row }) =>
          row.original.result?.error_message ? (
            <span
              title={row.original.result.error_message}
              className="block max-w-[18rem] truncate text-destructive"
            >
              {row.original.result.error_message}
            </span>
          ) : (
            "-"
          ),
        meta: { fieldType: "string", visible: true },
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) =>
          new Date(row.original.created_at).toLocaleString(),
        meta: { fieldType: "date", visible: true },
      },
    ],
    [templateNameById],
  );

  const rowActions = useMemo(
    () => [
      {
        label: "Cancel",
        variant: "destructive" as const,
        icon: Ban,
        onClick: (rows: Job[]) => {
          const cancellable = rows.filter(
            (job) => !isTerminalJobStatus(job.status),
          );
          if (!cancellable.length) return;
          setCancelError(null);
          setCancelTargets(cancellable);
        },
      },
    ],
    [],
  );

  const confirmCancel = () => {
    const targets = cancelTargets;
    setPending(true);
    startCancel(async () => {
      try {
        await Promise.all(targets.map((job) => cancelImageBuildJob(job.id)));
        setCancelTargets([]);
        invalidateJobs();
      } catch (err) {
        setCancelError(
          err instanceof Error ? err.message : "Failed to cancel build jobs.",
        );
      } finally {
        setPending(false);
      }
    });
  };

  const cancelTitle =
    cancelTargets.length === 1
      ? "Cancel image build?"
      : `Cancel ${cancelTargets.length} image builds?`;
  const cancelDescription =
    cancelTargets.length === 1
      ? `This will cancel build "${cancelTargets[0]?.id}". In-progress work may stop without producing an image.`
      : "This will cancel the selected builds. In-progress work may stop without producing images.";

  return (
    <>
      <DataTable
        data={jobsQuery.data}
        isRefetching={jobsQuery.isRefetching}
        refetch={() => {
          void jobsQuery.refetch();
        }}
        columns={columns}
        resourceName="image build"
        emptyIcon={Hammer}
        emptyDescription="Start a build with Build image in the toolbar above."
        rowActions={rowActions}
      />
      <ConfirmDestructiveDialog
        open={cancelTargets.length > 0}
        onOpenChange={(open) => {
          if (!open) setCancelTargets([]);
        }}
        title={cancelTitle}
        description={cancelDescription}
        confirmLabel="Cancel build"
        pending={pending}
        error={cancelError}
        onConfirm={confirmCancel}
      />
    </>
  );
}
