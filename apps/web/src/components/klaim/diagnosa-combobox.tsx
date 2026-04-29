import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DiagnosaComboboxProps {
  value: string[]; // Array of kode penyakit
  onChange: (value: string[]) => void;
  placeholder?: string;
  inacbgOnly?: boolean;
  disabled?: boolean;
  noRawat?: string;
  statuses?: string[]; // Parallel array of statuses per code
}

export function DiagnosaCombobox({
  value,
  onChange,
  placeholder = "Cari diagnosa...",
  inacbgOnly = false,
  disabled = false,
  noRawat,
  statuses,
}: DiagnosaComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const listId = React.useId();

  // Search query for dropdown
  const { data: searchData, isLoading } = useQuery({
    ...trpc.klaim.searchPenyakit.queryOptions({
      query: searchQuery || "A",
      inacbgOnly,
      limit: 50,
    }),
    enabled: searchQuery.length >= 1 || open,
  });

  // Fetch names for selected codes
  const { data: selectedData } = useQuery({
    ...trpc.klaim.getPenyakitByCodes.queryOptions({
      codes: value,
      noRawat,
    }),
    enabled: value.length > 0,
  });

  // Create a map of code -> details for quick lookup
  const dataMap = React.useMemo(() => {
    const map = new Map<string, { nama: string; ap: string; vc: string; status: string | null }>();
    selectedData?.forEach((item) => {
      map.set(item.kode, { nama: item.nama || "", ap: item.ap as string, vc: item.vc as string, status: item.status as string | null });
    });
    return map;
  }, [selectedData]);

  const handleRemoveItem = (kodeToRemove: string, currentValues: string[]) => {
    let newValues = currentValues.filter((v) => v !== kodeToRemove);
    while (newValues.length > 0) {
      const firstData = dataMap.get(newValues[0]);
      if (firstData && firstData.ap === "N") {
        newValues = newValues.slice(1);
      } else {
        break;
      }
    }
    return newValues;
  };

  const handleSelect = (kode: string) => {
    if (value.includes(kode)) {
      onChange(handleRemoveItem(kode, value));
    } else {
      onChange([...value, kode]);
    }
  };

  const handleRemove = (kode: string) => {
    onChange(handleRemoveItem(kode, value));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            className="w-full justify-between font-normal"
            disabled={disabled}
          >
            <span className="text-muted-foreground">{placeholder}</span>
            <ChevronsUpDown className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Ketik kode atau nama diagnosa..."
              className="h-9"
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList id={listId}>
              {isLoading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Mencari...
                </div>
              ) : searchQuery.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Ketik untuk mencari diagnosa
                </div>
              ) : (
                <>
                  <CommandEmpty>Tidak ada diagnosa ditemukan.</CommandEmpty>
                  <CommandGroup>
                    {searchData?.map((item) => {
                      const isDisabled = item.vc === "0" || (value.length === 0 && item.ap === "N");
                      return (
                        <CommandItem
                          key={item.kode}
                          value={item.kode}
                          disabled={isDisabled}
                          onSelect={() => {
                            if (!isDisabled) handleSelect(item.kode);
                          }}
                          className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-xs font-medium">
                              {item.kode}
                            </span>
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {item.nama}
                            </span>
                          </div>
                          <Check
                            className={cn(
                              "ml-auto size-4",
                              value.includes(item.kode)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-col gap-1">
          {value.map((kode, idx) => {
            const item = dataMap.get(kode);
            const nama = item?.nama;
            const status = statuses?.[idx];
            return (
              <div
                key={`${kode}-${idx}`}
                className="flex items-start gap-2 rounded-md border bg-muted/50 p-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-medium">{kode}</span>
                    {status && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${status === 'Ranap' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                        {status}
                      </span>
                    )}
                  </div>
                  {nama && (
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {nama}
                    </div>
                  )}
                </div>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(kode)}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ProsedurComboboxProps {
  value: string[]; // Array of kode icd9
  onChange: (value: string[]) => void;
  placeholder?: string;
  inacbgOnly?: boolean;
  disabled?: boolean;
  noRawat?: string;
  statuses?: string[]; // Parallel array of statuses per code
}

export function ProsedurCombobox({
  value,
  onChange,
  placeholder = "Cari prosedur...",
  inacbgOnly = false,
  disabled = false,
  noRawat,
  statuses,
}: ProsedurComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const listId = React.useId();

  // Search query for dropdown
  const { data: searchData, isLoading } = useQuery({
    ...trpc.klaim.searchIcd9.queryOptions({
      query: searchQuery || "0",
      inacbgOnly,
      limit: 50,
    }),
    enabled: searchQuery.length >= 1 || open,
  });

  // Fetch names for selected codes
  const { data: selectedData } = useQuery({
    ...trpc.klaim.getIcd9ByCodes.queryOptions({
      codes: value,
      noRawat,
    }),
    enabled: value.length > 0,
  });

  // Create a map of code -> details for quick lookup
  const dataMap = React.useMemo(() => {
    const map = new Map<string, { nama: string; ap: string; vc: string; status: string | null }>();
    selectedData?.forEach((item) => {
      map.set(item.kode, { nama: item.nama || "", ap: item.ap as string, vc: item.vc as string, status: item.status as string | null });
    });
    return map;
  }, [selectedData]);

  const handleRemoveItem = (kodeToRemove: string, currentValues: string[]) => {
    let newValues = currentValues.filter((v) => v !== kodeToRemove);
    while (newValues.length > 0) {
      const firstData = dataMap.get(newValues[0]);
      if (firstData && firstData.ap === "N") {
        newValues = newValues.slice(1);
      } else {
        break;
      }
    }
    return newValues;
  };

  const handleSelect = (kode: string) => {
    if (value.includes(kode)) {
      onChange(handleRemoveItem(kode, value));
    } else {
      onChange([...value, kode]);
    }
  };

  const handleRemove = (kode: string) => {
    onChange(handleRemoveItem(kode, value));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            className="w-full justify-between font-normal"
            disabled={disabled}
          >
            <span className="text-muted-foreground">{placeholder}</span>
            <ChevronsUpDown className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Ketik kode atau nama prosedur..."
              className="h-9"
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList id={listId}>
              {isLoading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Mencari...
                </div>
              ) : searchQuery.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Ketik untuk mencari prosedur
                </div>
              ) : (
                <>
                  <CommandEmpty>Tidak ada prosedur ditemukan.</CommandEmpty>
                  <CommandGroup>
                    {searchData?.map((item) => {
                      const isDisabled = item.vc === "0" || (value.length === 0 && item.ap === "N");
                      return (
                        <CommandItem
                          key={item.kode}
                          value={item.kode}
                          disabled={isDisabled}
                          onSelect={() => {
                            if (!isDisabled) handleSelect(item.kode);
                          }}
                          className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-xs font-medium">
                              {item.kode}
                            </span>
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {item.nama}
                            </span>
                          </div>
                          <Check
                            className={cn(
                              "ml-auto size-4",
                              value.includes(item.kode)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-col gap-1">
          {value.map((kode, idx) => {
            const item = dataMap.get(kode);
            const nama = item?.nama;
            const status = statuses?.[idx];
            return (
              <div
                key={`${kode}-${idx}`}
                className="flex items-start gap-2 rounded-md border bg-muted/50 p-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-medium">{kode}</span>
                    {status && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${status === 'Ranap' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                        {status}
                      </span>
                    )}
                  </div>
                  {nama && (
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {nama}
                    </div>
                  )}
                </div>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(kode)}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
