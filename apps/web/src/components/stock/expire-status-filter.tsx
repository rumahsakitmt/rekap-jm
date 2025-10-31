"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRouteApi } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { ShoppingCart, Flame, CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

const route = getRouteApi("/obat/kadaluwarsa");

export function ExpireStatusFilter() {
  const navigate = useNavigate();
  const { status } = route.useSearch();

  const statusOptions = [
    {
      value: "hijau",
      label: "Expired diatas 12 bulan",
      Icon: <CheckCircle className="text-emerald-600" />,
      color: "text-green-500 focus:text-emerald-600",
    },
    {
      value: "kuning",
      label: "Expired 6-12 bulan",
      Icon: <ShoppingCart className="text-amber-600" />,
      color: "text-amber-500 focus:text-amber-600",
    },
    {
      value: "merah",
      label: "Expired <6 bulan",
      Icon: <Flame className="text-red-600" />,
      color: "text-red-500 focus:text-red-600",
    },
  ];

  const handleStatusChange = (value: string) => {
    navigate({
      to: "/obat/kadaluwarsa",
      search: (prev) => ({
        ...prev,
        status: value || undefined,
      }),
    });
  };

  const handleClear = () => {
    navigate({
      to: "/obat/kadaluwarsa",
      search: (prev) => ({ ...prev, status: undefined }),
    });
  };

  return (
    <div className="space-y-2">
      <Label>Filter Status</Label>
      <Select value={status} onValueChange={handleStatusChange}>
        <div className="flex items-center gap-2 justify-between">
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder="Pilih status"
              className={cn(
                status &&
                  statusOptions.find((option) => option.value === status)?.color
              )}
            />
          </SelectTrigger>
          {status && (
            <Button size="sm" variant="ghost" onClick={handleClear}>
              <X />
            </Button>
          )}
        </div>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className={cn(option.color)}
            >
              {option.Icon}
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
