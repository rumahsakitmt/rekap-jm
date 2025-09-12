interface Perawatan {
  kd_jenis_prw: string;
  nm_perawatan: string;
  nm_dokter: string;
}

interface PerawatanListProps {
  perawatanList: Perawatan[];
}

export function PerawatanList({ perawatanList }: PerawatanListProps) {
  if (!perawatanList || perawatanList.length === 0) {
    return <span>-</span>;
  }

  return (
    <div className="space-y-1">
      {perawatanList.map((perawatan) => {
        return (
          <div key={perawatan.kd_jenis_prw} className="p-2 max-w-[500px]">
            <div className="mt-1 text-sm whitespace-normal text-primary">
              {perawatan.nm_perawatan}
            </div>
            <span className="text-xs text-primary">{perawatan.nm_dokter}</span>
          </div>
        );
      })}
    </div>
  );
}
