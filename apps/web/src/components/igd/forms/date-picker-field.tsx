import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFieldContext } from "@/hooks/form";
import { format } from "date-fns";

export function DatePickerField({ label }: { label: string }) {
  const field = useFieldContext<Date | undefined>();
  const [open, setOpen] = React.useState(false);
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      field.handleChange(date);
      return;
    }

    const now = new Date();
    const newDate = new Date(date);
    newDate.setHours(now.getHours());
    newDate.setMinutes(now.getMinutes());
    newDate.setSeconds(now.getSeconds());
    newDate.setMilliseconds(now.getMilliseconds());
    field.handleChange(newDate);
  };

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date-picker"
            className="flex-1 justify-between font-normal"
          >
            {field.state.value
              ? format(field.state.value, "dd/MM/yyy HH:mm:ss")
              : "Pilih Tanggal"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={field.state.value}
            captionLayout="dropdown"
            onSelect={handleDateSelect}
          />
        </PopoverContent>
      </Popover>

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
