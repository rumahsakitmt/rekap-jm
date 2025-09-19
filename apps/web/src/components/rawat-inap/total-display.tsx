import { formatCurrency } from "@/lib/utils";
import { getRouteApi } from "@tanstack/react-router";

interface TotalsData {
  totalTarif?: number;
  totalAlokasi?: number;
  totalDpjpRanap?: number;
  totalRemunDpjp?: number;
  totalRemunKonsulAnestesi?: number;
  totalRemunKonsul1?: number;
  totalRemunKonsul2?: number;
  totalRemunDokterUmum?: number;
  totalRemunLab?: number;
  totalRemunRadiologi?: number;
  totalRemunOperator?: number;
  totalRemunAnestesi?: number;
  totalYangTerbagi?: number;
  averagePercentDariKlaim?: number;
}

interface TotalDisplayProps {
  totals: TotalsData | null | undefined;
  from: "/rawat-inap" | "/";
}

export function TotalDisplay({ totals, from }: TotalDisplayProps) {
  const route = getRouteApi(from);
  const { selectedCsvFile } = route.useSearch();
  if (!totals || selectedCsvFile === "") return null;

  const formatValue = (value: number | undefined) => {
    if (value === undefined || value === null) return "0";
    return formatCurrency(value);
  };

  const formatPercentage = (value: number | undefined) => {
    if (value === undefined || value === null) return "0%";
    return `${value}%`;
  };

  return (
    <div className="p-2 bg-secondary overflow-x-auto">
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Total Tarif
          </p>
          <p className="text-lg font-semibold">
            {formatValue(totals.totalTarif)}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Total Alokasi
          </p>
          <p className="text-lg font-semibold">
            {formatValue(totals.totalAlokasi)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Total DPJP Ranap
          </p>
          <p className="text-lg font-semibold">
            {formatValue(totals.totalDpjpRanap)}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Total Remun DPJP
          </p>
          <p className="text-base font-medium">
            {formatValue(totals.totalRemunDpjp)}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Total Remun Konsul Anestesi
          </p>
          <p className="text-base font-medium">
            {formatValue(totals.totalRemunKonsulAnestesi)}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Total Remun Konsul 1
          </p>
          <p className="text-base font-medium">
            {formatValue(totals.totalRemunKonsul1)}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Total Remun Konsul 2
          </p>
          <p className="text-base font-medium">
            {formatValue(totals.totalRemunKonsul2)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Total Remun Dokter Umum
          </p>
          <p className="text-base font-medium">
            {formatValue(totals.totalRemunDokterUmum)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Total Remun Lab
          </p>
          <p className="text-base font-medium">
            {formatValue(totals.totalRemunLab)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Total Remun Radiologi
          </p>
          <p className="text-base font-medium">
            {formatValue(totals.totalRemunRadiologi)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Total Remun Operator
          </p>
          <p className="text-lg font-semibold">
            {formatValue(totals.totalRemunOperator)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Total Remun Anestesi
          </p>
          <p className="text-lg font-semibold">
            {formatValue(totals.totalRemunAnestesi)}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Total Yang Terbagi
          </p>
          <p className="text-lg font-semibold">
            {formatValue(totals.totalYangTerbagi)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Avg % dari Klaim
          </p>
          <p className="text-lg font-semibold">
            {formatPercentage(totals.averagePercentDariKlaim)}
          </p>
        </div>
      </div>
    </div>
  );
}
