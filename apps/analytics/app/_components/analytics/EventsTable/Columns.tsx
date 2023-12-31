"use client";
import { DataTableColumnHeader } from "~/components/DataTable/column-header";
import { ColumnDef } from "@tanstack/react-table";
import type { Event } from "~/db/schema";
import { MetadataDialog } from "./MetadataDialog";
export const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Event" />
    ),
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Timestamp" />
    ),
  },
  {
    accessorKey: "installationid",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Installation Id" />
    ),
    cell: ({ row }) => {
      return <div className="break-all">{row.original.installationid}</div>;
    },
  },
  {
    accessorKey: "stacktrace",
    header: "",
    cell: ({ row }) => {
      return (
        <div className="min-w-max">
          <MetadataDialog event={row.original} />
        </div>
      );
    },
  },
];
