import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { TarifTable } from "@/components/tarif/tarif-table";
import {
  createTarifColumns,
  type TarifRawatJalanData,
} from "@/components/tarif/column";
import { Skeleton } from "@/components/ui/skeleton";
import { JnsPerawatanUploadSheet } from "@/components/tarif/jns-perawatan-upload-sheet";
import { ResetStatusDialog } from "@/components/tarif/reset-status-sheet";
import { Footprints } from "lucide-react";

export const Route = createFileRoute("/tarif/rawat-jalan")({
  component: RouteComponent,
});

function RouteComponent() {
  const tarif = useQuery(trpc.tarif.getTarifRawatJalan.queryOptions());
  const columns = createTarifColumns();

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
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Footprints />
            <h1 className="text-3xl tracking-tight uppercase">
              Tarif Rawat Jalan
            </h1>
          </div>
          <p className="text-muted-foreground">
            Daftar tarif perawatan rawat jalan yang tersedia
          </p>
        </div>

        <div className="flex items-center gap-2">
          <JnsPerawatanUploadSheet />
          <ResetStatusDialog />
        </div>
      </div>

      <TarifTable
        columns={columns}
        data={tarif.data as TarifRawatJalanData[]}
        loading={tarif.isLoading}
      />
    </div>
  );
}
