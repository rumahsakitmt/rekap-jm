import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BillingRow } from "./billing-row";
import { formatCurrency } from "./constants";

const leftFields = [
  { key: "prosedurNonBedah", label: "Prosedur Non Bedah" },
  { key: "prosedurBedah", label: "Prosedur Bedah" },
  { key: "konsultasi", label: "Konsultasi" },
  { key: "tenagaAhli", label: "Tenaga Ahli" },
  { key: "keperawatan", label: "Keperawatan" },
  { key: "penunjang", label: "Penunjang" },
  { key: "radiologi", label: "Radiologi" },
  { key: "laboratorium", label: "Laboratorium" },
  { key: "pelayananDarah", label: "Pelayanan Darah" },
] as const;

const rightFields = [
  { key: "rehabilitasi", label: "Rehabilitasi" },
  { key: "kamar", label: "Kamar" },
  { key: "rawatIntensif", label: "Rawat Intensif" },
  { key: "obat", label: "Obat" },
  { key: "obatKronis", label: "Obat Kronis" },
  { key: "obatKemoterapi", label: "Obat Kemoterapi" },
  { key: "alkes", label: "Alkes" },
  { key: "bmhp", label: "BMHP" },
  { key: "sewaAlat", label: "Sewa Alat" },
  { key: "tarifPoliEks", label: "Tarif Poli Eksekutif" },
] as const;

export function BillingCard({ billing }: { billing: Record<string, number> }) {
  const totalBilling = Object.values(billing).reduce(
    (sum, val) => sum + val,
    0,
  );

  return (
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
            {leftFields.map((f) => (
              <BillingRow key={f.key} label={f.label} value={billing[f.key]} />
            ))}
          </div>
          <div>
            {rightFields.map((f) => (
              <BillingRow key={f.key} label={f.label} value={billing[f.key]} />
            ))}
          </div>
        </div>
        <Separator className="my-3" />
        <div className="flex justify-between text-sm font-semibold">
          <span>Total Biaya</span>
          <span className="tabular-nums">{formatCurrency(totalBilling)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
