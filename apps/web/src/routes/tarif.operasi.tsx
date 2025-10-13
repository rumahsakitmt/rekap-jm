import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { TarifTable } from "@/components/tarif/tarif-table";
import {
  createPaketOperasiColumns,
  type PaketOperasiData,
} from "@/components/tarif/column";
import { Skeleton } from "@/components/ui/skeleton";
import { PaketOperasiUploadSheet } from "@/components/tarif/paket-operasi-upload-sheet";
import { ResetStatusOperasiDialog } from "@/components/tarif/reset-status-operasi-sheet";
import { Stethoscope } from "lucide-react";

export const Route = createFileRoute("/tarif/operasi")({
  component: RouteComponent,
});

function RouteComponent() {
  const paketOperasi = useQuery(trpc.tarif.getPaketOperasi.queryOptions());
  const columns = createPaketOperasiColumns();

  if (paketOperasi.isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <TarifTable columns={columns} data={[]} loading={true} />
      </div>
    );
  }

  if (paketOperasi.error) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-muted-foreground">
            {paketOperasi.error.message ||
              "Terjadi kesalahan saat memuat data paket operasi"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Stethoscope />
            <h1 className="text-3xl tracking-tight uppercase">
              Tarif Paket Operasi
            </h1>
          </div>
          <p className="text-muted-foreground">
            Daftar tarif paket operasi yang tersedia
          </p>
        </div>

        <div className="flex items-center gap-2">
          <PaketOperasiUploadSheet />
          <ResetStatusOperasiDialog />
        </div>
      </div>

      <TarifTable
        columns={columns}
        data={paketOperasi.data as PaketOperasiData[]}
        loading={paketOperasi.isLoading}
      />
    </div>
  );
}
