import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { DataTablePagination } from "@/components/rawat-jalan/pagination";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/date-picker";
import { Search, FileText } from "lucide-react";
import { useState } from "react";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const claimSearchSchema = z.object({
  page: z.number().catch(1).optional(),
  limit: z.number().catch(50).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  keyword: z.string().optional(),
});

export const Route = createFileRoute("/klaim/ranap/")({
  validateSearch: claimSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const page = search.page || 1;
  const limit = search.limit || 50;

  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    search.dateFrom ? new Date(search.dateFrom) : startOfMonth(new Date()),
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    search.dateTo ? new Date(search.dateTo) : endOfMonth(new Date()),
  );
  const [keyword, setKeyword] = useState(search.keyword || "");

  const { data, isLoading } = useQuery(
    trpc.klaim.listKlaimRanap.queryOptions({
      dateFrom: search.dateFrom ? new Date(search.dateFrom) : startOfMonth(new Date()),
      dateTo: search.dateTo ? new Date(search.dateTo) : endOfMonth(new Date()),
      keyword: search.keyword || undefined,
      page,
      limit,
    }),
  );

  const handleSearch = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: 1,
        dateFrom: dateFrom ? format(dateFrom, "yyyy-MM-dd") : undefined,
        dateTo: dateTo ? format(dateTo, "yyyy-MM-dd") : undefined,
        keyword: keyword || undefined,
      }),
    });
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
          {isLoading ? "..." : `${data?.pagination.total ?? 0} record`}
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
                  <TableHead >Pasien</TableHead>
                  <TableHead className="w-[200px]">Dokter</TableHead>
                  <TableHead className="w-[200px]">Diagnosa / Prosedur</TableHead>
                  <TableHead className="w-[80px] text-center">Status</TableHead>
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
                      <TableCell>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : data?.data && data.data.length > 0 ? (
                  data.data.map((row) => (
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
                          {row.allDiagnosa || row.diagAwal ? (
                            <div>
                              <span className="text-muted-foreground">
                                Dx:{" "}
                              </span>
                              <span className="font-mono">{row.allDiagnosa || row.diagAwal} </span>
                            </div>
                          ) : (
                            <div className="text-muted-foreground">Dx: -</div>
                          )}
                          {row.allProsedur ? (
                            <div>
                              <span className="text-muted-foreground">
                                Px:{" "}
                              </span>
                              <span className="font-mono">{row.allProsedur} </span>
                            </div>
                          ) : (
                            <div className="text-muted-foreground">Px: -</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center align-top">
                        {row.isKlaimed ? (
                          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                            Terklaim
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Belum</Badge>
                        )}
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
                      colSpan={6}
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
      {data?.pagination && (
        <DataTablePagination
          pagination={data.pagination}
          from="/klaim/ranap/"
        />
      )}
    </div>
  );
}
