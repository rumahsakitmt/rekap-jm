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

export type TarifRadiologiData = {
  kd_jenis_prw: string;
  nm_perawatan: string | null;
  bagian_rs: number | null;
  bhp: number | null;
  tarif_perujuk: number | null;
  tarif_tindakan_dokter: number | null;
  tarif_tindakan_petugas: number | null;
  kso: number | null;
  menejemen: number | null;
  total_byr: number | null;
  kd_pj: string | null;
  status: string | null;
  kelas: string | null;
};

export type PaketOperasiData = {
  kodePaket: string;
  nmPerawatan: string;
  kategori: string;
  operator1: number;
  operator2: number;
  operator3: number;
  asistenOperator1: number;
  asistenOperator2: number;
  asistenOperator3: number;
  instrumen: number;
  dokterAnak: number;
  perawaatResusitas: number;
  dokterAnestesi: number;
  asistenAnestesi: number;
  asistenAnestesi2: number;
  bidan: number;
  bidan2: number;
  bidan3: number;
  perawatLuar: number;
  sewaOk: number;
  alat: number;
  akomodasi: number;
  bagianRs: number;
  omloop: number;
  omloop2: number;
  omloop3: number;
  omloop4: number;
  omloop5: number;
  sarpras: number;
  dokterPjanak: number;
  dokterUmum: number;
  kdPj: string;
  status: string;
  kelas: string;
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
