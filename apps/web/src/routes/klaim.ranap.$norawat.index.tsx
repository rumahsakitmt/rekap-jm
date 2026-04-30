import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useKlaimRanapStore } from "@/stores/klaim-ranap-store";
import { LoadingSkeleton } from "@/components/klaim/loading-skeleton";
import { PatientInfoCard } from "@/components/klaim/patient-info-card";
import { KlaimDataCard } from "@/components/klaim/klaim-data-card";
import { DiagnosaProsedurCard } from "@/components/klaim/diagnosa-prosedur-card";
import { BillingCard } from "@/components/klaim/billing-card";
import { KlaimActionButtons } from "@/components/klaim/klaim-action-buttons";

export const Route = createFileRoute("/klaim/ranap/$norawat/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { norawat } = Route.useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const initFromData = useKlaimRanapStore((state) => state.initFromData);
  const reset = useKlaimRanapStore((state) => state.reset);

  const { data, isLoading, error } = useQuery(
    trpc.klaim.getKlaimRanap.queryOptions({ noRawat: norawat }),
  );

  useEffect(() => {
    if (data) {
      initFromData(data);
    }
    return () => {
      reset();
    };
  }, [data, initFromData, reset]);

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

  const handleSimpan = () => {
    if (!data) return;
    const state = useKlaimRanapStore.getState();

    simpanKlaim.mutate({
      no_rawat: data.noRawat,
      tgl_registrasi: data.tglRegistrasi,
      codernik: sessionStorage.getItem("coder_nik") || "",
      nosep: data.nosep,
      nokartu: data.noKartu,
      nm_pasien: data.nmPasien,
      keluar: data.tglKeluar,
      kelas_rawat: data.klsRawat,
      cara_masuk: data.caraMasuk,
      diagnosa: state.diagnosaIdrg.join("#"),
      procedure: state.prosedurIdrg.join("#"),
      diagnosainacbg: state.diagnosaInacbg.join("#"),
      procedureinacbg: state.prosedurInacbg.join("#"),
      diagnosa_status: state.diagnosaStatuses.join("#"),
      prosedur_status: state.prosedurStatuses.join("#"),

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

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.history.back()}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            Kembali
          </button>
          <Separator
            orientation="vertical"
            className="data-[orientation=vertical]:h-4"
          />
          <h1 className="text-lg font-semibold">Detail Klaim Ranap</h1>
          <Badge variant="outline">{data.noRawat}</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PatientInfoCard data={data} />
        <KlaimDataCard data={data} />
      </div>

      <DiagnosaProsedurCard noRawat={data.noRawat} />

      <BillingCard billing={data.billing} />

      <KlaimActionButtons
        isKlaimed={data.isKlaimed}
        simpanPending={simpanKlaim.isPending}
        kirimPending={kirimKlaim.isPending}
        hapusPending={hapusKlaim.isPending}
        onSimpan={handleSimpan}
        onKirim={() => kirimKlaim.mutate({ no_sep: data.nosep })}
        onHapus={() =>
          hapusKlaim.mutate({
            no_sep: data.nosep,
            coder_nik: sessionStorage.getItem("coder_nik") || "",
          })
        }
      />
    </div>
  );
}
