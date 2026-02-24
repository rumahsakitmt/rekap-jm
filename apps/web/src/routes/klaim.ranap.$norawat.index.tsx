import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import {
  DiagnosaCombobox,
  ProsedurCombobox,
} from "@/components/klaim/diagnosa-combobox";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/klaim/ranap/$norawat/")({
  component: RouteComponent,
});

const caraMasukLabels: Record<string, string> = {
  gp: "Rujukan FKTP",
  "hosp-trans": "Rujukan FKRTL",
  mp: "Rujukan Spesialis",
  outp: "Dari Rawat Jalan",
  inp: "Dari Rawat Inap",
  emd: "Dari Rawat Darurat",
  born: "Lahir Di RS",
  nursing: "Rujukan Panti Jompo",
  psych: "Rujukan Dari RS Jiwa",
  rehab: "Rujukan Fasilitas Rehab",
  other: "Lain-lain",
};

const upgradeClassLabels: Record<string, string> = {
  kelas_1: "Kelas 1",
  kelas_2: "Kelas 2",
  vip: "Kelas VIP",
  vvip: "Kelas VVIP",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[200px_auto_1fr] gap-2 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-muted-foreground">:</span>
      <span className="font-medium">{value || "-"}</span>
    </div>
  );
}

function BillingRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{formatCurrency(value)}</span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
      <Skeleton className="h-80" />
    </div>
  );
}

