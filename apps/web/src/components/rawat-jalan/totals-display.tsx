import { formatCurrency } from "@/lib/utils";
import { useFilterStore } from "@/stores/filter-store";

interface TotalsData {
  totalTarif?: number;
  totalAlokasi?: number;
  totalDpjpUtama?: number;
  totalKonsul?: number;
  totalLaboratorium?: number;
  totalRadiologi?: number;
  totalYangTerbagi?: number;
  averagePercentDariKlaim?: number;
}

interface TotalsDisplayProps {
  totals: TotalsData | null | undefined;
  isCsvMode?: boolean;
}

export function TotalsDisplay({
  totals,
  isCsvMode = false,
}: TotalsDisplayProps) {
  const { selectedCsvFile } = useFilterStore();
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
    <div className="p-2 bg-secondary">
      <div className="grid grid-cols-2 md:grid-cols-9 gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Total Tarif
          </p>
          <p className="text-lg font-semibold">
            {formatValue(totals.totalTarif)}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Total Alokasi
          </p>
          <p className="text-lg font-semibold">
            {formatValue(totals.totalAlokasi)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Total Yang Terbagi
          </p>
          <p className="text-lg font-semibold">
            {formatValue(totals.totalYangTerbagi)}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            DPJP Utama
          </p>
          <p className="text-base font-medium">
            {formatValue(totals.totalDpjpUtama)}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Radiologi</p>
          <p className="text-base font-medium">
            {formatValue(totals.totalRadiologi)}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Laboratorium
          </p>
          <p className="text-base font-medium">
            {formatValue(totals.totalLaboratorium)}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Konsul</p>
          <p className="text-base font-medium">
            {formatValue(totals.totalKonsul)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Yang Terbagi
          </p>
          <p className="text-base font-medium">
            {formatValue(totals.totalYangTerbagi)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
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
