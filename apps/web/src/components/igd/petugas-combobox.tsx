import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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
import { withForm } from "@/hooks/form";
import { formOpts } from "./shared-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

export const PetugasCombobox = withForm({
  ...formOpts,
  render: function PetugasComboboxRender({ form }) {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const listId = React.useId();

    const { data } = useQuery(trpc.pegawai.getPegawai.queryOptions());

    const filteredData = React.useMemo(() => {
      if (!data) return [];
      if (!searchQuery) return data;

      const query = searchQuery.toLowerCase();
      return data.filter((p) =>
        p.nama?.toLowerCase().includes(query)
      );
    }, [data, searchQuery]);

    const displayedData = React.useMemo(() => {
      return filteredData.slice(0, 50);
    }, [filteredData]);

    return (
      <form.Field
        name="petugas"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          const selectedPegawai = data?.find((p) => p.nik === field.state.value);

          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Petugas/Dokter</FieldLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={listId}
                    className="w-full justify-between"
                  >
                    {selectedPegawai?.nama || "Cari Petugas/Dokter"}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Cari Petugas/Dokter"
                      className="h-9"
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList id={listId}>
                      <CommandEmpty>Tidak ada pegawai.</CommandEmpty>
                      <CommandGroup>
                        {displayedData.map((p) => (
                          <CommandItem
                            key={p.nik}
                            value={p.nik as string}
                            keywords={[p.nama || ""]}
                            onSelect={() => {
                              field.handleChange(p.nik as string);
                              setOpen(false);
                              setSearchQuery("");
                            }}
                          >
                            {p.nama}
                            <Check
                              className={cn(
                                "ml-auto",
                                field.state.value === p.nik
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                        {filteredData.length > 100 && (
                          <CommandItem disabled>
                            Menampilkan 50 dari {filteredData.length} hasil.
                            Ketik untuk mempersempit pencarian.
                          </CommandItem>
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      />
    );
  },
});
