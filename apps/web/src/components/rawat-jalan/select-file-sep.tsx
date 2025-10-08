import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { getRouteApi } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const SelectFileSEP = ({
  from,
}: {
  from: "/rekap/rawat-inap" | "/rekap/rawat-jalan";
}) => {
  const route = getRouteApi(from);
  const { selectedCsvFile } = route.useSearch();
  const navigate = route.useNavigate();
  const uploadedFiles = useQuery(
    trpc.csvUpload.getUploadedFiles.queryOptions()
  );

  const handleValueChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        selectedCsvFile: value,
        offset: 0,
        page: 1,
      }),
    });
  };

  const handleClear = () => {
    navigate({
      search: (prev) => ({ ...prev, selectedCsvFile: "" }),
    });
  };

  return (
    <div className="flex items-center gap-2 ">
      <Select value={selectedCsvFile || ""} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Pilih CSV file..." />
        </SelectTrigger>
        <SelectContent>
          {uploadedFiles.data?.map((file) => (
            <SelectItem key={file.filename} value={file.filename}>
              {file.filename}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedCsvFile && (
        <Button variant="ghost" size="icon" onClick={handleClear}>
          <X />
        </Button>
      )}
    </div>
  );
};

export default SelectFileSEP;
