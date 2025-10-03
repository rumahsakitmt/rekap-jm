import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { formatCurrency } from "@/lib/utils";

export type RawatInapData = {
  no_rawat: string | null;
  no_rkm_medis: string | null;
  tgl_masuk: string | null;
  tgl_keluar: string | null;
  kd_dokter: string | null;
  nm_dokter: string | null;
  nm_pasien: string | null;
  kd_poli: string | null;
  status_bayar: string | null;
  no_sep: string | null;
  visite_dpjp_utama: number | null;
  visite_konsul_1: Array<{
    kd_jenis_prw: string;
    nm_perawatan: string;
    nm_dokter: string;
    nm_bangsal: string;
  }> | null;
  visite_konsul_2: Array<{
    kd_jenis_prw: string;
    nm_perawatan: string;
    nm_dokter: string;
    nm_bangsal: string;
  }> | null;
  visite_dokter_umum: Array<{
    kd_jenis_prw: string;
    nm_perawatan: string;
    nm_dokter: string;
    nm_bangsal: string;
  }> | null;
  jns_perawatan?: Array<{
    kd_jenis_prw: string;
    nm_perawatan: string;
    nm_dokter: string;
    nm_bangsal: string;
  }>;
  kd_jenis_prw: string | null;
  kamar: string | null;
  hari_rawat: number | null;
  total_permintaan_radiologi: number | null;
  total_permintaan_lab: number | null;
  has_operasi: boolean | null;
  operator: string | null;
  anestesi: string | null;
  alokasi: number | null;
  tarif_from_csv: number | null;
  dpjp_ranap: number | null;
  remun_dpjp: number | null;
  remun_lab: number | null;
  remun_rad: number | null;
  remun_dokter_umum: number | null;
  remun_dpjp_utama: number | null;
  remun_konsul_anastesi: number | null;
  remun_anastesi_pengganti: number | null;
  remun_konsul_2: number | null;
  remun_operator: number | null;
  remun_anestesi: number | null;
  yang_terbagi: number | null;
  percent_dari_klaim: number | null;
  totalVisite: number | null;
  jns_perawatan_lab: Array<{
    kd_jenis_prw: string;
    nm_perawatan: string;
    nm_dokter: string;
  }>;
  jns_perawatan_radiologi: Array<{
    kd_jenis_prw: string;
    nm_perawatan: string;
    noorder: string;
    nm_dokter: string;
  }>;
};

