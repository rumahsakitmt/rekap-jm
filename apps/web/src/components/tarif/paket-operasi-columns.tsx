import { type ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";
import { type PaketOperasiData } from "./types";

export const createPaketOperasiColumns = (): ColumnDef<PaketOperasiData>[] => [
  {
    accessorKey: "kodePaket",
    header: "Kode Paket",
    cell: ({ row }) => {
      const value = row.getValue("kodePaket") as string;
      return <span className="font-mono text-sm">{value}</span>;
    },
  },
  {
    accessorKey: "nmPerawatan",
    header: "Nama Perawatan",
    cell: ({ row }) => {
      const value = row.getValue("nmPerawatan") as string;
      return <span className="font-medium">{value}</span>;
    },
  },
  {
    accessorKey: "kategori",
    header: "Kategori",
    cell: ({ row }) => {
      const value = row.getValue("kategori") as string;
      return <span className="text-sm">{value}</span>;
    },
  },
  {
    accessorKey: "operator1",
    header: "Operator 1",
    cell: ({ row }) => {
      const value = row.getValue("operator1") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "operator2",
    header: "Operator 2",
    cell: ({ row }) => {
      const value = row.getValue("operator2") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "operator3",
    header: "Operator 3",
    cell: ({ row }) => {
      const value = row.getValue("operator3") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "asistenOperator1",
    header: "Asisten Operator 1",
    cell: ({ row }) => {
      const value = row.getValue("asistenOperator1") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "asistenOperator2",
    header: "Asisten Operator 2",
    cell: ({ row }) => {
      const value = row.getValue("asistenOperator2") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "asistenOperator3",
    header: "Asisten Operator 3",
    cell: ({ row }) => {
      const value = row.getValue("asistenOperator3") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "instrumen",
    header: "Instrumen",
    cell: ({ row }) => {
      const value = row.getValue("instrumen") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "dokterAnak",
    header: "Dokter Anak",
    cell: ({ row }) => {
      const value = row.getValue("dokterAnak") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "perawaatResusitas",
    header: "Perawat Resusitas",
    cell: ({ row }) => {
      const value = row.getValue("perawaatResusitas") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "dokterAnestesi",
    header: "Dokter Anestesi",
    cell: ({ row }) => {
      const value = row.getValue("dokterAnestesi") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "asistenAnestesi",
    header: "Asisten Anestesi",
    cell: ({ row }) => {
      const value = row.getValue("asistenAnestesi") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "asistenAnestesi2",
    header: "Asisten Anestesi 2",
    cell: ({ row }) => {
      const value = row.getValue("asistenAnestesi2") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "bidan",
    header: "Bidan",
    cell: ({ row }) => {
      const value = row.getValue("bidan") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "bidan2",
    header: "Bidan 2",
    cell: ({ row }) => {
      const value = row.getValue("bidan2") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "bidan3",
    header: "Bidan 3",
    cell: ({ row }) => {
      const value = row.getValue("bidan3") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "perawatLuar",
    header: "Perawat Luar",
    cell: ({ row }) => {
      const value = row.getValue("perawatLuar") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "sewaOk",
    header: "Sewa OK",
    cell: ({ row }) => {
      const value = row.getValue("sewaOk") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "alat",
    header: "Alat",
    cell: ({ row }) => {
      const value = row.getValue("alat") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "akomodasi",
    header: "Akomodasi",
    cell: ({ row }) => {
      const value = row.getValue("akomodasi") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "bagianRs",
    header: "Bagian RS",
    cell: ({ row }) => {
      const value = row.getValue("bagianRs") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "omloop",
    header: "Omloop",
    cell: ({ row }) => {
      const value = row.getValue("omloop") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "omloop2",
    header: "Omloop 2",
    cell: ({ row }) => {
      const value = row.getValue("omloop2") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "omloop3",
    header: "Omloop 3",
    cell: ({ row }) => {
      const value = row.getValue("omloop3") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "omloop4",
    header: "Omloop 4",
    cell: ({ row }) => {
      const value = row.getValue("omloop4") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "omloop5",
    header: "Omloop 5",
    cell: ({ row }) => {
      const value = row.getValue("omloop5") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "sarpras",
    header: "Sarpras",
    cell: ({ row }) => {
      const value = row.getValue("sarpras") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "dokterPjanak",
    header: "Dokter Pjanak",
    cell: ({ row }) => {
      const value = row.getValue("dokterPjanak") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "dokterUmum",
    header: "Dokter Umum",
    cell: ({ row }) => {
      const value = row.getValue("dokterUmum") as number;
      return (
        <span className="text-right font-mono text-sm">
          {formatCurrency(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "kdPj",
    header: "Kode Penanggung Jawab",
    cell: ({ row }) => {
      const value = row.getValue("kdPj") as string;
      return <span className="text-sm">{value}</span>;
    },
  },
  {
    accessorKey: "kelas",
    header: "Kelas",
    cell: ({ row }) => {
      const value = row.getValue("kelas") as string;
      return <span className="text-sm">{value}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const value = row.getValue("status") as string;
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
