import { type ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";
import { type TarifRadiologiData } from "./types";

export const createTarifRadiologiColumns =
  (): ColumnDef<TarifRadiologiData>[] => [
    {
      accessorKey: "kd_jenis_prw",
      header: "Kode Jenis Perawatan",
      cell: ({ row }) => {
        const value = row.getValue("kd_jenis_prw") as string;
        return <span className="font-mono text-sm">{value}</span>;
      },
    },
    {
      accessorKey: "nm_perawatan",
      header: "Nama Perawatan",
      cell: ({ row }) => {
        const value = row.getValue("nm_perawatan") as string | null;
        return <span className="font-medium">{value || "-"}</span>;
      },
    },
    {
      accessorKey: "bagian_rs",
      header: "Bagian RS",
      cell: ({ row }) => {
        const value = row.getValue("bagian_rs") as number | null;
        return (
          <span className="text-right font-mono text-sm">
            {value ? formatCurrency(value) : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "bhp",
      header: "BHP",
      cell: ({ row }) => {
        const value = row.getValue("bhp") as number | null;
        return (
          <span className="text-right font-mono text-sm">
            {value ? formatCurrency(value) : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "tarif_perujuk",
      header: "Tarif Perujuk",
      cell: ({ row }) => {
        const value = row.getValue("tarif_perujuk") as number | null;
        return (
          <span className="text-right font-mono text-sm font-semibold text-primary">
            {value ? formatCurrency(value) : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "tarif_tindakan_dokter",
      header: "Tarif Tindakan Dokter",
      cell: ({ row }) => {
        const value = row.getValue("tarif_tindakan_dokter") as number | null;
        return (
          <span className="text-right font-mono text-sm font-semibold text-primary">
            {value ? formatCurrency(value) : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "tarif_tindakan_petugas",
      header: "Tarif Tindakan Petugas",
      cell: ({ row }) => {
        const value = row.getValue("tarif_tindakan_petugas") as number | null;
        return (
          <span className="text-right font-mono text-sm font-semibold text-primary">
            {value ? formatCurrency(value) : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "kso",
      header: "KSO",
      cell: ({ row }) => {
        const value = row.getValue("kso") as number | null;
        return (
          <span className="text-right font-mono text-sm">
            {value ? formatCurrency(value) : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "menejemen",
      header: "Manajemen",
      cell: ({ row }) => {
        const value = row.getValue("menejemen") as number | null;
        return (
          <span className="text-right font-mono text-sm">
            {value ? formatCurrency(value) : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "total_byr",
      header: "Total Bayar",
      cell: ({ row }) => {
        const value = row.getValue("total_byr") as number | null;
        return (
          <span className="text-right font-mono text-sm font-bold text-blue-600">
            {value ? formatCurrency(value) : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "kd_pj",
      header: "Kode Penanggung Jawab",
      cell: ({ row }) => {
        const value = row.getValue("kd_pj") as string | null;
        return <span className="text-sm">{value || "-"}</span>;
      },
    },
    {
      accessorKey: "kelas",
      header: "Kelas",
      cell: ({ row }) => {
        const value = row.getValue("kelas") as string | null;
        return <span className="text-sm">{value || "-"}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const value = row.getValue("status") as string | null;
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              value === "1"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {value === "1" ? "Aktif" : "Tidak Aktif"}
          </span>
        );
      },
    },
  ];