export const createColumns = (
  copiedItems: Set<string>,
  handleCopy: (text: string, id: string) => void,
  showCalculation: boolean = false
) => {
  const columns: ColumnDef<RawatInapData>[] = [
    {
      accessorKey: "tgl_masuk",
      header: "Tanggal Masuk",
      cell: ({ row }) => {
        const value = row.original.tgl_masuk;
        return value ? format(new Date(value), "dd MMM yyyy") : "-";
      },
    },
    {
      accessorKey: "tgl_keluar",
      header: "Tanggal Keluar",
      cell: ({ row }) => {
        const value = row.original.tgl_keluar;
        return value ? format(new Date(value), "dd MMM yyyy") : "-";
      },
    },
    {
      accessorKey: "no_rkm_medis",
      header: "No RM",
      cell: ({ row }) => {
        const value = row.original.no_rkm_medis;
        if (!value) return "-";
        const id = `rekam-medis-${value}`;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopy(value, id)}
          >
            {value}
            {copiedItems.has(id) ? (
              <Check size={8} className="ml-1" />
            ) : (
              <Copy size={8} className="ml-1" />
            )}
          </Button>
        );
      },
    },
    {
      accessorKey: "no_rawat",
      header: "No Rawat",
      cell: ({ row }) => {
        const value = row.original.no_rawat;
        if (!value) return "-";
        const id = `rawat-${value}`;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopy(value, id)}
          >
            {value}
            {copiedItems.has(id) ? (
              <Check size={8} className="ml-1" />
            ) : (
              <Copy size={8} className="ml-1" />
            )}
          </Button>
        );
      },
    },

    {
      accessorKey: "no_sep",
      header: "No SEP",
      cell: ({ row }) => {
        const value = row.original.no_sep;
        if (!value) return "-";
        const id = `sep-${value}`;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopy(value, id)}
          >
            {value}
            {copiedItems.has(id) ? (
              <Check size={8} className="ml-1" />
            ) : (
              <Copy size={8} className="ml-1" />
            )}
          </Button>
        );
      },
    },

    {
      accessorKey: "nm_pasien",
      header: "Nama Pasien",
      cell: ({ row }) => {
        const value = row.original.nm_pasien;
        return <span className="font-mono text-sm">{value || "-"}</span>;
      },
    },
    {
      accessorKey: "kamar",
      header: "Kamar",
      cell: ({ row }) => {
        const value = row.original.kamar;
        return <span className="font-mono text-sm">{value || "-"}</span>;
      },
    },
    {
      accessorKey: "nm_dokter",
      header: "DPJP",
      cell: ({ row }) => {
        const value = row.original.nm_dokter;
        return <span className="font-mono text-sm">{value || "-"}</span>;
      },
    },
    {
      accessorKey: "visite_dpjp_utama",
      header: "Visite DPJP",
      cell: ({ row }) => {
        const value = row.original.visite_dpjp_utama;
        return (
          <div className="font-mono text-sm text-center">{value || ""}</div>
        );
      },
    },
    {
      accessorKey: "visite_anastesi",
      header: "Visite Anastesi",
      cell: ({ row }) => {
        const value = row.original.visite_konsul_1;
        return (
          <div className="flex items-center justify-center">
            <Tooltip>
              <TooltipTrigger asChild className="text-center">
                <Button variant="ghost" size="sm">
                  {value?.length || ""}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-background text-foreground">
                {value?.map((item) => (
                  <div key={item.kd_jenis_prw}>
                    <div>{item.nm_perawatan}</div>
                    <div className="font-bold">{item.nm_dokter}</div>
                  </div>
                ))}
              </TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
    {
      accessorKey: "visite_konsul_2",
      header: "Visite",
      cell: ({ row }) => {
        const value = row.original.visite_konsul_2;
        return (
          <div className="flex items-center w-full">
            <Tooltip>
              <TooltipTrigger asChild className="text-center">
                <Button variant="ghost" size="sm">
                  {value?.length || ""}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-background text-foreground">
                {value?.map((item) => (
                  <div key={item.kd_jenis_prw}>
                    <div>{item.nm_perawatan}</div>
                    <div className="font-bold">{item.nm_dokter}</div>
                  </div>
                ))}
              </TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },

    {
      accessorKey: "visite_dokter_umum",
      header: "Visite Dokter Umum",
      cell: ({ row }) => {
        const value = row.original.visite_dokter_umum;
        return (
          <div className="flex items-center w-full">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="mx-auto">
                  {value?.length || ""}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-background text-foreground">
                {value?.map((item) => (
                  <div key={item.kd_jenis_prw}>
                    <div>{item.nm_perawatan}</div>
                    <div className="font-bold">{item.nm_dokter}</div>
                  </div>
                ))}
              </TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
    {
      header: "Total Visite",
      cell: ({ row }) => {
        const value = row.original.totalVisite;
        return <div className="text-sm text-center">{value || "-"}</div>;
      },
    },
    {
      accessorKey: "has_operasi",
      header: "Operasi",
      cell: ({ row }) => {
        const value = row.original.has_operasi;
        return (
          <div className="font-mono text-sm text-center">
            {value ? "Ya" : "Tidak"}
          </div>
        );
      },
    },
    {
      accessorKey: "hari_rawat",
      header: "Hari Rawat",
      cell: ({ row }) => {
        const value = row.original.hari_rawat;
        return (
          <div className="font-mono text-sm text-center">{value || ""}</div>
        );
      },
    },
    {
      accessorKey: "total_permintaan_lab",
      header: "Lab",
      cell: ({ row }) => {
        const value = row.original.total_permintaan_lab;
        const jns_perawatan_lab = row.original.jns_perawatan_lab || [];
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm">
                {value || ""}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-background text-foreground">
              {Array.from(
                new Set(
                  jns_perawatan_lab
                    ?.map((item) => item.nm_dokter)
                    .filter(Boolean)
                )
              ).map((doctorName, index) => (
                <div key={index}>
                  <div>{doctorName as string}</div>
                </div>
              ))}
            </TooltipContent>
          </Tooltip>
        );
      },
    },

    {
      accessorKey: "total_permintaan_radiologi",
      header: "Radiologi",
      cell: ({ row }) => {
        const value = row.original.total_permintaan_radiologi;
        const jns_perawatan_radiologi =
          row.original.jns_perawatan_radiologi || [];
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm">
                {value || ""}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-background text-foreground">
              {Array.from(
                new Set(
                  jns_perawatan_radiologi
                    ?.map((item) => ({
                      dokter: item.nm_dokter,
                      perawatan: item.nm_perawatan,
                    }))
                    .filter(Boolean)
                )
              ).map((rad, index) => (
                <div key={index}>
                  <div>{rad.dokter as string}</div>
                  <div>{rad.perawatan as string}</div>
                </div>
              ))}
            </TooltipContent>
          </Tooltip>
        );
      },
    },

    {
      accessorKey: "operator",
      header: "Operator",
      cell: ({ row }) => {
        const value = row.original.operator;
        return <div className="text-sm">{value || ""}</div>;
      },
    },
    {
      accessorKey: "anestesi",
      header: "Anestesi",
      cell: ({ row }) => {
        const value = row.original.anestesi;
        return <div className="text-sm">{value || ""}</div>;
      },
    },
    ...(showCalculation
      ? ([
          {
            accessorKey: "tarif_from_csv",
            header: "Tarif",
            cell: ({ row }) => {
              const value = row.original.tarif_from_csv;
              return (
                <div className="font-mono text-sm">
                  {value ? formatCurrency(value) : ""}
                </div>
              );
            },
          },
          {
            accessorKey: "alokasi",
            header: "Alokasi",
            cell: ({ row }) => {
              const value = row.original.alokasi;
              return (
                <div className="text-sm">
                  {value ? formatCurrency(value) : "-"}
                </div>
              );
            },
          },
          {
            accessorKey: "dpjp_ranap",
            header: "DPJP Ranap",
            cell: ({ row }) => {
              const value = row.original.dpjp_ranap;
              return (
                <div className="text-sm">
                  {value ? formatCurrency(value) : "-"}
                </div>
              );
            },
          },
          {
            accessorKey: "remun_dpjp",
            header: "Remun DPJP",
            cell: ({ row }) => {
              const value = row.original.remun_dpjp_utama;
              return (
                <div className="text-sm">
                  {value ? formatCurrency(value) : "-"}
                </div>
              );
            },
          },
          {
            header: "Remun Konsul Anastesi",
            cell: ({ row }) => {
              const value = row.original.remun_konsul_anastesi;
              return (
                <div className="text-sm">
                  {value ? formatCurrency(value) : "-"}
                </div>
              );
            },
          },

          {
            header: "Remun Konsul 1",
            cell: ({ row }) => {
              const value = row.original.remun_konsul_2;
              return (
                <div className="text-sm">
                  {value ? formatCurrency(value) : "-"}
                </div>
              );
            },
          },
          {
            header: "Remun Dokter Umum",
            cell: ({ row }) => {
              const value = row.original.remun_dokter_umum;
              return (
                <div className="text-sm">
                  {value ? formatCurrency(value) : "-"}
                </div>
              );
            },
          },
          {
            header: "Remun Lab",
            cell: ({ row }) => {
              const value = row.original.remun_lab;
              return (
                <div className="text-sm">
                  {value ? formatCurrency(value) : "-"}
                </div>
              );
            },
          },
          {
            header: "Remun Radiologi",
            cell: ({ row }) => {
              const value = row.original.remun_rad;
              return (
                <div className="text-sm">
                  {value ? formatCurrency(value) : "-"}
                </div>
              );
            },
          },
          {
            header: "Remun Operator",
            cell: ({ row }) => {
              const value = row.original.remun_operator;
              return (
                <div className="text-sm">
                  {value ? formatCurrency(value) : "-"}
                </div>
              );
            },
          },
          {
            header: "Remun Anestesi",
            cell: ({ row }) => {
              const value = row.original.remun_anestesi;
              return (
                <div className="text-sm">
                  {value ? formatCurrency(value) : "-"}
                </div>
              );
            },
          },

          {
            header: "Remun Anestesi Pengganti",
            cell: ({ row }) => {
              const value = row.original.remun_anastesi_pengganti;
              return (
                <div className="text-sm">
                  {value ? formatCurrency(value) : "-"}
                </div>
              );
            },
          },
          {
            header: "Total Yang Terbagi",
            cell: ({ row }) => {
              const value = row.original.yang_terbagi;
              return (
                <div className="text-sm font-semibold">
                  {value ? formatCurrency(value) : "-"}
                </div>
              );
            },
          },
          {
            header: "% Dari Klaim",
            cell: ({ row }) => {
              const value = row.original.percent_dari_klaim;
              return (
                <div className="text-sm font-semibold text-center">
                  {value ? `${value}%` : "-"}
                </div>
              );
            },
          },
        ] as ColumnDef<RawatInapData>[])
      : []),
  ];

  return columns;
};