function DiagnosaProsedurCard({
  diagnosa,
  prosedur,
  diagnosaInacbg,
  prosedurInacbg,
}: {
  diagnosa: string;
  prosedur: string;
  diagnosaInacbg: string;
  prosedurInacbg: string;
}) {
  const idrgDiagnosa = diagnosa ? diagnosa.split("#").filter(Boolean) : [];
  const idrgProsedur = prosedur ? prosedur.split("#").filter(Boolean) : [];

  const [diagnosaIdrg, setDiagnosaIdrg] = useState<string[]>(idrgDiagnosa);
  const [prosedurIdrg, setProsedurIdrg] = useState<string[]>(idrgProsedur);
  const [diagnosaInacbgState, setDiagnosaInacbgState] = useState<string[]>(
    diagnosaInacbg ? diagnosaInacbg.split("#").filter(Boolean) : idrgDiagnosa
  );
  const [prosedurInacbgState, setProsedurInacbgState] = useState<string[]>(
    prosedurInacbg ? prosedurInacbg.split("#").filter(Boolean) : idrgProsedur
  );

  useEffect(() => {
    setDiagnosaIdrg(diagnosa ? diagnosa.split("#").filter(Boolean) : []);
    setProsedurIdrg(prosedur ? prosedur.split("#").filter(Boolean) : []);
    setDiagnosaInacbgState(
      diagnosaInacbg ? diagnosaInacbg.split("#").filter(Boolean) : idrgDiagnosa
    );
    setProsedurInacbgState(
      prosedurInacbg ? prosedurInacbg.split("#").filter(Boolean) : idrgProsedur
    );
  }, [diagnosa, prosedur, diagnosaInacbg, prosedurInacbg]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Diagnosa & Prosedur</CardTitle>
        <CardDescription>
          Klik untuk mencari dan memilih diagnosa/prosedur
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Diagnosa IDRG</Label>
            <DiagnosaCombobox
              value={diagnosaIdrg}
              onChange={setDiagnosaIdrg}
              placeholder="Cari diagnosa IDRG..."
              inacbgOnly={false}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Prosedur IDRG</Label>
            <ProsedurCombobox
              value={prosedurIdrg}
              onChange={setProsedurIdrg}
              placeholder="Cari prosedur IDRG..."
              inacbgOnly={false}
            />
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Diagnosa INACBG</Label>
            <DiagnosaCombobox
              value={diagnosaInacbgState}
              onChange={setDiagnosaInacbgState}
              placeholder="Cari diagnosa INACBG..."
              inacbgOnly={true}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Prosedur INACBG</Label>
            <ProsedurCombobox
              value={prosedurInacbgState}
              onChange={setProsedurInacbgState}
              placeholder="Cari prosedur INACBG..."
              inacbgOnly={true}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RouteComponent() {
  const { norawat } = Route.useParams();

  const { data, isLoading, error } = useQuery(
    trpc.klaim.getKlaimRanap.queryOptions({ noRawat: norawat })
  );

  if (isLoading) return <LoadingSkeleton />;

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Gagal memuat data: {error.message}
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Data tidak ditemukan untuk No. Rawat: {norawat}
        </CardContent>
      </Card>
    );
  }

  const totalBilling = Object.values(data.billing).reduce(
    (sum, val) => sum + val,
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          to="/klaim/ranap"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Kembali
        </Link>
        <Separator orientation="vertical" className="data-[orientation=vertical]:h-4" />
        <h1 className="text-lg font-semibold">Detail Klaim Ranap</h1>
        <Badge variant="outline">{data.noRawat}</Badge>
      </div>

      {/* Patient Info & Admission */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Informasi Pasien</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            <InfoRow label="No. Rawat" value={data.noRawat} />
            <InfoRow label="No. RM" value={data.noRkmMedis} />
            <InfoRow
              label="Nama Pasien"
              value={`${data.nmPasien}, ${data.umurdaftar} ${data.sttsumur}`}
            />
            <InfoRow label="Jenis Kelamin" value={data.jk} />
            <InfoRow label="Tgl. Lahir" value={data.tglLahir} />
            <InfoRow label="Alamat" value={data.almtPj} />
            <InfoRow label="Tgl. Registrasi" value={data.tglRegistrasi} />
            <InfoRow label="Poliklinik" value={data.nmPoli} />
            <InfoRow label="Dokter" value={data.nmDokter} />
            <InfoRow
              label="Status"
              value={`${data.statusLanjut} (${data.pngJawab})`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Data Klaim</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            <InfoRow label="No. SEP" value={data.nosep} />
            <InfoRow label="No. Kartu" value={data.noKartu} />
            <InfoRow
              label="Cara Masuk"
              value={caraMasukLabels[data.caraMasuk] || data.caraMasuk}
            />
            <InfoRow label="Tgl. Keluar" value={data.tglKeluar} />
            <InfoRow label="Kelas Rawat" value={data.klsRawat ? `Kelas ${data.klsRawat}` : "-"} />
            <InfoRow label="Jenis Rawat" value={data.jnsRawat === "1" ? "Rawat Inap" : "Rawat Jalan"} />
            <InfoRow label="Sistole" value={data.sistole} />
            <InfoRow label="Diastole" value={data.diastole} />
            <InfoRow
              label="Status Pulang"
              value={data.dischargeStatusLabel}
            />
            <InfoRow
              label="Indikator Upgrade Kelas"
              value={data.upgradeClassInd === "1" ? "Ya" : "Tidak"}
            />
            {data.upgradeClassInd === "1" && (
              <InfoRow
                label="Naik ke Kelas"
                value={
                  upgradeClassLabels[data.upgradeClassClass] ||
                  data.upgradeClassClass
                }
              />
            )}
            <InfoRow label="Berat Saat Lahir" value={data.birthWeight || "-"} />
          </CardContent>
        </Card>
      </div>

      {/* Diagnoses & Procedures */}
      <DiagnosaProsedurCard
        diagnosa={data.diagnosa}
        prosedur={data.prosedur}
        diagnosaInacbg={data.diagnosaInacbg}
        prosedurInacbg={data.prosedurInacbg}
      />

      {/* Billing */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Rincian Biaya</CardTitle>
          <CardDescription>
            Total: {formatCurrency(totalBilling)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-x-8 md:grid-cols-2">
            <div>
              <BillingRow
                label="Prosedur Non Bedah"
                value={data.billing.prosedurNonBedah}
              />
              <BillingRow
                label="Prosedur Bedah"
                value={data.billing.prosedurBedah}
              />
              <BillingRow
                label="Konsultasi"
                value={data.billing.konsultasi}
              />
              <BillingRow
                label="Tenaga Ahli"
                value={data.billing.tenagaAhli}
              />
              <BillingRow
                label="Keperawatan"
                value={data.billing.keperawatan}
              />
              <BillingRow
                label="Penunjang"
                value={data.billing.penunjang}
              />
              <BillingRow
                label="Radiologi"
                value={data.billing.radiologi}
              />
              <BillingRow
                label="Laboratorium"
                value={data.billing.laboratorium}
              />
              <BillingRow
                label="Pelayanan Darah"
                value={data.billing.pelayananDarah}
              />
            </div>
            <div>
              <BillingRow
                label="Rehabilitasi"
                value={data.billing.rehabilitasi}
              />
              <BillingRow label="Kamar" value={data.billing.kamar} />
              <BillingRow
                label="Rawat Intensif"
                value={data.billing.rawatIntensif}
              />
              <BillingRow label="Obat" value={data.billing.obat} />
              <BillingRow
                label="Obat Kronis"
                value={data.billing.obatKronis}
              />
              <BillingRow
                label="Obat Kemoterapi"
                value={data.billing.obatKemoterapi}
              />
              <BillingRow label="Alkes" value={data.billing.alkes} />
              <BillingRow label="BMHP" value={data.billing.bmhp} />
              <BillingRow
                label="Sewa Alat"
                value={data.billing.sewaAlat}
              />
              <BillingRow
                label="Tarif Poli Eksekutif"
                value={data.billing.tarifPoliEks}
              />
            </div>
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between text-sm font-semibold">
            <span>Total Biaya</span>
            <span className="tabular-nums">{formatCurrency(totalBilling)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
