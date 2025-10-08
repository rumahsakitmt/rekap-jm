"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DataTableFilters } from "./data-table-filters";
import { TotalsDisplay } from "./totals-display";
import { Columns } from "lucide-react";
import { DataTablePagination } from "./pagination";
import { CsvAnalysis } from "../csv-analysis";
import { Skeleton } from "../ui/skeleton";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isCsvMode?: boolean;
  loading?: boolean;
  totals?:
    | {
        totalTarif?: number;
        totalAlokasi?: number;
        totalDpjpUtama?: number;
        totalKonsul?: number;
        totalLaboratorium?: number;
        totalRadiologi?: number;
        totalYangTerbagi?: number;
        averagePercentDariKlaim?: number;
      }
    | null
    | undefined;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    page: number;
    totalPages: number;
  };
  onDownloadCsv?: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isCsvMode = false,
  loading,
  totals,
  pagination,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination?.totalPages || -1,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full space-y-2 ">
      <DataTableFilters />
      <div className="p-2 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>::[</span>
            <p>
              Total data:{" "}
              <span className="font-bold text-primary">
                {pagination?.total}
              </span>
            </p>
            <span>]::</span>
          </div>
          <CsvAnalysis from="/rekap/rawat-jalan" />
        </div>
        <TotalsDisplay totals={totals} />
      </div>
      <div className=" uppercase">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-primary text-primary-foreground hover:bg-primary"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          {loading ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Skeleton className="h-12 w-full" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Skeleton className="h-12 w-full opacity-70" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Skeleton className="h-12 w-full opacity-10" />
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, i) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(i % 2 !== 0 && "bg-muted")}
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
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          )}
        </Table>
      </div>
      <DataTablePagination from="/rekap/rawat-jalan" pagination={pagination} />
    </div>
  );
}

interface DataTableViewOptionsProps<TData> {
  table: any;
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
        >
          <Columns />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column: any) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide()
          )
          .map((column: any) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
