import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CsvUploadProps {
  onImport: (noSepList: string[]) => void;
  isLoading?: boolean;
}

export function CsvUpload({ onImport, isLoading = false }: CsvUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [noSepList, setNoSepList] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCsv = (csvText: string): string[] => {
    const lines = csvText.split("\n");
    const noSepValues: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        // Handle CSV with headers - skip first line if it contains "no_sep" or similar
        if (
          trimmedLine.toLowerCase().includes("no_sep") ||
          trimmedLine.toLowerCase().includes("sep")
        ) {
          continue;
        }

        // Split by comma and take the first column (assuming no_sep is first column)
        const columns = trimmedLine.split(",");
        const noSep = columns[0]?.trim();

        if (noSep && noSep.length > 0) {
          noSepValues.push(noSep);
        }
      }
    }

    return noSepValues;
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
        const parsedNoSepList = parseCsv(csvText);

        if (parsedNoSepList.length === 0) {
          setError("No valid no_sep values found in the CSV file");
          return;
        }

        setNoSepList(parsedNoSepList);
        setSuccess(
          `Successfully parsed ${parsedNoSepList.length} no_sep values from CSV`
        );
      } catch (err) {
        setError("Error parsing CSV file");
        console.error("CSV parsing error:", err);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = () => {
    if (noSepList.length === 0) {
      setError("No no_sep values to import");
      return;
    }

    onImport(noSepList);
  };

  const handleClear = () => {
    setFile(null);
    setNoSepList([]);
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
                ({noSepList.length} no_sep values)
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

        {noSepList.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Preview (first 5 values):</Label>
              <span className="text-sm text-muted-foreground">
                Total: {noSepList.length}
              </span>
            </div>
            <div className="p-3 bg-muted rounded-lg max-h-32 overflow-y-auto">
              <div className="text-sm font-mono space-y-1">
                {noSepList.slice(0, 5).map((noSep, index) => (
                  <div key={index}>{noSep}</div>
                ))}
                {noSepList.length > 5 && (
                  <div className="text-muted-foreground">
                    ... and {noSepList.length - 5} more
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleImport}
          disabled={noSepList.length === 0 || isLoading}
          className="w-full"
        >
          {isLoading ? "Importing..." : `Import ${noSepList.length} Records`}
        </Button>
      </CardContent>
    </Card>
  );
}
