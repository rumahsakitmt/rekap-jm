import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CsvUploadProps {
  onImport: (csvData: { no_sep: string; tarif: number }[]) => void;
  isLoading?: boolean;
}

export function CsvUpload({ onImport, isLoading = false }: CsvUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<{ no_sep: string; tarif: number }[]>(
    []
  );
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCsv = (csvText: string): { no_sep: string; tarif: number }[] => {
    const lines = csvText.split("\n");
    const csvData: { no_sep: string; tarif: number }[] = [];
    let hasHeader = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        // Handle CSV with headers - skip first line if it contains "no_sep" or similar
        if (
          trimmedLine.toLowerCase().includes("no_sep") ||
          trimmedLine.toLowerCase().includes("sep")
        ) {
          hasHeader = true;
          continue;
        }

        // Split by comma and extract no_sep and tarif
        const columns = trimmedLine.split(",");
        const noSep = columns[0]?.trim();
        const tarifStr = columns[1]?.trim();

        if (noSep && noSep.length > 0) {
          const tarif = tarifStr ? parseFloat(tarifStr) || 0 : 0;
          csvData.push({ no_sep: noSep, tarif });
        }
      }
    }

    return csvData;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a CSV file");
      return;
    }

    setFile(selectedFile);
    setError("");
    setSuccess("");

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const parsedCsvData = parseCsv(csvText);

        if (parsedCsvData.length === 0) {
          setError("No valid no_sep values found in the CSV file");
          return;
        }

        setCsvData(parsedCsvData);
        setSuccess(
          `Successfully parsed ${parsedCsvData.length} records from CSV`
        );
      } catch (err) {
        setError("Error parsing CSV file");
        console.error("CSV parsing error:", err);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = () => {
    if (csvData.length === 0) {
      setError("No data to import");
      return;
    }

    onImport(csvData);
  };

  const handleClear = () => {
    setFile(null);
    setCsvData([]);
    setError("");
    setSuccess("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          CSV Import
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="csv-file">Upload CSV File</Label>
          <div className="flex items-center gap-2">
            <Input
              ref={fileInputRef}
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {file && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                ({csvData.length} records)
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {csvData.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Preview (first 5 records):</Label>
              <span className="text-sm text-muted-foreground">
                Total: {csvData.length}
              </span>
            </div>
            <div className="p-3 bg-muted rounded-lg max-h-32 overflow-y-auto">
              <div className="text-sm font-mono space-y-1">
                {csvData.slice(0, 5).map((record, index) => (
                  <div key={index}>
                    {record.no_sep} - {record.tarif}
                  </div>
                ))}
                {csvData.length > 5 && (
                  <div className="text-muted-foreground">
                    ... and {csvData.length - 5} more
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleImport}
          disabled={csvData.length === 0 || isLoading}
          className="w-full"
        >
          {isLoading ? "Importing..." : `Import ${csvData.length} Records`}
        </Button>
      </CardContent>
    </Card>
  );
}
