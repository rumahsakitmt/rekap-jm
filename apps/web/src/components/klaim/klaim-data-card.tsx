import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoRow } from "./info-row";
import { caraMasukLabels, upgradeClassLabels } from "./constants";

export function KlaimDataCard({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Data Klaim</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        <InfoRow label="No. SEP" value={data.nosep} />
        <InfoRow label="No. Kartu" value={data.noKartu} />
        <InfoRow
          label="Cara Masuk"
          value={caraMasukLabels[data.caraMasuk] || data.caraMasuk}
        />
        <InfoRow label="Tgl. Keluar" value={data.tglKeluar} />
        <InfoRow
          label="Kelas Rawat"
          value={data.klsRawat ? `Kelas ${data.klsRawat}` : "-"}
        />
        <InfoRow
          label="Jenis Rawat"
          value={data.jnsRawat === "1" ? "Rawat Inap" : "Rawat Jalan"}
        />
        <InfoRow label="Sistole" value={data.sistole} />
        <InfoRow label="Diastole" value={data.diastole} />
        <InfoRow label="Status Pulang" value={data.dischargeStatusLabel} />
        <InfoRow
          label="Indikator Upgrade Kelas"
          value={data.upgradeClassInd === "1" ? "Ya" : "Tidak"}
        />
        {data.upgradeClassInd === "1" && (
          <InfoRow
            label="Naik ke Kelas"
            value={
              upgradeClassLabels[data.upgradeClassClass] ||
              data.upgradeClassClass
            }
          />
        )}
        <InfoRow label="Berat Saat Lahir" value={data.birthWeight || "-"} />
      </CardContent>
    </Card>
  );
}
