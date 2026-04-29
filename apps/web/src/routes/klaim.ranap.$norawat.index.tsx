import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { ArrowLeft, Save, Loader2, Trash2, Send } from "lucide-react";
import { useState, useEffect } from "react";
import {
  DiagnosaCombobox,
  ProsedurCombobox,
} from "@/components/klaim/diagnosa-combobox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

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

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
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
    diagnosaInacbg ? diagnosaInacbg.split("#").filter(Boolean) : idrgDiagnosa,
  );
  const [prosedurInacbgState, setProsedurInacbgState] = useState<string[]>(
    prosedurInacbg ? prosedurInacbg.split("#").filter(Boolean) : idrgProsedur,
  );

  useEffect(() => {
    setDiagnosaIdrg(diagnosa ? diagnosa.split("#").filter(Boolean) : []);
    setProsedurIdrg(prosedur ? prosedur.split("#").filter(Boolean) : []);
    setDiagnosaInacbgState(
      diagnosaInacbg ? diagnosaInacbg.split("#").filter(Boolean) : idrgDiagnosa,
    );
    setProsedurInacbgState(
      prosedurInacbg ? prosedurInacbg.split("#").filter(Boolean) : idrgProsedur,
    );
  }, [diagnosa, prosedur, diagnosaInacbg, prosedurInacbg]);

  // Keep IDRG and INACBG in sync
  const handleDiagnosaIdrgChange = (value: string[]) => {
    setDiagnosaIdrg(value);
    setDiagnosaInacbgState(value);
  };
  const handleProsedurIdrgChange = (value: string[]) => {
    setProsedurIdrg(value);
    setProsedurInacbgState(value);
  };
  const handleDiagnosaInacbgChange = (value: string[]) => {
    setDiagnosaInacbgState(value);
    setDiagnosaIdrg(value);
  };
  const handleProsedurInacbgChange = (value: string[]) => {
    setProsedurInacbgState(value);
    setProsedurIdrg(value);
  };

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
              onChange={handleDiagnosaIdrgChange}
              placeholder="Cari diagnosa IDRG..."
              inacbgOnly={false}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Prosedur IDRG</Label>
            <ProsedurCombobox
              value={prosedurIdrg}
              onChange={handleProsedurIdrgChange}
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
              onChange={handleDiagnosaInacbgChange}
              placeholder="Cari diagnosa INACBG..."
              inacbgOnly={true}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Prosedur INACBG</Label>
            <ProsedurCombobox
              value={prosedurInacbgState}
              onChange={handleProsedurInacbgChange}
              placeholder="Cari prosedur INACBG..."
              inacbgOnly={true}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SimpanKlaimInput {
  no_rawat: string;
  tgl_registrasi: string;
  codernik: string;
  nosep: string;
  nokartu: string;
  nm_pasien: string;
  keluar: string;
  kelas_rawat: string;
  cara_masuk: string;
  diagnosa: string;
  procedure: string;
  diagnosainacbg: string;
  procedureinacbg: string;
  prosedur_non_bedah: string;
  prosedur_bedah: string;
  konsultasi: string;
  tenaga_ahli: string;
  keperawatan: string;
  penunjang: string;
  radiologi: string;
  laboratorium: string;
  pelayanan_darah: string;
  rehabilitasi: string;
  kamar: string;
  rawat_intensif: string;
  obat: string;
  obat_kronis: string;
  obat_kemoterapi: string;
  alkes: string;
  bmhp: string;
  sewa_alat: string;
  tarif_poli_eks: string;
  nama_dokter: string;
  jk: string;
  tgl_lahir: string;
  jnsrawat: string;
  sistole: string;
  diastole: string;
  discharge_status: string;
  birth_weight: string;
  upgrade_class_ind: string;
  upgrade_class_class: string;
  no_rkm_medis: string;
}

interface SimpanKlaimResult {
  success: boolean;
  message?: string;
}

const EKLAIM_STEPS = [
  "Menyiapkan data klaim...",
  "Mengirim ke server INACBG...",
  "Menunggu respons server...",
  "Memproses data pasien...",
  "Menyimpan diagnosa dan prosedur...",
  "Melakukan grouping klaim...",
  "Menyimpan hasil ke database...",
  "Memfinalisasi klaim...",
];

