import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/date-picker";
import { Search, FileText } from "lucide-react";
import { useState } from "react";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/klaim/ranap/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    startOfMonth(new Date()),
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    endOfMonth(new Date()),
  );
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");

  const { data, isLoading } = useQuery(
    trpc.klaim.listKlaimRanap.queryOptions({
      dateFrom: dateFrom ?? startOfMonth(new Date()),
      dateTo: dateTo ?? endOfMonth(new Date()),
      keyword: appliedKeyword || undefined,
    }),
  );

  const handleSearch = () => {
    setAppliedKeyword(keyword);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    try {
      return format(new Date(date), "dd/MM/yyyy");
    } catch {
      return date;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Dari</span>
          <DatePicker date={dateFrom} setDate={setDateFrom} />
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Sampai</span>
          <DatePicker date={dateTo} setDate={setDateTo} />
        </div>
        <div className="space-y-1 flex-1 min-w-[200px]">
          <span className="text-xs text-muted-foreground">Keyword</span>
          <div className="flex gap-2">
            <Input
              placeholder="No.SEP / No.RM / Nama / No.Rawat / No.Kartu"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button onClick={handleSearch} size="icon" variant="secondary">
              <Search className="size-4" />
            </Button>
          </div>
        </div>
        <Badge variant="outline" className="h-9 px-3">
          {isLoading ? "..." : `${data?.length ?? 0} record`}
        </Badge>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">SEP</TableHead>
                  <TableHead className="w-[200px]">Pasien</TableHead>
                  <TableHead className="w-[200px]">Dokter</TableHead>
                  <TableHead>Diagnosa Awal</TableHead>
                  <TableHead className="w-[80px] text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : data && data.length > 0 ? (
                  data.map((row) => (
                    <TableRow key={row.noSep}>
                      <TableCell className="text-xs align-top">
                        <div className="space-y-0.5">
                          <div>
                            <span className="text-muted-foreground">
                              Tgl.SEP :{" "}
                            </span>
                            {formatDate(row.tglSep)}
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              No.SEP :{" "}
                            </span>
                            <span className="font-mono">{row.noSep}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              No.Kartu :{" "}
                            </span>
                            <span className="font-mono">{row.noKartu}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs align-top">
                        <div className="space-y-0.5">
                          <div>
                            <span className="text-muted-foreground">
                              No.Rawat :{" "}
                            </span>
                            <span className="font-mono">{row.noRawat}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              No.MR :{" "}
                            </span>
                            <span className="font-mono">{row.nomr}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Nama :{" "}
                            </span>
                            <span className="font-medium">
                              {row.namaPasien}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs align-top">
                        <div className="space-y-0.5">
                          <div className="font-medium">{row.nmDokter}</div>
                          <div>
                            <span className="text-muted-foreground">
                              Status :{" "}
                            </span>
                            {row.jnsPelayanan === "1"
                              ? "Rawat Inap"
                              : "Rawat Jalan"}
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Ruang :{" "}
                            </span>
                            {row.nmPolitujuan}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs align-top">
                        <div className="space-y-0.5">
                          {row.diagAwal ? (
                            <div>
                              <span className="text-muted-foreground">
                                Dx:{" "}
                              </span>
                              <span className="font-mono">{row.diagAwal} - {row.nmDiagnosaAwal}</span>
                            </div>
                          ) : (
                            <div className="text-muted-foreground">Dx: -</div>
                          )}
                          <div className="text-muted-foreground">Px: -</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center align-top">
                        <Link
                          to="/klaim/ranap/$norawat"
                          params={{ norawat: row.noRawat }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                          >
                            <FileText className="size-3 mr-1" />
                            Detail
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
