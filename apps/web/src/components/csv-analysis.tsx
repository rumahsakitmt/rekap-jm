import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  AlertCircle,
  ChevronRight,
  ChevronsLeftRight,
  ChevronsLeftRightEllipsis,
  SearchCheck,
} from "lucide-react";
import { DialogNotFoundSep } from "./rawat-jalan/dialog-not-found-sep";
import { Button } from "./ui/button";

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
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <Skeleton className="h-5 w-32" />
        </div>
        <ChevronsLeftRightEllipsis />
        <Button variant="ghost" disabled>
          <SearchCheck />
          <Skeleton className="h-6 w-8" />
        </Button>
      </div>
    );
  }

  if (analysis.error) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <span className="text-red-600">Error analyzing CSV</span>
        </div>
        <ChevronsLeftRightEllipsis />
        <Button variant="ghost" disabled>
          <AlertCircle className="h-4 w-4" />
          <span className="text-red-600">Error</span>
        </Button>
      </div>
    );
  }

  const data = analysis.data!;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5" />
        File CSV : {data.filename}
      </div>
      <ChevronsLeftRightEllipsis />

      <Button variant="ghost">
        <SearchCheck />
        <p className="text-2xl font-bold ">{data.stats.totalFoundInDb}</p>
      </Button>

      {data.stats.totalNotFoundInDb > 0 && (
        <DialogNotFoundSep notFoundInDb={data.notFoundInDb} />
      )}
    </div>
  );
}
