import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CsvUpload } from "@/components/csv-upload";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export const UploadCSVSheet = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Upload CSV
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Upload CSV</SheetTitle>
          <SheetDescription>
            Upload a CSV file with SEP numbers and tariffs to import and analyze
            data.
          </SheetDescription>
        </SheetHeader>
        <div className="p-4">
          <CsvUpload />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UploadCSVSheet;
