import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const rawatJalan = useQuery(trpc.rawatJalan.getRawatJalan.queryOptions());
  console.log(rawatJalan.data);
  return (
    <div className="container mx-auto  px-4 py-2">
      <h2 className="mb-2 font-medium">Rawat Jalan</h2>
      <Table>
        <TableCaption>Rekap Rawat Jalan</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">No Rawat/Sep</TableHead>
            <TableHead>Dokter</TableHead>
            <TableHead>Tanggal Perawatan</TableHead>
            <TableHead>Total Permintaan Radiologi</TableHead>
            <TableHead>Total Permintaan Lab</TableHead>
            <TableHead>Perawatan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rawatJalan.data?.map((rawatJalan) => (
            <TableRow key={rawatJalan.no_rawat}>
              <TableCell className="font-medium">
                <div>
                  <div className="text-xs text-muted-foreground">
                    {rawatJalan.no_rawat}
                  </div>
                  {rawatJalan.no_sep}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {rawatJalan.kd_dokter}
                  </p>
                  <p>{rawatJalan.nm_dokter}</p>
                </div>
              </TableCell>
              <TableCell>
                {format(
                  new Date(rawatJalan.tgl_perawatan as string),
                  "dd/MM/yyyy"
                )}
              </TableCell>
              <TableCell>{rawatJalan.total_permintaan_radiologi}</TableCell>
              <TableCell>{rawatJalan.total_permintaan_lab}</TableCell>
              <TableCell>
                <div className="space-y-2">
                  {rawatJalan.jns_perawatan?.map((perawatan) => (
                    <div key={perawatan.kd_jenis_prw}>
                      <span className="text-xs text-muted-foreground">
                        {perawatan.kd_jenis_prw}
                      </span>
                      <div>{perawatan.nm_perawatan}</div>
                    </div>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
