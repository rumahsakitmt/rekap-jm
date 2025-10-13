import { type ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";
import { type TarifLabData } from "./types";

export const createTarifLabColumns = (): ColumnDef<TarifLabData>[] => [
  {
    accessorKey: "kdJenisPrw",
    header: "Kode Jenis Perawatan",
    cell: ({ row }) => {
      const value = row.getValue("kdJenisPrw") as string;
      return <span className="font-mono text-sm">{value}</span>;
    },
  },
  {
    accessorKey: "nmPerawatan",
    header: "Nama Perawatan",
    cell: ({ row }) => {
      const value = row.getValue("nmPerawatan") as string | null;
      return <span className="font-medium">{value || "-"}</span>;
    },
  },
  {
    accessorKey: "kategori",
    header: "Kategori",
    cell: ({ row }) => {
      const value = row.getValue("kategori") as string | null;
      return <span className="text-sm">{value || "-"}</span>;
    },
  },
  {
    accessorKey: "bagianRs",
    header: "Bagian RS",
    cell: ({ row }) => {
      const value = row.getValue("bagianRs") as number | null;
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
    accessorKey: "tarifPerujuk",
    header: "Tarif Perujuk",
    cell: ({ row }) => {
      const value = row.getValue("tarifPerujuk") as number | null;
      return (
        <span className="text-right font-mono text-sm font-semibold text-primary">
          {value ? formatCurrency(value) : "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "tarifTindakanDokter",
    header: "Tarif Tindakan Dokter",
    cell: ({ row }) => {
      const value = row.getValue("tarifTindakanDokter") as number | null;
      return (
        <span className="text-right font-mono text-sm font-semibold text-primary">
          {value ? formatCurrency(value) : "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "tarifTindakanPetugas",
    header: "Tarif Tindakan Petugas",
    cell: ({ row }) => {
      const value = row.getValue("tarifTindakanPetugas") as number | null;
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
    accessorKey: "totalByr",
    header: "Total Bayar",
    cell: ({ row }) => {
      const value = row.getValue("totalByr") as number | null;
      return (
        <span className="text-right font-mono text-sm font-bold text-blue-600">
          {value ? formatCurrency(value) : "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "kdPj",
    header: "Kode Penanggung Jawab",
    cell: ({ row }) => {
      const value = row.getValue("kdPj") as string | null;
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
