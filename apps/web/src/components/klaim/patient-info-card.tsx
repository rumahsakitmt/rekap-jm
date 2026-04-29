import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoRow } from "./info-row";

export function PatientInfoCard({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Informasi Pasien</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        <InfoRow label="No. Rawat" value={data.noRawat} />
        <InfoRow label="No. RM" value={data.noRkmMedis} />
        <InfoRow
          label="Nama Pasien"
          value={`${data.nmPasien}, ${data.umurdaftar} ${data.sttsumur}`}
        />
        <InfoRow label="Jenis Kelamin" value={data.jk} />
        <InfoRow label="Tgl. Lahir" value={data.tglLahir} />
        <InfoRow label="Alamat" value={data.almtPj} />
        <InfoRow label="Tgl. Registrasi" value={data.tglRegistrasi} />
        <InfoRow label="Poliklinik" value={data.nmPoli} />
        <InfoRow label="Dokter" value={data.nmDokter} />
        <InfoRow
          label="Status"
          value={`${data.statusLanjut} (${data.pngJawab})`}
        />
      </CardContent>
    </Card>
  );
}
