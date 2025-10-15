import { useState, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Database,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Papa from "papaparse";
import { queryClient, trpc } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";

interface PaketOperasiData {
  kodePaket: string;
  nmPerawatan: string;
  kategori: string;
  operator1: number;
  operator2: number;
  operator3: number;
  asistenOperator1: number;
  asistenOperator2: number;
  asistenOperator3: number;
  instrumen: number;
  dokterAnak: number;
  perawaatResusitas: number;
  dokterAnestesi: number;
  asistenAnestesi: number;
  asistenAnestesi2: number;
  bidan: number;
  bidan2: number;
  bidan3: number;
  perawatLuar: number;
  sewaOk: number;
  alat: number;
  akomodasi: number;
  bagianRs: number;
  omloop: number;
  omloop2: number;
  omloop3: number;
  omloop4: number;
  omloop5: number;
  sarpras: number;
  dokterPjanak: number;
  dokterUmum: number;
  kdPj: string;
  status: string;
  kelas: string;
}

export const PaketOperasiUploadSheet = () => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<PaketOperasiData[]>([]);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [inserting, setInserting] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    success: 0,
    errors: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const insertPaketOperasiMutation = useMutation({
    ...trpc.tarif.insertPaketOperasi.mutationOptions(),
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a CSV file");
      return;
    }

    setFile(selectedFile);
    setParsedData([]);
    setShowAnalysis(false);
    setError("");
    setSuccess("");
  };

  const handleParseCSV = () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          // Validate and transform the data
          const transformedData = results.data.map((row: any) => ({
            kodePaket: String(row.kodePaket || row.kode_paket || ""),
            nmPerawatan: String(row.nmPerawatan || row.nm_perawatan || ""),
            kategori: String(row.kategori || ""),
            operator1: parseFloat(row.operator1 || row.operator_1 || 0),
            operator2: parseFloat(row.operator2 || row.operator_2 || 0),
            operator3: parseFloat(row.operator3 || row.operator_3 || 0),
            asistenOperator1: parseFloat(
              row.asistenOperator1 || row.asisten_operator1 || 0
            ),
            asistenOperator2: parseFloat(
              row.asistenOperator2 || row.asisten_operator2 || 0
            ),
            asistenOperator3: parseFloat(
              row.asistenOperator3 || row.asisten_operator3 || 0
            ),
            instrumen: parseFloat(row.instrumen || 0),
            dokterAnak: parseFloat(row.dokterAnak || row.dokter_anak || 0),
            perawaatResusitas: parseFloat(
              row.perawaatResusitas || row.perawaat_resusitas || 0
            ),
            dokterAnestesi: parseFloat(
              row.dokterAnestesi || row.dokter_anestesi || 0
            ),
            asistenAnestesi: parseFloat(
              row.asistenAnestesi || row.asisten_anestesi || 0
            ),
            asistenAnestesi2: parseFloat(
              row.asistenAnestesi2 || row.asisten_anestesi2 || 0
            ),
            bidan: parseFloat(row.bidan || 0),
            bidan2: parseFloat(row.bidan2 || 0),
            bidan3: parseFloat(row.bidan3 || 0),
            perawatLuar: parseFloat(row.perawatLuar || row.perawat_luar || 0),
            sewaOk: parseFloat(row.sewaOk || row.sewa_ok || 0),
            alat: parseFloat(row.alat || 0),
            akomodasi: parseFloat(row.akomodasi || 0),
            bagianRs: parseFloat(row.bagianRs || row.bagian_rs || 0),
            omloop: parseFloat(row.omloop || 0),
            omloop2: parseFloat(row.omloop2 || 0),
            omloop3: parseFloat(row.omloop3 || 0),
            omloop4: parseFloat(row.omloop4 || 0),
            omloop5: parseFloat(row.omloop5 || 0),
            sarpras: parseFloat(row.sarpras || 0),
            dokterPjanak: parseFloat(
              row.dokterPjanak || row.dokter_pjanak || 0
            ),
            dokterUmum: parseFloat(row.dokterUmum || row.dokter_umum || 0),
            kdPj: String(row.kdPj || row.kd_pj || ""),
            status: String(row.status || "1"),
            kelas: String(row.kelas || ""),
          }));

          setParsedData(transformedData);
          setSuccess(
            `CSV parsed successfully! ${transformedData.length} records found.`
          );
          setShowAnalysis(true);
        } catch (err) {
          setError("Error parsing CSV file. Please check the format.");
          console.error("CSV parsing error:", err);
        } finally {
          setUploading(false);
        }
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`);
        setUploading(false);
      },
    });
  };

  const handleInsertData = async () => {
    if (parsedData.length === 0) {
      setError("No data to insert. Please parse CSV file first.");
      return;
    }

    setInserting(true);
    setShowProgressDialog(true);
    setError("");
    setSuccess("");
    setProgress({
      current: 0,
      total: parsedData.length,
      success: 0,
      errors: 0,
    });

    try {
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < parsedData.length; i++) {
        const data = parsedData[i];
        try {
          await insertPaketOperasiMutation.mutateAsync(data);
          successCount++;
        } catch (err) {
          console.error("Error inserting record:", err);
          errorCount++;
        }

        // Update progress
        setProgress({
          current: i + 1,
          total: parsedData.length,
          success: successCount,
          errors: errorCount,
        });
      }

      if (errorCount === 0) {
        setSuccess(
          `Successfully inserted ${successCount} records into database!`
        );
        // Only invalidate queries if all operations were successful
        queryClient.invalidateQueries({
          queryKey: trpc.tarif.getPaketOperasi.queryKey(),
        });
        handleUploadSuccess();
      } else {
        setError(
          `Inserted ${successCount} records successfully, ${errorCount} failed.`
        );
      }
    } catch (err) {
      setError("Error inserting data into database. Please try again.");
      console.error("Insert error:", err);
    } finally {
      setInserting(false);
      setShowProgressDialog(false);
    }
  };

  const handleUploadSuccess = () => {
    setOpen(false);
    setFile(null);
    setParsedData([]);
    setShowAnalysis(false);
    setError("");
    setSuccess("");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Paket Operasi CSV
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Upload Paket Operasi CSV</SheetTitle>
          <SheetDescription>
            Upload a CSV file with paket operasi data to import into the system.
          </SheetDescription>
        </SheetHeader>

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            CSV Import
          </div>

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
              onClick={handleParseCSV}
              className="flex-1"
              disabled={!file || uploading}
            >
              {uploading ? "Parsing..." : "Parse CSV file"}
            </Button>

            {parsedData.length > 0 && (
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

          {parsedData.length > 0 && (
            <div className="flex gap-2">
              <Button
                onClick={handleInsertData}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={inserting}
              >
                <Database className="h-4 w-4 mr-2" />
                {inserting
                  ? "Inserting..."
                  : `Insert ${parsedData.length} Records`}
              </Button>
            </div>
          )}

          {showAnalysis && parsedData.length > 0 && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-2">CSV Analysis</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Total Records:</strong> {parsedData.length}
                </p>
                <p>
                  <strong>Sample Data:</strong>
                </p>
                <div className="max-h-40 overflow-y-auto">
                  <pre className="text-xs bg-background p-2 rounded border">
                    {JSON.stringify(parsedData.slice(0, 3), null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>

      <AlertDialog
        open={showProgressDialog}
        onOpenChange={setShowProgressDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Inserting Data
            </AlertDialogTitle>
            <AlertDialogDescription>
              Please wait while we insert the data into the database...
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(progress.current / progress.total) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Success: {progress.success}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span>Errors: {progress.errors}</span>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogAction disabled>
              {inserting ? "Processing..." : "Complete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
};
