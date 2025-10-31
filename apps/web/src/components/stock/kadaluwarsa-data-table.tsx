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
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SortableHeader } from "@/components/ui/sortable-header";

import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { differenceInDays, format } from "date-fns";
import { id } from "date-fns/locale";
import { ExpireStatusFilter } from "./expire-status-filter";

export type DatabarangData = {
  kode_brng: string;
  nama_brng: string | null;
  expire: string | null;
  h_beli: number | null;
  stok: number | null;
  status: string;
  penggunaan: number;
  total_biaya_obat: number;
  total_embalase: number;
  total_tuslah: number;
  total_harga: number;
  smin: number;
  stockStatus: string;
  expireStatus: string;
};

interface StockDataTableProps {
  data: DatabarangData[];
  loading?: boolean;
}

export function KadaluwarsaDataTable({ data, loading }: StockDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const route = getRouteApi("/obat/kadaluwarsa");
  const { status, pageSize: searchPageSize } = route.useSearch();
  const navigate = useNavigate();

  const [pageSize, setPageSize] = React.useState(
    parseInt(searchPageSize || "25")
  );

  React.useEffect(() => {
    if (status) {
      setColumnFilters((prev) => {
        const existing = prev.filter((filter) => filter.id !== "expireStatus");
        return [...existing, { id: "expireStatus", value: status }];
      });
    } else {
      setColumnFilters((prev) =>
        prev.filter((filter) => filter.id !== "expireStatus")
      );
    }
  }, [status]);

  const columns: ColumnDef<DatabarangData>[] = [
    {
      accessorKey: "kode_brng",
      header: "KODE BARANG",
      cell: ({ row }) => (
        <div className="font-mono text-sm font-medium">
          {row.getValue("kode_brng")}
        </div>
      ),
    },
    {
      accessorKey: "nama_brng",
      header: ({ column }) => (
        <SortableHeader column={column} title="Nama Barang" />
      ),
      cell: ({ row }) => {
        const nama = row.getValue("nama_brng") as string;
        return <div className=" font-medium">{nama || "-"}</div>;
      },
    },
    {
      accessorKey: "stok",
      header: ({ column }) => <SortableHeader column={column} title="Stok" />,
      cell: ({ row }) => {
        const stok = row.getValue("stok") as number;
        return <div className="text-center">{(stok || 0).toFixed(0)}</div>;
      },
    },
    {
      accessorKey: "expire",
      header: ({ column }) => (
        <SortableHeader column={column} title="Tanggal Kadaluwarsa" />
      ),
      cell: ({ row }) => {
        const expire = row.getValue("expire") as string;

        return (
          <div className={cn("font-medium text-end")}>
            <div>{format(new Date(expire), "PPP", { locale: id }) || "-"}</div>
          </div>
        );
      },
    },

    {
      accessorKey: "expireStatus",
      header: ({ column }) => (
        <div className="text-center uppercase">Status Expired</div>
      ),
      cell: ({ row }) => {
        const statusConfig = {
          hijau: {
            message: "Expired (diatas 12 bulan)",
          },
          kuning: {
            message: "Expired (6-12 bulan)",
          },
          merah: { message: "Expired (< 6 bulan)" },
        } as const;

        const expire = row.getValue("expireStatus") as string;
        return (
          <div className="text-center">
            {statusConfig[expire as keyof typeof statusConfig].message}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
  });

  React.useEffect(() => {
    if (searchPageSize) {
      const newPageSize = parseInt(searchPageSize);
      setPageSize(newPageSize);
      table.setPageSize(newPageSize);
    }
  }, [searchPageSize, table]);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="space-y-2">
            <Label>Cari obat</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari obat..."
                value={globalFilter ?? ""}
                onChange={(event) =>
                  setGlobalFilter(String(event.target.value))
                }
                className="pl-8 w-[300px]"
              />
            </div>
          </div>
          <ExpireStatusFilter />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
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
          <TableBody>
            {loading ? (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, i) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    row.getValue("expireStatus") === "merah"
                      ? "bg-red-100 text-red-600 hover:bg-red-200 border-red-300"
                      : row.getValue("expireStatus") === "kuning"
                        ? "bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-300"
                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-300"
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
                  className="h-24 text-center"
                >
                  Tidak ada data obat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="page-size" className="text-sm text-muted-foreground">
            Tampilkan:
          </Label>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              const newPageSize = Number(value);
              setPageSize(newPageSize);
              table.setPageSize(newPageSize);
              navigate({
                to: "/obat/kadaluwarsa",
                search: (prev) => ({
                  ...prev,
                  pageSize: newPageSize.toString(),
                }),
              });
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 text-sm text-muted-foreground text-center">
          Menampilkan{" "}
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}{" "}
          sampai{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          dari {table.getFilteredRowModel().rows.length} entri
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Selanjutnya
          </Button>
        </div>
      </div>
    </div>
  );
}
