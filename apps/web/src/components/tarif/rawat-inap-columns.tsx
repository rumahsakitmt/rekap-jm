import { type ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";
import { type TarifRawatInapData } from "./types";

export const createTarifInapColumns = (): ColumnDef<TarifRawatInapData>[] => [
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
    accessorKey: "kd_kategori",
    header: "Kategori",
    cell: ({ row }) => {
      const value = row.getValue("kd_kategori") as string | null;
      return <span className="text-sm">{value || "-"}</span>;
    },
  },
  {
    accessorKey: "material",
    header: "Material",
    cell: ({ row }) => {
      const value = row.getValue("material") as number | null;
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
    accessorKey: "tarif_tindakandr",
    header: "Tarif Tindakan DR",
    cell: ({ row }) => {
      const value = row.getValue("tarif_tindakandr") as number | null;
      return (
        <span className="text-right font-mono text-sm font-semibold text-primary">
          {value ? formatCurrency(value) : "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "tarif_tindakanpr",
    header: "Tarif Tindakan PR",
    cell: ({ row }) => {
      const value = row.getValue("tarif_tindakanpr") as number | null;
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
    accessorKey: "total_byrdr",
    header: "Total Bayar DR",
    cell: ({ row }) => {
      const value = row.getValue("total_byrdr") as number | null;
      return (
        <span className="text-right font-mono text-sm font-bold text-green-600">
          {value ? formatCurrency(value) : "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "total_byrpr",
    header: "Total Bayar PR",
    cell: ({ row }) => {
      const value = row.getValue("total_byrpr") as number | null;
      return (
        <span className="text-right font-mono text-sm font-bold text-green-600">
          {value ? formatCurrency(value) : "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "total_byrdrpr",
    header: "Total Bayar DR+PR",
    cell: ({ row }) => {
      const value = row.getValue("total_byrdrpr") as number | null;
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
    accessorKey: "kd_bangsal",
    header: "Kode Bangsal",
    cell: ({ row }) => {
      const value = row.getValue("kd_bangsal") as string | null;
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
