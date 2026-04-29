import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  DiagnosaCombobox,
  ProsedurCombobox,
} from "@/components/klaim/diagnosa-combobox";
import { useKlaimRanapStore } from "@/stores/klaim-ranap-store";

export function DiagnosaProsedurCard({ noRawat }: { noRawat: string }) {
  const {
    diagnosaIdrg,
    prosedurIdrg,
    diagnosaInacbg,
    prosedurInacbg,
    diagnosaStatuses,
    prosedurStatuses,
    setDiagnosaIdrg,
    setProsedurIdrg,
    setDiagnosaInacbg,
    setProsedurInacbg,
    setDiagnosaStatus,
    setProsedurStatus,
  } = useKlaimRanapStore();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Diagnosa & Prosedur</CardTitle>
        <CardDescription>
          Klik untuk mencari dan memilih diagnosa/prosedur
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Diagnosa INACBG</Label>
            <DiagnosaCombobox
              value={diagnosaInacbg}
              onChange={setDiagnosaInacbg}
              placeholder="Cari diagnosa INACBG..."
              inacbgOnly={true}
              noRawat={noRawat}
              statuses={diagnosaStatuses}
              onStatusChange={setDiagnosaStatus}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Prosedur INACBG</Label>
            <ProsedurCombobox
              value={prosedurInacbg}
              onChange={setProsedurInacbg}
              placeholder="Cari prosedur INACBG..."
              inacbgOnly={true}
              noRawat={noRawat}
              statuses={prosedurStatuses}
              onStatusChange={setProsedurStatus}
            />
          </div>
        </div>

        <Separator />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Diagnosa IDRG</Label>
            <DiagnosaCombobox
              value={diagnosaIdrg}
              onChange={setDiagnosaIdrg}
              placeholder="Cari diagnosa IDRG..."
              inacbgOnly={false}
              noRawat={noRawat}
              statuses={diagnosaStatuses}
              onStatusChange={setDiagnosaStatus}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Prosedur IDRG</Label>
            <ProsedurCombobox
              value={prosedurIdrg}
              onChange={setProsedurIdrg}
              placeholder="Cari prosedur IDRG..."
              inacbgOnly={false}
              noRawat={noRawat}
              statuses={prosedurStatuses}
              onStatusChange={setProsedurStatus}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
