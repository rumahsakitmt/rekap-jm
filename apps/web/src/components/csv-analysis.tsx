import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { FileText, AlertCircle } from "lucide-react";
import { DialogNotFoundSep } from "./rawat-jalan/dialog-not-found-sep";

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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5" />
        File CSV : {data.filename}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 border">
        <div className="bg-muted p-2 text-center">
          <p className="text-2xl font-bold ">{data.stats.totalCsvRecords}</p>
          <p className="text-sm text-muted-foreground">SEP dari CASEMIX</p>
        </div>
        <div className="bg-green-50 p-2 text-center">
          <p className="text-2xl font-bold text-emerald-500 text-center">
            {data.stats.totalFoundInDb}
          </p>
          <p className="text-sm text-muted-foreground">
            SEP ditemukan di SIMRS
          </p>
        </div>

        <div className="bg-red-50 p-2 text-center">
          <DialogNotFoundSep notFoundInDb={data.notFoundInDb} />
        </div>
      </div>
    </div>
  );
}
