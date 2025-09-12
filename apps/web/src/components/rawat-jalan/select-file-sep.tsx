import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilterStore } from "@/stores/filter-store";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

const SelectFileSEP = () => {
  const { selectedCsvFile, setSelectedCsvFile } = useFilterStore();
  const uploadedFiles = useQuery(
    trpc.csvUpload.getUploadedFiles.queryOptions()
  );
  return (
    <Select value={selectedCsvFile} onValueChange={setSelectedCsvFile}>
      <SelectTrigger className="flex-1">
        <SelectValue placeholder="Select CSV file..." />
      </SelectTrigger>
      <SelectContent>
        {uploadedFiles.data?.map((file) => (
          <SelectItem key={file.filename} value={file.filename}>
            {file.filename}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectFileSEP;
