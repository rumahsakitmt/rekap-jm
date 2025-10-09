import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { TarifTable } from "@/components/tarif/tarif-table";
import {
  createTarifLabColumns,
  type TarifLabData,
} from "@/components/tarif/column";
import { Skeleton } from "@/components/ui/skeleton";
import { JnsPerawatanLabUploadSheet } from "@/components/tarif/jns-perawatan-lab-upload-sheet";
import { ResetStatusLabDialog } from "@/components/tarif/reset-status-lab-sheet";
import { FlaskConical } from "lucide-react";

export const Route = createFileRoute("/tarif/lab")({
  component: RouteComponent,
});

function RouteComponent() {
  const tarif = useQuery(trpc.tarif.getTarifLab.queryOptions());
  const columns = createTarifLabColumns();

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
            <FlaskConical />
            <h1 className="text-3xl tracking-tight uppercase">Tarif Lab</h1>
          </div>
          <p className="text-muted-foreground">
            Daftar tarif perawatan laboratorium yang tersedia
          </p>
        </div>

        <div className="flex items-center gap-2">
          <JnsPerawatanLabUploadSheet />
          <ResetStatusLabDialog />
        </div>
      </div>

      <TarifTable
        columns={columns}
        data={tarif.data as TarifLabData[]}
        loading={tarif.isLoading}
      />
    </div>
  );
}
