import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PerawatanList } from "@/components/perawatan-list";

export type RawatJalanData = {
  no_rawat: string | null;
  no_rekam_medis: string | null;
  no_sep: string | null;
  nm_pasien: string | null;
  nm_dokter: string | null;
  nm_poli: string | null;
  tgl_perawatan: string | null;
  kd_dokter: string | null;
  total_permintaan_radiologi: number;
  total_permintaan_lab: number;
  konsul_count: number;
  jns_perawatan: Array<{
    kd_jenis_prw: string;
    nm_perawatan: string;
  }>;
  jns_perawatan_radiologi: Array<{
    kd_jenis_prw: string;
    nm_perawatan: string;
    noorder: string;
  }>;
  tarif_from_csv?: number;
  alokasi?: number;
  dpjp_utama?: number;
  konsul?: number;
  laboratorium?: number;
  radiologi?: number;
  yang_terbagi?: number;
  percent_dari_klaim?: number;
};

export const createColumns = (
  copiedItems: Set<string>,
  handleCopy: (text: string, id: string) => void,
  isCsvMode: boolean = false
) => {
  const baseColumns: ColumnDef<RawatJalanData>[] = [
    {
      accessorKey: "tgl_perawatan",
      header: "Tanggal Perawatan",
      cell: ({ row }) => {
        const value = row.getValue("tgl_perawatan") as string | null;
        return value ? format(new Date(value), "dd MMM yyyy") : "-";
      },
    },
    {
      accessorKey: "no_rekam_medis",
      header: "No RM",
      cell: ({ row }) => {
        const value = row.getValue("no_rekam_medis") as string | null;
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
      accessorKey: "no_sep",
      header: "No SEP",
      cell: ({ row }) => {
        const value = row.getValue("no_sep") as string | null;
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
      accessorKey: "no_rawat",
      header: "No Rawat",
      cell: ({ row }) => {
        const value = row.getValue("no_rawat") as string | null;
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
      accessorKey: "nm_pasien",
      header: "Nama Pasien",
    },
    {
      accessorKey: "nm_dokter",
      header: "Dokter",
      cell: ({ row }) => {
        const value = row.getValue("nm_dokter") as string | null;
        return <p className="font-sm">{value || "-"}</p>;
      },
    },
    {
      accessorKey: "nm_poli",
      header: "Poli",
      cell: ({ row }) => {
        const value = row.getValue("nm_poli") as string | null;
        return <span className="uppercase">{value || "-"}</span>;
      },
    },
    {
      accessorKey: "total_permintaan_radiologi",
      header: "Permintaan Radiologi",
      cell: ({ row }) => {
        const value = row.getValue("total_permintaan_radiologi") as number;
        const radiologiData = row.original.jns_perawatan_radiologi;

        if (value > 0) {
          return (
            <Tooltip delayDuration={0}>
              <TooltipTrigger>
                <Button variant="ghost" size="sm">
                  {value}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {Object.entries(
                  radiologiData
                    .filter((item) => item.noorder)
                    .reduce(
                      (acc: any, item: any) => {
                        if (!acc[item.noorder]) {
                          acc[item.noorder] = [];
                        }
                        acc[item.noorder].push(item);
                        return acc;
                      },
                      {} as { [key: string]: any[] }
                    )
                ).map(([noorder, items]) => (
                  <div key={noorder} className="mb-2">
                    <p className="font-semibold">{noorder}</p>
                    {(items as any[]).map((item: any) => (
                      <p key={item.kd_jenis_prw} className="ml-2 text-sm">
                        {item.nm_perawatan}
                      </p>
                    ))}
                  </div>
                ))}
              </TooltipContent>
            </Tooltip>
          );
        }

        return (
          <Button variant="ghost" size="sm">
            {value}
          </Button>
        );
      },
    },
    {
      accessorKey: "total_permintaan_lab",
      header: "Permintaan Lab",
      cell: ({ row }) => {
        return (
          <span className="text-center">
            {row.getValue("total_permintaan_lab")}
          </span>
        );
      },
    },
    {
      accessorKey: "konsul_count",
      header: "Konsul",
      cell: ({ row }) => {
        const value = row.getValue("konsul_count") as number;
        const perawatanList = row.original.jns_perawatan;

        if (value > 0) {
          return (
            <Tooltip delayDuration={0}>
              <TooltipTrigger>
                <Button variant="ghost" size="sm">
                  {value}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <PerawatanList perawatanList={perawatanList} />
              </TooltipContent>
            </Tooltip>
          );
        }

        return (
          <Button variant="ghost" size="sm">
            {value}
          </Button>
        );
      },
    },
  ];

  if (isCsvMode) {
    const csvColumns: ColumnDef<RawatJalanData>[] = [
      {
        accessorKey: "tarif_from_csv",
        header: "Total Tarif",
        cell: ({ row }) => {
          const value = row.getValue("tarif_from_csv") as number;
          return (
            <span className="text-right font-mono">
              {value > 0 ? formatCurrency(value) : "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "alokasi",
        header: "Alokasi",
        cell: ({ row }) => {
          const value = row.getValue("alokasi") as number;
          return (
            <span className="text-right font-mono">
              {value > 0 ? formatCurrency(value) : "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "dpjp_utama",
        header: "DPJP Utama",
        cell: ({ row }) => {
          const value = row.getValue("dpjp_utama") as number;
          return (
            <span className="text-right font-mono">
              {value > 0 ? formatCurrency(value) : "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "konsul",
        header: "Konsul",
        cell: ({ row }) => {
          const value = row.getValue("konsul") as number;
          return (
            <span className="text-right font-mono">
              {value > 0 ? formatCurrency(value) : "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "laboratorium",
        header: "Laboratorium",
        cell: ({ row }) => {
          const value = row.getValue("laboratorium") as number;
          return (
            <span className="text-right font-mono">
              {value > 0 ? formatCurrency(value) : "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "radiologi",
        header: "Radiologi",
        cell: ({ row }) => {
          const value = row.getValue("radiologi") as number;
          return (
            <span className="text-right font-mono">
              {value > 0 ? formatCurrency(value) : "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "yang_terbagi",
        header: "Yang Terbagi",
        cell: ({ row }) => {
          const value = row.getValue("yang_terbagi") as number;
          return (
            <span className="text-right font-mono">
              {value > 0 ? formatCurrency(value) : "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "percent_dari_klaim",
        header: "% Dari Klaim",
        cell: ({ row }) => {
          const value = row.getValue("percent_dari_klaim") as number;
          return (
            <span className="text-center font-mono">
              {value !== undefined ? `${value}%` : "-"}
            </span>
          );
        },
      },
    ];

    return [...baseColumns, ...csvColumns];
  }

  return baseColumns;
};
