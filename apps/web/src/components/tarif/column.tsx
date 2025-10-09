import { type ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";

export type TarifRawatJalanData = {
  kd_jenis_prw: string;
  nm_perawatan: string | null;
  kd_kategori: string | null;
  material: number | null;
  bhp: number | null;
  tarif_tindakandr: number | null;
  tarif_tindakanpr: number | null;
  kso: number | null;
  menejemen: number | null;
  total_byrdr: number | null;
  total_byrpr: number | null;
  total_byrdrpr: number | null;
  kd_pj: string | null;
  kd_poli: string | null;
  status: string | null;
};

export type TarifRawatInapData = {
  kd_jenis_prw: string;
  nm_perawatan: string | null;
  kd_kategori: string | null;
  material: number | null;
  bhp: number | null;
  tarif_tindakandr: number | null;
  tarif_tindakanpr: number | null;
  kso: number | null;
  menejemen: number | null;
  total_byrdr: number | null;
  total_byrpr: number | null;
  total_byrdrpr: number | null;
  kd_pj: string | null;
  kd_bangsal: string | null;
  status: string | null;
  kelas: string | null;
};

export type TarifLabData = {
  kdJenisPrw: string;
  nmPerawatan: string | null;
  bagianRs: number | null;
  bhp: number | null;
  tarifPerujuk: number | null;
  tarifTindakanDokter: number | null;
  tarifTindakanPetugas: number | null;
  kso: number | null;
  menejemen: number | null;
  totalByr: number | null;
  kdPj: string | null;
  status: string | null;
  kelas: string | null;
  kategori: string | null;
};

export const createTarifColumns = (): ColumnDef<TarifRawatJalanData>[] => [
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
    accessorKey: "kd_poli",
    header: "Kode Poli",
    cell: ({ row }) => {
      const value = row.getValue("kd_poli") as string | null;
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
