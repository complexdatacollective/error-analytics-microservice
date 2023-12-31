"use client";
import { DataTableColumnHeader } from "~/components/DataTable/column-header";
import { ColumnDef } from "@tanstack/react-table";
import { Error } from "~/db/schema";
import { StackTraceDialog } from "~/app/_components/errors/ErrorsTable/StackTraceDialog";
export const columns: ColumnDef<Error>[] = [
  {
    accessorKey: "message",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Message" />
    ),
  },
  {
    accessorKey: "details",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Details" />
    ),
  },
  {
    accessorKey: "path",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Path" />
    ),
  },
  {
    accessorKey: "installationid",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Installation Id" />
    ),
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Timestamp" />
    ),
  },
  {
    accessorKey: "stacktrace",
    header: "",
    cell: ({ row }) => {
      return (
        <div className="min-w-max">
          <StackTraceDialog error={row.original} />
        </div>
      );
    },
  },
];
