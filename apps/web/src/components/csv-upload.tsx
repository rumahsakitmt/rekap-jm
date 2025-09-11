import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { CsvAnalysis } from "./csv-analysis";

export function CsvUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string>("");
  const [showAnalysis, setShowAnalysis] = useState(false);

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFileMutation = useMutation(
    trpc.csvUpload.uploadFile.mutationOptions()
  );
  const uploadCsvMutation = useMutation(
    trpc.csvUpload.uploadCsv.mutationOptions()
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a CSV file");
      return;
    }

    setFile(selectedFile);
    setUploadedFilename(""); // Reset uploaded filename
    setShowAnalysis(false); // Reset analysis view
    setError("");
    setSuccess("");
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      // Convert file to base64
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const uploadResult = await uploadFileMutation.mutateAsync({
        filename: file.name,
        content: fileContent,
      });

      setUploadedFilename(uploadResult.filename);
      setSuccess(`File uploaded successfully: ${uploadResult.filename}`);

      const processResult = await uploadCsvMutation.mutateAsync({
        filename: uploadResult.filename,
      });

      setSuccess(
        `CSV processed successfully! ${processResult.count} records imported.`
      );
      setShowAnalysis(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error uploading or processing CSV file"
      );
      console.error("CSV upload/process error:", err);
    } finally {
      setUploading(false);
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

        <div className="flex gap-2">
          <Button
            onClick={handleImport}
            className="flex-1"
            disabled={
              !file ||
              uploading ||
              uploadFileMutation.isPending ||
              uploadCsvMutation.isPending
            }
          >
            {uploading ||
            uploadFileMutation.isPending ||
            uploadCsvMutation.isPending
              ? "Processing..."
              : "Import CSV file"}
          </Button>

          {uploadedFilename && (
            <Button
              onClick={() => setShowAnalysis(!showAnalysis)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              {showAnalysis ? "Hide" : "Show"} Analysis
            </Button>
          )}
        </div>

        {showAnalysis && uploadedFilename && (
          <div className="mt-6">
            <CsvAnalysis filename={uploadedFilename} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
