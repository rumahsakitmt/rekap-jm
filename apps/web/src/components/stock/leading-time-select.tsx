import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRouteApi } from "@tanstack/react-router";
import { Label } from "../ui/label";

const LeadingTimeSelect = () => {
  const route = getRouteApi("/obat/stok");
  const { leadingTime } = route.useSearch();
  const navigate = route.useNavigate();
  const handleValueChange = (value: string) => {
    navigate({
      search: (prev) => ({ ...prev, leadingTime: value }),
    });
  };
  return (
    <div className="space-y-2">
      <Label>Waktu Tunggu</Label>
      <Select value={leadingTime || "6"} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Waktu Tunnggu" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="6">6 Hari</SelectItem>
          <SelectItem value="15">15 Hari</SelectItem>
          <SelectItem value="30">30 Hari</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LeadingTimeSelect;
