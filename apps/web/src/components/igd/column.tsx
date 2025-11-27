import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export interface IGDRegistration {
  no_reg: string | null;
  no_rawat: string | null;
  no_rkm_medis: string | null;
  tgl_registrasi: string | null;
  nm_dokter: string | null;
  nm_pasien: string | null;
}

export const columns: ColumnDef<IGDRegistration>[] = [
  {
    accessorKey: "no_rawat",
    header: "No Rawat",
    cell: ({ row }) => {
      return (
        <div>
          <Link
            to="/igd/triase/$norawat"
            params={{
              norawat: row.original.no_rawat as string,
            }}
          >
            {row.original.no_rawat}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "no_rkm_medis",
    header: "No RM",
    cell: ({ row }) => {
      return <div>{row.original.no_rkm_medis}</div>;
    },
  },
  {
    accessorKey: "tgl_registrasi",
    header: "Tanggal Registrasi",
    cell: ({ row }) => {
      return (
        <div>
          {format(
            new Date(row.original.tgl_registrasi || new Date()),
            "dd/MM/yyy"
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "nm_pasien",
    header: "Pasien",
    cell: ({ row }) => {
      return <div>{row.original.nm_pasien}</div>;
    },
  },
  {
    accessorKey: "nm_dokter",
    header: "Dokter Dituju",
    cell: ({ row }) => {
      return <div>{row.original.nm_dokter}</div>;
    },
  },
];
