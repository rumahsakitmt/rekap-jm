import * as React from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface RegistrationProps<
  TData extends { has_triase?: boolean | null; triase_type?: string | null },
  TValue,
> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  renderMobileItem?: (item: TData) => React.ReactNode;
}

export function RegistrationTable<
  TData extends { has_triase?: boolean | null; triase_type?: string | null },
  TValue,
>({
  columns,
  data,
  loading = false,
  renderMobileItem,
}: RegistrationProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  if (loading) {
    return (
      <div className="rounded-md border overflow-hidden">
        <div className="border-b bg-muted/50 p-4 hidden md:block">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="p-4 space-y-3 hidden md:block">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex space-x-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>

        <div className="p-4 space-y-4 md:hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      {renderMobileItem && (
        <div className="md:hidden divide-y">
          {data.length > 0 ? (
            data.map((item, index) => (
              <div key={index}>{renderMobileItem(item)}</div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Tidak ada registrasi hari ini.
            </div>
          )}
        </div>
      )}

      <div className={cn(renderMobileItem && "hidden md:block")}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            header.column.getCanSort() &&
                              "cursor-pointer select-none hover:bg-muted/50 rounded px-2 py-1 -mx-2 -my-1"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center space-x-2">
                            <span>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </span>
                            {header.column.getCanSort() && (
                              <div className="flex flex-col">
                                {header.column.getIsSorted() === "desc" ? (
                                  <ArrowDown className="h-3 w-3" />
                                ) : header.column.getIsSorted() === "asc" ? (
                                  <ArrowUp className="h-3 w-3" />
                                ) : (
                                  <ArrowUpDown className="h-3 w-3 opacity-50" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    "hover:bg-muted/50",
                    row.original.triase_type === "sekunder" &&
                      "bg-yellow-400 hover:bg-yellow-400 border-yellow-600",
                    row.original.triase_type === "primer" &&
                      "bg-red-400 hover:bg-red-400 border-red-600 text-white"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Tidak ada registrasi hari ini.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
