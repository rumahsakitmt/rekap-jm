import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFieldContext } from "@/hooks/form";

interface FieldSelectProps {
  label: string;
  placeholder?: string;
  data: string[];
}

export function SelectField({ label, placeholder, data }: FieldSelectProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <div className="w-full max-w-md">
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        <Select value={field.state.value} onValueChange={field.handleChange}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {data.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </Field>
    </div>
  );
}