function SpinnerVerb() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % EKLAIM_STEPS.length);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return <span>{EKLAIM_STEPS[index]}</span>;
}

function RouteComponent() {
  const { norawat } = Route.useParams();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(
    trpc.klaim.getKlaimRanap.queryOptions({ noRawat: norawat }),
  );

  const simpanKlaim = useMutation({
    ...trpc.klaim.simpanKlaim.mutationOptions(),
    onSuccess: (result: any) => {
      if (result.success) {
        toast.success("Klaim berhasil disimpan");
        queryClient.invalidateQueries({
          queryKey: trpc.klaim.getKlaimRanap.queryKey({ noRawat: norawat }),
        });
      } else {
        toast.error(result.message || "Gagal menyimpan klaim");
      }
    },
    onError: (err: any) => {
      toast.error(`Error: ${err.message}`);
    },
  });

  const hapusKlaim = useMutation({
    ...trpc.klaim.hapusKlaim.mutationOptions(),
    onSuccess: (result: any) => {
      if (result.success) {
        toast.success(result.message || "Klaim berhasil dihapus");
        queryClient.invalidateQueries({
          queryKey: trpc.klaim.getKlaimRanap.queryKey({ noRawat: norawat }),
        });
      } else {
        toast.error(result.message || "Gagal menghapus klaim");
      }
    },
    onError: (err: any) => {
      toast.error(`Error: ${err.message}`);
    },
  });

  const kirimKlaim = useMutation({
    ...trpc.klaim.kirimKlaim.mutationOptions(),
    onSuccess: (result: any) => {
      if (result.success) {
        toast.success(result.message || "Klaim berhasil dikirim");
        queryClient.invalidateQueries({
          queryKey: trpc.klaim.getKlaimRanap.queryKey({ noRawat: norawat }),
        });
      } else {
        toast.error(result.message || "Gagal mengirim klaim");
      }
    },
    onError: (err: any) => {
      toast.error(`Error: ${err.message}`);
    },
  });

  // Local state to hold the actively selected diagnosa and prosedur before saving
  const [diagnosaIdrg, setDiagnosaIdrg] = useState<string[]>([]);
  const [prosedurIdrg, setProsedurIdrg] = useState<string[]>([]);
  const [diagnosaInacbgState, setDiagnosaInacbgState] = useState<string[]>([]);
  const [prosedurInacbgState, setProsedurInacbgState] = useState<string[]>([]);
  const [diagnosaStatuses, setDiagnosaStatuses] = useState<string[]>([]);
  const [prosedurStatuses, setProsedurStatuses] = useState<string[]>([]);
  const [kirimDialogOpen, setKirimDialogOpen] = useState(false);
  const [hapusDialogOpen, setHapusDialogOpen] = useState(false);

  // Sync statuses when codes change
  const syncStatuses = (
    newCodes: string[],
    oldCodes: string[],
    oldStatuses: string[],
  ): string[] => {
    const map = new Map<string, string>();
    oldCodes.forEach((c, i) => map.set(c, oldStatuses[i] || "Ralan"));
    return newCodes.map((c) => map.get(c) || "Ralan");
  };

  // Keep IDRG and INACBG in sync
  const handleDiagnosaIdrgChange = (value: string[]) => {
    setDiagnosaIdrg(value);
    setDiagnosaInacbgState(value);
    setDiagnosaStatuses((prev) => syncStatuses(value, diagnosaIdrg, prev));
  };
  const handleProsedurIdrgChange = (value: string[]) => {
    setProsedurIdrg(value);
    setProsedurInacbgState(value);
    setProsedurStatuses((prev) => syncStatuses(value, prosedurIdrg, prev));
  };
  const handleDiagnosaInacbgChange = (value: string[]) => {
    setDiagnosaInacbgState(value);
    setDiagnosaIdrg(value);
    setDiagnosaStatuses((prev) =>
      syncStatuses(value, diagnosaInacbgState, prev),
    );
  };
  const handleProsedurInacbgChange = (value: string[]) => {
    setProsedurInacbgState(value);
    setProsedurIdrg(value);
    setProsedurStatuses((prev) =>
      syncStatuses(value, prosedurInacbgState, prev),
    );
  };

  useEffect(() => {
    if (data) {
      const dIdrg = data.diagnosa
        ? data.diagnosa.split("#").filter(Boolean)
        : [];
      const pIdrg = data.prosedur
        ? data.prosedur.split("#").filter(Boolean)
        : [];
      const dInacbg = data.diagnosaInacbg
        ? data.diagnosaInacbg.split("#").filter(Boolean)
        : data.diagnosa
          ? data.diagnosa.split("#").filter(Boolean)
          : [];
      const pInacbg = data.prosedurInacbg
        ? data.prosedurInacbg.split("#").filter(Boolean)
        : data.prosedur
          ? data.prosedur.split("#").filter(Boolean)
          : [];

      setDiagnosaIdrg(dIdrg);
      setProsedurIdrg(pIdrg);
      setDiagnosaInacbgState(dInacbg);
      setProsedurInacbgState(pInacbg);

      setDiagnosaStatuses(
        data.diagnosaStatus
          ? data.diagnosaStatus.split("#").filter(Boolean)
          : dIdrg.map(() => "Ralan"),
      );
      setProsedurStatuses(
        data.prosedurStatus
          ? data.prosedurStatus.split("#").filter(Boolean)
          : pIdrg.map(() => "Ralan"),
      );
    }
  }, [data]);

  const handleSimpan = () => {
    if (!data) return;

    simpanKlaim.mutate({
      no_rawat: data.noRawat,
      tgl_registrasi: data.tglRegistrasi,
      codernik: "7602091611930001", // Assuming a valid coder nik, this might need to come from context/auth
      nosep: data.nosep,
      nokartu: data.noKartu,
      nm_pasien: data.nmPasien,
      keluar: data.tglKeluar,
      kelas_rawat: data.klsRawat,
      cara_masuk: data.caraMasuk,
      // For IDRG / INACBG
      diagnosa: diagnosaIdrg.join("#"),
      procedure: prosedurIdrg.join("#"),
      diagnosainacbg: diagnosaInacbgState.join("#"),
      procedureinacbg: prosedurInacbgState.join("#"),
      diagnosa_status: diagnosaStatuses.join("#"),
      prosedur_status: prosedurStatuses.join("#"),

      // Billing
      prosedur_non_bedah: String(data.billing.prosedurNonBedah),
      prosedur_bedah: String(data.billing.prosedurBedah),
      konsultasi: String(data.billing.konsultasi),
      tenaga_ahli: String(data.billing.tenagaAhli),
      keperawatan: String(data.billing.keperawatan),
      penunjang: String(data.billing.penunjang),
      radiologi: String(data.billing.radiologi),
      laboratorium: String(data.billing.laboratorium),
      pelayanan_darah: String(data.billing.pelayananDarah),
      rehabilitasi: String(data.billing.rehabilitasi),
      kamar: String(data.billing.kamar),
      rawat_intensif: String(data.billing.rawatIntensif),
      obat: String(data.billing.obat),
      obat_kronis: String(data.billing.obatKronis),
      obat_kemoterapi: String(data.billing.obatKemoterapi),
      alkes: String(data.billing.alkes),
      bmhp: String(data.billing.bmhp),
      sewa_alat: String(data.billing.sewaAlat),
      tarif_poli_eks: String(data.billing.tarifPoliEks),

      nama_dokter: data.nmDokter,
      jk: data.jk,
      tgl_lahir: data.tglLahir,
      jnsrawat: data.jnsRawat,
      sistole: data.sistole,
      diastole: data.diastole,
      discharge_status: data.dischargeStatus,
      birth_weight: data.birthWeight,
      upgrade_class_ind: data.upgradeClassInd,
      upgrade_class_class: data.upgradeClassClass,
      no_rkm_medis: data.noRkmMedis,
    });
  };

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
    0,
  );

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/klaim/ranap"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
          <Separator
            orientation="vertical"
            className="data-[orientation=vertical]:h-4"
          />
          <h1 className="text-lg font-semibold">Detail Klaim Ranap</h1>
          <Badge variant="outline">{data.noRawat}</Badge>
        </div>
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
            <InfoRow
              label="Kelas Rawat"
              value={data.klsRawat ? `Kelas ${data.klsRawat}` : "-"}
            />
            <InfoRow
              label="Jenis Rawat"
              value={data.jnsRawat === "1" ? "Rawat Inap" : "Rawat Jalan"}
            />
            <InfoRow label="Sistole" value={data.sistole} />
            <InfoRow label="Diastole" value={data.diastole} />
            <InfoRow label="Status Pulang" value={data.dischargeStatusLabel} />
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
              <Label className="text-sm font-medium">Diagnosa INACBG</Label>
              <DiagnosaCombobox
                value={diagnosaInacbgState}
                onChange={handleDiagnosaInacbgChange}
                placeholder="Cari diagnosa INACBG..."
                inacbgOnly={true}
                noRawat={data.noRawat}
                statuses={diagnosaStatuses}
                onStatusChange={(idx, status) => {
                  setDiagnosaStatuses((prev) => {
                    const next = [...prev];
                    next[idx] = status;
                    return next;
                  });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Prosedur INACBG</Label>
              <ProsedurCombobox
                value={prosedurInacbgState}
                onChange={handleProsedurInacbgChange}
                placeholder="Cari prosedur INACBG..."
                inacbgOnly={true}
                noRawat={data.noRawat}
                statuses={prosedurStatuses}
                onStatusChange={(idx, status) => {
                  setProsedurStatuses((prev) => {
                    const next = [...prev];
                    next[idx] = status;
                    return next;
                  });
                }}
              />
            </div>
          </div>

          <Separator />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Diagnosa IDRG</Label>
              <DiagnosaCombobox
                value={diagnosaIdrg}
                onChange={handleDiagnosaIdrgChange}
                placeholder="Cari diagnosa IDRG..."
                inacbgOnly={false}
                noRawat={data.noRawat}
                statuses={diagnosaStatuses}
                onStatusChange={(idx, status) => {
                  setDiagnosaStatuses((prev) => {
                    const next = [...prev];
                    next[idx] = status;
                    return next;
                  });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Prosedur IDRG</Label>
              <ProsedurCombobox
                value={prosedurIdrg}
                onChange={handleProsedurIdrgChange}
                placeholder="Cari prosedur IDRG..."
                inacbgOnly={false}
                noRawat={data.noRawat}
                statuses={prosedurStatuses}
                onStatusChange={(idx, status) => {
                  setProsedurStatuses((prev) => {
                    const next = [...prev];
                    next[idx] = status;
                    return next;
                  });
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

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
              <BillingRow label="Konsultasi" value={data.billing.konsultasi} />
              <BillingRow label="Tenaga Ahli" value={data.billing.tenagaAhli} />
              <BillingRow
                label="Keperawatan"
                value={data.billing.keperawatan}
              />
              <BillingRow label="Penunjang" value={data.billing.penunjang} />
              <BillingRow label="Radiologi" value={data.billing.radiologi} />
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
              <BillingRow label="Obat Kronis" value={data.billing.obatKronis} />
              <BillingRow
                label="Obat Kemoterapi"
                value={data.billing.obatKemoterapi}
              />
              <BillingRow label="Alkes" value={data.billing.alkes} />
              <BillingRow label="BMHP" value={data.billing.bmhp} />
              <BillingRow label="Sewa Alat" value={data.billing.sewaAlat} />
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

      <div className="flex flex-col gap-3">
        {!data.isKlaimed ? (
          <Button
            onClick={handleSimpan}
            disabled={simpanKlaim.isPending}
            className="flex-1"
          >
            {simpanKlaim.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                <SpinnerVerb />
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                Simpan Klaim
              </>
            )}
          </Button>
        ) : (
          <>
            <AlertDialog
              open={kirimDialogOpen}
              onOpenChange={setKirimDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button className="flex-1" disabled={kirimKlaim.isPending}>
                  {kirimKlaim.isPending ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 size-4" />
                  )}
                  Kirim Klaim
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Kirim Klaim ke DC</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin mengirim klaim ini ke DC (Data
                    Center)?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      kirimKlaim.mutate({ no_sep: data.nosep });
                    }}
                  >
                    Kirim
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
              open={hapusDialogOpen}
              onOpenChange={setHapusDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={hapusKlaim.isPending}
                >
                  {hapusKlaim.isPending ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 size-4" />
                  )}
                  Hapus Klaim
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Klaim</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus klaim ini? Tindakan ini
                    tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => {
                      hapusKlaim.mutate({
                        no_sep: data.nosep,
                        coder_nik: "7602091611930001",
                      });
                    }}
                  >
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </div>
  );
}
