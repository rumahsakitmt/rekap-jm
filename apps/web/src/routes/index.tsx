import { createFileRoute } from "@tanstack/react-router";
import { trpc, trpcClient } from "@/utils/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { startOfMonth, endOfMonth } from "date-fns";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/calendar";
import { PerawatanList } from "@/components/perawatan-list";
import { CsvUpload } from "@/components/csv-upload";
import { ImportStatistics } from "@/components/import-statistics";
import { Copy, Check, ChevronUp, ChevronDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState<number | undefined>(50);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(() =>
    startOfMonth(new Date())
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(() =>
    endOfMonth(new Date())
  );
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvStatistics, setCsvStatistics] = useState<{
    totalRequested: number;
    found: number;
    notFound: number;
    notFoundValues: string[];
  } | null>(null);
  const [isCsvMode, setIsCsvMode] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showScrollButtons, setShowScrollButtons] = useState(false);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems((prev) => new Set(prev).add(id));
      setTimeout(() => {
        setCopiedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const rawatJalan = useQuery(
    trpc.regPeriksa.getRegPeriksa.queryOptions({
      search: search || undefined,
      ...(limit && { limit }),
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    })
  );

  const mutation = useMutation({
    ...trpc.regPeriksa.importCsv.mutationOptions(),
    onSuccess: (response) => {
      setCsvData(response.data);
      setCsvStatistics(response.statistics);
      setIsCsvMode(true);
      setIsImporting(false);
    },
    onError: (error) => {
      console.error("Import failed:", error);
      setIsImporting(false);
    },
  });

  const handleCsvImport = async (
    csvData: { no_sep: string; tarif: number }[]
  ) => {
    setIsImporting(true);
    try {
      mutation.mutateAsync({
        csvData,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
    } catch (error) {
      console.error("Import failed:", error);
      setIsImporting(false);
    }
  };

  const handleClearCsv = () => {
    setCsvData([]);
    setCsvStatistics(null);
    setIsCsvMode(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollButtons(scrollTop > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const displayData = isCsvMode ? csvData : rawatJalan.data;

  const totals = displayData?.reduce(
    (acc, row) => {
      const tarif = isCsvMode ? row.tarif_from_csv || 0 : row.biaya_rawat || 0;
      return {
        totalTarif: acc.totalTarif + Number(tarif),
        totalAlokasi: acc.totalAlokasi + Number(row.alokasi || 0),
        totalDpjpUtama: acc.totalDpjpUtama + Number(row.dpjp_utama || 0),
        totalLaboratorium:
          acc.totalLaboratorium + Number(row.laboratorium || 0),
        totalRadiologi: acc.totalRadiologi + Number(row.radiologi || 0),
        totalYangTerbagi: acc.totalYangTerbagi + Number(row.yang_terbagi || 0),
        totalPercentDariKlaim:
          acc.totalPercentDariKlaim + Number(row.percent_dari_klaim || 0),
        count: acc.count + 1,
      };
    },
    {
      totalTarif: 0,
      totalAlokasi: 0,
      totalDpjpUtama: 0,
      totalLaboratorium: 0,
      totalRadiologi: 0,
      totalYangTerbagi: 0,
      totalPercentDariKlaim: 0,
      count: 0,
    }
  ) || {
    totalTarif: 0,
    totalAlokasi: 0,
    totalDpjpUtama: 0,
    totalLaboratorium: 0,
    totalRadiologi: 0,
    totalYangTerbagi: 0,
    totalPercentDariKlaim: 0,
    count: 0,
  };

  const averagePercentDariKlaim =
    totals.count > 0
      ? Math.round(totals.totalPercentDariKlaim / totals.count)
      : 0;

  return (
    <div className="container mx-auto px-4 py-2">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Filter & Search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Search (No Rawat/SEP)
                </label>
                <Input
                  placeholder="Search by no_rawat or no_sep..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Date From</label>
                  <DatePicker date={dateFrom} setDate={setDateFrom} />
                </div>
                <div>
                  <label className="text-sm font-medium">Date To</label>
                  <DatePicker date={dateTo} setDate={setDateTo} />
                </div>
                <div>
                  <label className="text-sm font-medium">Limit</label>
                  <Select
                    value={limit?.toString() || "no-limit"}
                    onValueChange={(value) =>
                      setLimit(value === "no-limit" ? undefined : Number(value))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Limit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="250">250</SelectItem>
                      <SelectItem value="500">500</SelectItem>
                      <SelectItem value="no-limit">No Limit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="self-end"
                  onClick={() => {
                    setSearch("");
                    setLimit(50);
                    setDateFrom(startOfMonth(new Date()));
                    setDateTo(endOfMonth(new Date()));
                    handleClearCsv();
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <CsvUpload onImport={handleCsvImport} isLoading={isImporting} />
        </div>
      </div>

      {isCsvMode && csvStatistics && (
        <ImportStatistics statistics={csvStatistics} />
      )}

      <div className="flex justify-between items-center py-4">
        <div className="flex items-center gap-4">
          {isCsvMode && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                CSV Import Mode
              </span>
              <Button variant="outline" size="sm" onClick={handleClearCsv}>
                Back to Normal View
              </Button>
            </div>
          )}
        </div>
        <p className="text-end">Total data: {displayData?.length || 0}</p>
      </div>
      <Table>
        <TableCaption>Rekap Rawat Jalan</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal Perawatan</TableHead>
            <TableHead>No RM</TableHead>
            <TableHead>No Rawat / No Sep</TableHead>
            <TableHead>Nama Pasien</TableHead>
            <TableHead>Dokter</TableHead>
            <TableHead>Poli</TableHead>
            <TableHead className="text-center">Permintaan Radiologi</TableHead>
            <TableHead className="text-center">Permintaan Lab</TableHead>
            <TableHead className="text-center">Konsul</TableHead>
            <TableHead>Konsul Dokter</TableHead>
            {isCsvMode && (
              <>
                <TableHead className="text-right">Total Tarif</TableHead>
                <TableHead className="text-right">Alokasi</TableHead>
                <TableHead className="text-right">DPJP Utama</TableHead>
                <TableHead className="text-right">Laboratorium</TableHead>
                <TableHead className="text-right">Radiologi</TableHead>
                <TableHead className="text-right">Yang Terbagi</TableHead>
                <TableHead className="text-center">% Dari Klaim</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData?.map((rawatJalan, i) => (
            <TableRow
              key={rawatJalan.no_rawat}
              className={cn(i % 2 !== 0 && "bg-muted")}
            >
              <TableCell>
                {format(
                  new Date(rawatJalan.tgl_perawatan as string),
                  "dd MMM yyyy"
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleCopy(
                      rawatJalan.no_rekam_medis as string,
                      `rekam-medis-${rawatJalan.no_rekam_medis}`
                    );
                  }}
                >
                  {rawatJalan.no_rekam_medis}
                  {copiedItems.has(
                    `rekam-medis-${rawatJalan.no_rekam_medis}`
                  ) ? (
                    <Check size={8} className="ml-1 " />
                  ) : (
                    <Copy size={8} className="ml-1" />
                  )}
                </Button>
              </TableCell>
              <TableCell className="font-medium">
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() =>
                      handleCopy(
                        rawatJalan.no_rawat,
                        `rawat-${rawatJalan.no_rawat}`
                      )
                    }
                  >
                    {rawatJalan.no_rawat}
                    {copiedItems.has(`rawat-${rawatJalan.no_rawat}`) ? (
                      <Check size={8} className="ml-1 " />
                    ) : (
                      <Copy size={8} className="ml-1" />
                    )}
                  </Button>
                  <Separator />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleCopy(rawatJalan.no_sep, `sep-${rawatJalan.no_sep}`)
                    }
                  >
                    {rawatJalan.no_sep}
                    {copiedItems.has(`sep-${rawatJalan.no_sep}`) ? (
                      <Check size={8} className="ml-1 " />
                    ) : (
                      <Copy size={8} className="ml-1" />
                    )}
                  </Button>
                </div>
              </TableCell>
              <TableCell>{rawatJalan.nm_pasien}</TableCell>
              <TableCell>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {rawatJalan.kd_dokter}
                  </p>
                  <p className="font-sm">{rawatJalan.nm_dokter}</p>
                </div>
              </TableCell>
              <TableCell className="uppercase">{rawatJalan.nm_poli}</TableCell>
              <TableCell className="text-center">
                {rawatJalan.total_permintaan_radiologi}
              </TableCell>
              <TableCell className="text-center">
                {rawatJalan.total_permintaan_lab}
              </TableCell>
              <TableCell className="text-center">
                {rawatJalan.konsul_count}
              </TableCell>
              <TableCell>
                <PerawatanList perawatanList={rawatJalan.jns_perawatan || []} />
              </TableCell>

              {isCsvMode && (
                <>
                  <TableCell className="text-right font-mono">
                    {rawatJalan.tarif_from_csv
                      ? new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(rawatJalan.tarif_from_csv)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {rawatJalan.alokasi
                      ? new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(rawatJalan.alokasi)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {rawatJalan.dpjp_utama
                      ? new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(rawatJalan.dpjp_utama)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {rawatJalan.laboratorium
                      ? new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(rawatJalan.laboratorium)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {rawatJalan.radiologi
                      ? new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(rawatJalan.radiologi)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {rawatJalan.yang_terbagi
                      ? new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(rawatJalan.yang_terbagi)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {rawatJalan.percent_dari_klaim !== undefined
                      ? `${rawatJalan.percent_dari_klaim}%`
                      : "-"}
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
          {isCsvMode && (
            <TableRow className="bg-muted font-semibold">
              <TableCell colSpan={6} className="text-right font-bold">
                TOTAL
              </TableCell>
              <TableCell className="text-center font-mono">
                {displayData?.reduce(
                  (sum, row) =>
                    sum + Number(row.total_permintaan_radiologi || 0),
                  0
                )}
              </TableCell>
              <TableCell className="text-center font-mono">
                {displayData?.reduce(
                  (sum, row) => sum + Number(row.total_permintaan_lab || 0),
                  0
                )}
              </TableCell>
              <TableCell className="text-center font-mono">
                {displayData?.reduce(
                  (sum, row) => sum + Number(row.konsul_count || 0),
                  0
                )}
              </TableCell>
              <TableCell></TableCell>
              <TableCell className="text-right font-mono">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(totals.totalTarif)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(totals.totalAlokasi)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(totals.totalDpjpUtama)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(totals.totalLaboratorium)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(totals.totalRadiologi)}
              </TableCell>

              <TableCell className="text-right font-mono">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(totals.totalYangTerbagi)}
              </TableCell>
              <TableCell className="text-center font-mono">
                {averagePercentDariKlaim}%
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {showScrollButtons && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
          <Button
            onClick={scrollToTop}
            size="sm"
            className="rounded-full w-12 h-12 shadow-lg"
            variant="outline"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            onClick={scrollToBottom}
            size="sm"
            className="rounded-full w-12 h-12 shadow-lg"
            variant="outline"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
