'use client';

import { useState, useTransition } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { DataTable, DataTableRowAction } from "@/components/DataTable";
import { ConfirmDestructiveDialog } from "@/components/ConfirmDestructiveDialog";
import { KeyRound, Trash2 } from "lucide-react";
import { Keypair } from "@/types/openstack";
import { ColumnDef } from "@tanstack/react-table";
import { keypairsQueryOptions } from "@/hooks/queries/useServers";
import { deleteKeypairAction } from "@/lib/openstack/nova-actions";
import { RESOURCE_NAME } from "./constants";

export const keypairColumns: ColumnDef<Keypair>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }: { row: { original: Keypair } }) => row.original.name,
    meta: {
      fieldType: "string",
      visible: true,
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }: { row: { original: Keypair } }) => row.original.type,
    meta: {
      fieldType: "string",
      monospace: true,
      visible: true,
    },
  },
  {
    accessorKey: "fingerprint",
    header: "Fingerprint",
    cell: ({ row }: { row: { original: Keypair } }) => row.original.fingerprint,
    meta: {
      fieldType: "string",
      monospace: true,
      visible: true,
    },
  },
  {
    accessorKey: "public_key",
    header: "Public Key",
    cell: ({ row }: { row: { original: Keypair } }) => {
      const key = row.original.public_key;
      return key.length > 50 ? `${key.substring(0, 50)}...` : key;
    },
    meta: {
      fieldType: "string",
      monospace: true,
      visible: true,
    },
  },
  {
    accessorKey: "user_id",
    header: "User ID",
    cell: ({ row }: { row: { original: Keypair } }) =>
      row.original.user_id || "-",
    meta: {
      fieldType: "string",
      monospace: true,
      visible: false,
    },
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    meta: {
      fieldType: "date",
      visible: false,
    },
  },
];

interface KeypairsTableProps {
  regionId: string | undefined;
  projectId: string | undefined;
}

export function KeypairsTable({ regionId, projectId }: KeypairsTableProps) {
  const queryClient = useQueryClient();
  const { data, isRefetching, refetch } = useSuspenseQuery(
    keypairsQueryOptions(regionId, projectId),
  );
  const [pending, startTransition] = useTransition();
  const [deleteTargets, setDeleteTargets] = useState<Keypair[]>([]);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const rowActions: DataTableRowAction<Keypair>[] = [
    {
      label: "Delete",
      variant: "destructive",
      icon: Trash2,
      onClick: (rows) => {
        setDeleteError(null);
        setDeleteTargets(rows);
      },
    },
  ];

  const confirmDelete = () => {
    const targets = deleteTargets;
    startTransition(async () => {
      try {
        await Promise.all(
          targets.map((kp) => deleteKeypairAction(kp.name, regionId)),
        );
        setDeleteTargets([]);
        await queryClient.invalidateQueries({
          queryKey: [regionId, projectId, "keypairs"],
        });
        void refetch();
      } catch (err) {
        setDeleteError(
          err instanceof Error ? err.message : "Failed to delete key pairs.",
        );
      }
    });
  };

  const title =
    deleteTargets.length === 1
      ? "Delete key pair?"
      : `Delete ${deleteTargets.length} key pairs?`;
  const description =
    deleteTargets.length === 1
      ? `This will permanently delete "${deleteTargets[0]?.name}". Instances already using it are not affected.`
      : "This will permanently delete the selected key pairs. Instances already using them are not affected.";

  return (
    <>
      <DataTable
        data={data}
        isRefetching={isRefetching}
        refetch={refetch}
        columns={keypairColumns}
        resourceName={RESOURCE_NAME}
        emptyIcon={KeyRound}
        emptyDescription="Use Create or Import in the toolbar above to add a key pair."
        rowActions={rowActions}
      />
      <ConfirmDestructiveDialog
        open={deleteTargets.length > 0}
        onOpenChange={(open) => {
          if (!open) setDeleteTargets([]);
        }}
        title={title}
        description={description}
        confirmLabel="Delete"
        pending={pending}
        error={deleteError}
        onConfirm={confirmDelete}
      />
    </>
  );
}
