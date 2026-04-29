import { formatCurrency } from "./constants";

export function BillingRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{formatCurrency(value)}</span>
    </div>
  );
}
