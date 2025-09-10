import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
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
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/calendar";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(50);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(() =>
    startOfMonth(new Date())
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(() =>
    endOfMonth(new Date())
  );

  const rawatJalan = useQuery(
    trpc.rawatJalan.getRawatJalan.queryOptions({
      search: search || undefined,
      limit,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    })
  );

  return (
    <div className="container mx-auto px-4 py-2">
      <h2 className="mb-4 font-medium">Rawat Jalan</h2>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                value={limit.toString()}
                onValueChange={(value) => setLimit(Number(value))}
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
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={() => {
              setSearch("");
              setLimit(50);
              const now = new Date();
              setDateFrom(new Date(now.getFullYear(), now.getMonth(), 1));
              setDateTo(new Date(now.getFullYear(), now.getMonth() + 1, 0));
            }}
            variant="outline"
          >
            Clear Filters
          </Button>
        </CardContent>
      </Card>

      <Table>
        <TableCaption>Rekap Rawat Jalan</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">No Rawat/Sep</TableHead>
            <TableHead>Dokter</TableHead>
            <TableHead>Tanggal Perawatan</TableHead>
            <TableHead>Permintaan Radiologi</TableHead>
            <TableHead>Permintaan Lab</TableHead>
            <TableHead>Perawatan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rawatJalan.data?.map((rawatJalan) => (
            <TableRow key={rawatJalan.no_rawat}>
              <TableCell className="font-medium">
                <div>
                  <div className="text-xs text-muted-foreground">
                    {rawatJalan.no_rawat}
                  </div>
                  {rawatJalan.no_sep}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {rawatJalan.kd_dokter}
                  </p>
                  <p>{rawatJalan.nm_dokter}</p>
                </div>
              </TableCell>
              <TableCell>
                {format(
                  new Date(rawatJalan.tgl_perawatan as string),
                  "dd/MM/yyyy"
                )}
              </TableCell>
              <TableCell>{rawatJalan.total_permintaan_radiologi}</TableCell>
              <TableCell>{rawatJalan.total_permintaan_lab}</TableCell>
              <TableCell>
                <div className="space-y-2">
                  {rawatJalan.jns_perawatan?.map((perawatan) => (
                    <div key={perawatan.kd_jenis_prw}>
                      <span className="text-xs text-muted-foreground">
                        {perawatan.kd_jenis_prw}
                      </span>
                      <div>{perawatan.nm_perawatan}</div>
                    </div>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
