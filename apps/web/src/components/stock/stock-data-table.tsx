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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Columns,
  Search,
  Package,
  TrendingUp,
  DollarSign,
  CheckCircle,
  ShoppingCart,
  Flame,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SortableHeader } from "@/components/ui/sortable-header";

import { StockDateFilter } from "./stock-date-filter";
import { StockStatusFilter } from "./stock-status-filter";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import LeadingTimeSelect from "./leading-time-select";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type DatabarangData = {
  kode_brng: string;
  nama_brng: string | null;
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
};

interface StockDataTableProps {
  data: DatabarangData[];
  loading?: boolean;
}

export function StockDataTable({ data, loading }: StockDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  // Get search params from route
  const route = getRouteApi("/obat/stok");
  const { status, pageSize: searchPageSize } = route.useSearch();
  const navigate = useNavigate();

  const [pageSize, setPageSize] = React.useState(
    parseInt(searchPageSize || "25")
  );

  // Apply status filter
  React.useEffect(() => {
    if (status) {
      setColumnFilters((prev) => {
        const existing = prev.filter((filter) => filter.id !== "stockStatus");
        return [...existing, { id: "stockStatus", value: status }];
      });
    } else {
      setColumnFilters((prev) =>
        prev.filter((filter) => filter.id !== "stockStatus")
      );
    }
  }, [status]);

  const columns: ColumnDef<DatabarangData>[] = [
    {
      accessorKey: "kode_brng",
      header: "Kode Barang",
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
      accessorKey: "h_beli",
      header: "Harga Beli",
      cell: ({ row }) => {
        const harga = row.getValue("h_beli") as number;
        return (
          <div className="text-right">
            {harga ? (
              <span className="font-mono text-sm">
                Rp {harga.toLocaleString("id-ID")}
              </span>
            ) : (
              "-"
            )}
          </div>
        );
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
      accessorKey: "penggunaan",
      header: ({ column }) => (
        <SortableHeader column={column} title="Penggunaan" />
      ),
      cell: ({ row }) => {
        const penggunaan = row.getValue("penggunaan") as number;
        return <div className="text-center">{penggunaan.toFixed(0)}</div>;
      },
    },
    {
      header: "S-MIN",
      cell: ({ row }) => {
        const avgUsage = (row.getValue("penggunaan") as number) || 0;
        const route = getRouteApi("/obat/stok");
        const { leadingTime } = route.useSearch();
        const leadingTimeNumber = parseInt(leadingTime || "6");
        const Smin = 2 * ((avgUsage / 30) * leadingTimeNumber);

        return <div className="text-center">{Smin.toFixed(0)}</div>;
      },
    },
    {
      accessorKey: "stockStatus",
      header: () => {
        return (
          <div className="flex items-center w-full justify-center">
            <Button variant="ghost">Status</Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const stockStatus = (row.original.stockStatus as string) || "sehat";

        const mapStatus = {
          sehat: {
            message: "Stock Aman",
            color: "bg-green-500",
            Icon: <CheckCircle />,
          },
          rendah: {
            message: "Pesan",
            color: "bg-amber-500",
            Icon: <ShoppingCart />,
          },
          sedang: {
            message: "Segera Pesan",
            color: "bg-red-500",
            Icon: <Flame />,
          },
        };

        return (
          <div className="w-full uppercase">
            <Badge
              className={cn(
                "w-full uppercase",
                mapStatus[stockStatus as keyof typeof mapStatus].color
              )}
            >
              {mapStatus[stockStatus as keyof typeof mapStatus].Icon}
              {mapStatus[stockStatus as keyof typeof mapStatus].message}
            </Badge>
          </div>
        );
      },
      filterFn: (row: any, columnId: any, value: any) => {
        const stockStatus = row.getValue(columnId) as string;
        return stockStatus === value;
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
          <StockDateFilter />
          <LeadingTimeSelect />
          <StockStatusFilter />
        </div>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                <Columns className="mr-2 h-4 w-4" />
                Kolom
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              <DropdownMenuLabel>Toggle kolom</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
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
                  className={cn(i % 2 !== 0 && "bg-muted/50")}
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
                to: "/obat/stok",
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
