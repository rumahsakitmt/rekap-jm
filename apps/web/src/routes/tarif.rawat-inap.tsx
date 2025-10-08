import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { TarifTable } from "@/components/tarif/tarif-table";
import {
  createTarifInapColumns,
  type TarifRawatInapData,
} from "@/components/tarif/column";
import { Skeleton } from "@/components/ui/skeleton";
import { JnsPerawatanInapUploadSheet } from "@/components/tarif/jns-perawatan-inap-upload-sheet";
import { ResetStatusInapDialog } from "@/components/tarif/reset-status-inap-sheet";

export const Route = createFileRoute("/tarif/rawat-inap")({
  component: RouteComponent,
});

function RouteComponent() {
  const tarif = useQuery(trpc.tarif.getTarifRawatInap.queryOptions());
  const columns = createTarifInapColumns();

  if (tarif.isLoading) {
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

  if (tarif.error) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-muted-foreground">
            {tarif.error.message || "Terjadi kesalahan saat memuat data tarif"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Tarif Rawat Inap
          </h1>
          <p className="text-muted-foreground">
            Daftar tarif perawatan rawat inap yang tersedia
          </p>
        </div>

        <div className="flex items-center gap-2">
          <JnsPerawatanInapUploadSheet />
          <ResetStatusInapDialog />
        </div>
      </div>

      <p>{tarif.data?.length} records</p>
      <TarifTable
        columns={columns}
        data={tarif.data as TarifRawatInapData[]}
        loading={tarif.isLoading}
      />
    </div>
  );
}
