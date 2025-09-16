import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export const SupportFilter = () => {
  return (
    <Select>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Ruangan Penunjang" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="lab">Laboratorium</SelectItem>
        <SelectItem value="radiologi">Radiologi</SelectItem>
      </SelectContent>
    </Select>
  );
};
