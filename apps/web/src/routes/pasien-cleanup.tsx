import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, CirclePause, CircleStop, CircleX, LoaderCircle, Pause, Play, RefreshCw, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { trpc, trpcClient } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

type FailedPatient = {
  noRkmMedis: string;
  namaPasien: string | null;
  reason: string;
};

type BatchStage = "idle" | "processing" | "paused" | "stopping" | "stopped" | "completed";

export const Route = createFileRoute("/pasien-cleanup")({
  component: PatientRecordNumberCleanup,
});

function PatientRecordNumberCleanup() {
  const queryClient = useQueryClient();
  const dashedNumbersQuery = useQuery(
    trpc.pasien.getDashedMedicalRecordNumbers.queryOptions(),
  );
  const [batchStage, setBatchStage] = useState<BatchStage>("idle");
  const [batchTotal, setBatchTotal] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [successfulCount, setSuccessfulCount] = useState(0);
  const [failedPatients, setFailedPatients] = useState<FailedPatient[]>([]);
  const [currentNoRkmMedis, setCurrentNoRkmMedis] = useState<string | null>(null);
  const isPausedRef = useRef(false);
  const stopRequestedRef = useRef(false);
  const resumeBatchRef = useRef<(() => void) | null>(null);

  const patients = dashedNumbersQuery.data ?? [];
  const isProcessing = batchStage === "processing";
  const isPaused = batchStage === "paused";
  const isStopping = batchStage === "stopping";
  const isBatchActive = isProcessing || isPaused || isStopping;
  const progress = batchTotal === 0 ? 0 : (processedCount / batchTotal) * 100;

  const waitUntilResumed = () => {
    if (!isPausedRef.current) return Promise.resolve();

    return new Promise<void>((resolve) => {
      resumeBatchRef.current = resolve;
    });
  };

  const togglePause = () => {
    if (isPaused) {
      isPausedRef.current = false;
      resumeBatchRef.current?.();
      resumeBatchRef.current = null;
      setBatchStage("processing");
      return;
    }

    isPausedRef.current = true;
    setBatchStage("paused");
  };

  const stopBatch = () => {
    stopRequestedRef.current = true;
    isPausedRef.current = false;
    resumeBatchRef.current?.();
    resumeBatchRef.current = null;
    setBatchStage("stopping");
  };

  const normalizeAll = async () => {
    isPausedRef.current = false;
    stopRequestedRef.current = false;
    resumeBatchRef.current = null;
    setBatchStage("processing");
    setBatchTotal(patients.length);
    setProcessedCount(0);
    setSuccessfulCount(0);
    setFailedPatients([]);

    const failures: FailedPatient[] = [];
    let succeeded = 0;

    for (let index = 0; index < patients.length; index += 1) {
      if (stopRequestedRef.current) break;
      await waitUntilResumed();
      if (stopRequestedRef.current) break;

      const patient = patients[index];
      setCurrentNoRkmMedis(patient.noRkmMedis);

      try {
        await trpcClient.pasien.normalizeDashedMedicalRecordNumber.mutate({
          noRkmMedis: patient.noRkmMedis,
        });
        succeeded += 1;
        setSuccessfulCount(succeeded);
      } catch (error) {
        failures.push({
          noRkmMedis: patient.noRkmMedis,
          namaPasien: patient.namaPasien,
          reason: error instanceof Error ? error.message : "Pembaruan gagal karena kesalahan yang tidak diketahui.",
        });
        setFailedPatients([...failures]);
      } finally {
        setProcessedCount(index + 1);
      }

      if (stopRequestedRef.current) break;
    }

    setCurrentNoRkmMedis(null);
    const wasStopped = stopRequestedRef.current;
    setBatchStage(wasStopped ? "stopped" : "completed");
    await queryClient.invalidateQueries({
      queryKey: trpc.pasien.getDashedMedicalRecordNumbers.queryKey(),
    });
    toast.success(
      `${succeeded} nomor berhasil diperbarui${failures.length > 0 ? `, ${failures.length} dimasukkan ke keranjang gagal` : ""}${wasStopped ? ". Proses dihentikan." : "."}`,
    );
  };

  return (
    <main className="container mx-auto max-w-6xl space-y-6 py-6">
      <section className="rounded-xl border bg-gradient-to-br from-amber-500/10 via-background to-background p-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <ScanLine className="size-5" />
              <span className="text-sm font-semibold uppercase tracking-[0.16em]">Pemeliharaan data pasien</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Normalisasi Nomor Rekam Medis</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Temukan semua nomor RM yang memakai tanda hubung dan ubah menjadi nomor tanpa tanda hubung.
              Contoh: <span className="font-mono text-foreground">12-32-23</span> menjadi <span className="font-mono text-foreground">123223</span>. Referensi RM pada data terkait akan diselaraskan dalam pembaruan yang sama.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => dashedNumbersQuery.refetch()}
            disabled={dashedNumbersQuery.isFetching || isBatchActive}
          >
            <RefreshCw className={dashedNumbersQuery.isFetching ? "mr-2 size-4 animate-spin" : "mr-2 size-4"} />
            Muat ulang
          </Button>
        </div>
      </section>

      <Card>
        <CardHeader className="gap-4 border-b sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Nomor RM dengan tanda hubung</CardTitle>
            <CardDescription>
              {dashedNumbersQuery.isLoading
                ? "Memeriksa data pasien…"
                : `${patients.length} pasien siap diproses. Nomor yang gagal akan dilewati dan masuk ke keranjang gagal.`}
            </CardDescription>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={patients.length === 0 || isBatchActive}
                className="bg-amber-600 text-white hover:bg-amber-700"
              >
                <ArrowRight className="mr-2 size-4" />
                Ganti semua nomor RM
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="size-5 text-amber-500" />
                  Ganti {patients.length} nomor RM?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Semua tanda hubung akan dihapus. Contoh: 12-32-23 menjadi 123223. Referensi nomor RM pada tabel terkait juga akan diperbarui secara bersamaan. Nomor yang berbenturan atau gagal diperbarui akan dilewati dan dicatat di keranjang gagal; nomor lain tetap diproses.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={normalizeAll}
                  disabled={isBatchActive}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {isBatchActive ? "Memproses…" : "Ya, ganti semua"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="max-h-[60vh] overflow-auto rounded-lg border">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-16">No.</TableHead>
                  <TableHead>Pasien</TableHead>
                  <TableHead>Nomor RM saat ini</TableHead>
                  <TableHead>Nomor RM baru</TableHead>
                  <TableHead>Jenis kelamin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashedNumbersQuery.isLoading ? (
                  Array.from({ length: 6 }, (_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-44" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : patients.length > 0 ? (
                  patients.map((patient, index) => (
                    <TableRow key={patient.noRkmMedis}>
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-medium">{patient.namaPasien ?? "-"}</TableCell>
                      <TableCell><code className="rounded bg-amber-500/10 px-2 py-1 text-amber-800 dark:text-amber-300">{patient.noRkmMedis}</code></TableCell>
                      <TableCell><code className="rounded bg-emerald-500/10 px-2 py-1 text-emerald-800 dark:text-emerald-300">{patient.noRkmMedis?.replaceAll("-", "")}</code></TableCell>
                      <TableCell>{patient.jenisKelamin === "L" ? "Laki-laki" : patient.jenisKelamin === "P" ? "Perempuan" : "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      Tidak ada nomor rekam medis yang memakai tanda hubung.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {batchStage !== "idle" ? (
        <Card className="border-amber-500/30">
          <CardContent className="space-y-4 pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {isProcessing ? <LoaderCircle className="size-5 animate-spin text-amber-600" /> : isPaused ? <CirclePause className="size-5 text-amber-600" /> : isStopping || batchStage === "stopped" ? <CircleStop className="size-5 text-destructive" /> : <CheckCircle2 className="size-5 text-emerald-600" />}
                <div>
                  <p className="font-semibold">{isProcessing ? "Tahap pembaruan sedang berjalan" : isPaused ? "Pembaruan dijeda" : isStopping ? "Menghentikan pembaruan" : batchStage === "stopped" ? "Pembaruan dihentikan" : "Tahap pembaruan selesai"}</p>
                  <p className="text-sm text-muted-foreground">
                    {isProcessing && currentNoRkmMedis ? `Memproses ${currentNoRkmMedis}` : isPaused ? "Rekam medis yang sedang berjalan akan selesai, lalu batch menunggu dilanjutkan." : isStopping ? "Rekam medis yang sedang berjalan akan selesai, lalu batch berhenti." : `${successfulCount} berhasil, ${failedPatients.length} gagal.`}
                  </p>
                </div>
              </div>
              <p className="font-mono text-sm text-muted-foreground">{processedCount} / {batchTotal}</p>
            </div>
            <Progress value={progress} className="[&>div]:bg-amber-600" />
            {isBatchActive ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={togglePause} disabled={isStopping}>
                  {isPaused ? <Play className="mr-2 size-4" /> : <Pause className="mr-2 size-4" />}
                  {isPaused ? "Lanjutkan" : "Jeda"}
                </Button>
                <Button variant="destructive" onClick={stopBatch} disabled={isStopping}>
                  <CircleStop className="mr-2 size-4" />
                  {isStopping ? "Menghentikan…" : "Stop pembaruan"}
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {failedPatients.length > 0 ? (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive"><CircleX className="size-5" />Keranjang gagal ({failedPatients.length})</CardTitle>
            <CardDescription>Nomor ini tidak diubah; perbaiki penyebabnya lalu muat ulang untuk mencoba kembali.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto rounded-lg border">
              <Table>
                <TableHeader><TableRow><TableHead>Pasien</TableHead><TableHead>Nomor RM</TableHead><TableHead>Alasan</TableHead></TableRow></TableHeader>
                <TableBody>
                  {failedPatients.map((patient) => (
                    <TableRow key={patient.noRkmMedis}>
                      <TableCell className="font-medium">{patient.namaPasien ?? "-"}</TableCell>
                      <TableCell><code className="rounded bg-destructive/10 px-2 py-1 text-destructive">{patient.noRkmMedis}</code></TableCell>
                      <TableCell className="text-muted-foreground">{patient.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}
