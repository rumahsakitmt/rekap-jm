import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Fragment } from "react";
import { z } from "zod";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ChevronLeft, FileInput, Slash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

const searchSchema = z.object({
  triase_type: z.string().optional(),
});

export const Route = createFileRoute("/igd/triase/$norawat/")({
  component: RouteComponent,
  validateSearch: searchSchema,
});

function RouteComponent() {
  const { norawat } = Route.useParams();
  const { triase_type } = Route.useSearch();
  const { data: t } = useQuery({
    ...trpc.triase.getPatientTriase.queryOptions({
      no_rawat: norawat,
      triase_type: triase_type as "primer" | "sekunder",
    }),
    enabled: !!triase_type && !!norawat,
  });

  if (!t) {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-8">
        <Button variant="outline" size="sm" asChild>
          <Link to="/igd/triase">
            <ChevronLeft className="mr-2 size-4" />
            Kembali
          </Link>
        </Button>
        <div className="text-center border p-4 rounded-2xl space-y-4">
          <p>Belum ada data triase</p>
          <Link to="/igd/triase/$norawat/form" params={{ norawat }}>
            <Button size="sm">
              <FileInput />
              Input Triase
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  function checkLabel(skala: string) {
    switch (skala) {
      case "skala1":
        return "Immediate/Segera";
      case "skala2":
        return "Emergensi";
      case "skala3":
        return "Urgensi";
      case "skala4":
        return "Semi Urgensi/Urgensi Rendah";
      case "skala5":
        return "Non Urgensi";
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-8">
      <Button variant="outline" size="sm" asChild>
        <Link to="/igd/triase">
          <ChevronLeft className="mr-2 size-4" />
          Kembali
        </Link>
      </Button>
      <div className="border rounded-2xl p-4 space-y-4">
        <span className="text-xs text-muted-foreground">
          {format(
            new Date(t?.patient.tanggal_kunjungan as string),
            "yyyy-MM-dd HH:mm"
          )}
        </span>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <p>{t?.patient.nama_pasien}</p>
          <div className="flex items-center gap-2">
            {t?.patient.no_rawat} <Slash size={16} /> {t?.patient.no_rkm_medis}
          </div>
        </div>
        <div className="grid grid-cols-2  md:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Cara Masuk</span>
            <span>{t?.patient.cara_masuk}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Transportasi</span>
            <span>{t?.patient.transportasi}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">
              Alasan Kedatangan
            </span>
            <span>{t?.patient.alasan_kedatangan}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Macam Kasus</span>
            <span>{t?.patient.macam_kasus}</span>
          </div>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Keterangan</TableHead>
            <TableHead>Triase {triase_type}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Kebutuhan Khusus</TableCell>
            <TableCell className="w-[400px]">
              <p className="text-wrap max-w-[400px]">
                {t?.triase_type === "primer"
                  ? "keluhan_utama" in t.triase && t.triase.keluhan_utama
                  : "amnesia_singkat" in t.triase && t.triase.amnesia_singkat}
              </p>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="align-top">Tanda Vital</TableCell>
            <TableCell className="w-[400px]">
              <p className="text-wrap max-w-[400px] flex flex-wrap gap-2">
                <span>Suhu (C): {t?.triase.suhu},</span>
                <span>Nyeri: {t?.triase.nyeri},</span>
                <span>Tensi: {t?.triase.tekanan_darah},</span>
                <span>Nadi(/menit): {t?.triase.nadi},</span>
                <span>Saturasi O2(%): {t?.triase.saturasi_o2},</span>
                <span>Respirasi(/menit): {t?.triase.pernapasan}</span>
              </p>
            </TableCell>
          </TableRow>
          {triase_type === "primer" && (
            <TableRow>
              <TableCell>Kebutuhan Khusus</TableCell>
              <TableCell className="w-[400px]">
                {t?.triase_type === "primer" &&
                  "kebutuhan_khusus" in t.triase &&
                  t.triase.kebutuhan_khusus}
              </TableCell>
            </TableRow>
          )}
          <TableRow className="bg-secondary">
            <TableCell>Pemeriksaan</TableCell>
            <TableCell>{checkLabel(t?.skala_type || "skala1")}</TableCell>
          </TableRow>
          {t?.pemeriksaan?.map((p) => (
            <TableRow key={p.kode_pemeriksaan}>
              <TableCell>{p.nama_pemeriksaan}</TableCell>
              <TableCell
                className={cn(
                  triase_type === "primer"
                    ? "bg-red-600 text-white"
                    : "bg-yellow-600 text-white"
                )}
              >
                {p.skala.map((s, i) => (
                  <div key={i}>{s.pengkajian_skala}</div>
                ))}
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell>Plan/Keputusan</TableCell>
            <TableCell
              className={cn(
                triase_type === "primer"
                  ? "bg-red-600 text-white"
                  : "bg-yellow-600 text-white"
              )}
            >
              {t?.triase_type === "primer" && "Zona Merah"} {t?.triase.plan}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="text-center"></TableCell>
            <TableCell className="text-center">Dokter/Petugas Triase</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Tanggal & Jam</TableCell>
            <TableCell>
              {format(
                new Date(t?.triase.tanggaltriase as string),
                "yyyy-MM-dd HH:mm"
              )}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Catatan</TableCell>
            <TableCell>{t?.triase.catatan}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Nama Dokter/Petugas</TableCell>
            <TableCell>{t?.triase.nm_pegawai}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
