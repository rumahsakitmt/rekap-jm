import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";
import { format } from "date-fns";

interface CsvAnalysisProps {
  filename: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export function CsvAnalysis({ filename, dateFrom, dateTo }: CsvAnalysisProps) {
  const analysis = useQuery({
    ...trpc.csvUpload.analyzeCsv.queryOptions({
      filename,
      dateFrom,
      dateTo,
    }),
    enabled: !!filename,
  });

  if (analysis.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Analyzing CSV File...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading analysis...</div>
        </CardContent>
      </Card>
    );
  }

  if (analysis.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Analysis Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to analyze CSV file: {analysis.error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const data = analysis.data!;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          CSV Analysis: {data.filename}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Total CSV Records</p>
                  <p className="text-2xl font-bold">
                    {data.stats.totalCsvRecords}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Found in Database</p>
                  <p className="text-2xl font-bold">
                    {data.stats.totalFoundInDb}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-sm font-medium">Not Found in DB</p>
                  <p className="text-2xl font-bold">
                    {data.stats.totalNotFoundInDb}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">In DB, Not in CSV</p>
                  <p className="text-2xl font-bold">
                    {data.stats.totalInDbNotInCsv}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Tarif in CSV
                </p>
                <p className="text-xl font-bold">
                  Rp {data.stats.totalTarifInCsv.toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Average Tarif
                </p>
                <p className="text-xl font-bold">
                  Rp{" "}
                  {Math.round(data.stats.averageTarifInCsv).toLocaleString(
                    "id-ID"
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Analysis Tabs */}
        <Tabs defaultValue="not-found" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="not-found">
              Not Found in DB ({data.stats.totalNotFoundInDb})
            </TabsTrigger>
            <TabsTrigger value="found">
              Found in DB ({data.stats.totalFoundInDb})
            </TabsTrigger>
            <TabsTrigger value="not-in-csv">
              In DB, Not in CSV ({data.stats.totalInDbNotInCsv})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="not-found" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  SEPs Not Found in Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.notFoundInDb.length === 0 ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      All SEPs from CSV are found in the database!
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 mb-4">
                      These SEP numbers exist in the CSV but are not found in
                      the database:
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>No SEP</TableHead>
                          <TableHead>Tarif</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.notFoundInDb.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono">
                              {item.no_sep}
                            </TableCell>
                            <TableCell>
                              Rp {item.tarif.toLocaleString("id-ID")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="found" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  SEPs Found in Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.foundInDb.length === 0 ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No SEPs from CSV were found in the database!
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 mb-4">
                      These SEP numbers from CSV are found in the database:
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>No SEP</TableHead>
                          <TableHead>Nama Pasien</TableHead>
                          <TableHead>Tgl SEP</TableHead>
                          <TableHead>PPK Pelayanan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.foundInDb.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono">
                              {item.no_sep}
                            </TableCell>
                            <TableCell>{item.nama_pasien}</TableCell>
                            <TableCell>
                              {item.tglsep
                                ? format(new Date(item.tglsep), "dd/MM/yyyy")
                                : "-"}
                            </TableCell>
                            <TableCell>{item.nmppkpelayanan}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="not-in-csv" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-500" />
                  SEPs in Database, Not in CSV
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.notInCsv.length === 0 ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      All SEPs in the database are included in the CSV!
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 mb-4">
                      These SEP numbers exist in the database but are not in the
                      CSV:
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>No SEP</TableHead>
                          <TableHead>Nama Pasien</TableHead>
                          <TableHead>Tgl SEP</TableHead>
                          <TableHead>PPK Pelayanan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.notInCsv.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono">
                              {item.no_sep}
                            </TableCell>
                            <TableCell>{item.nama_pasien}</TableCell>
                            <TableCell>
                              {item.tglsep
                                ? format(new Date(item.tglsep), "dd/MM/yyyy")
                                : "-"}
                            </TableCell>
                            <TableCell>{item.nmppkpelayanan}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
