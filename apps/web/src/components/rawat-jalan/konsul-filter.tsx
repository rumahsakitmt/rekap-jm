import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, X } from "lucide-react";

export interface KonsulFilter {
  field: string;
  operator: string;
  value: string;
}

interface KonsulFilterProps {
  filter: KonsulFilter;
  onFilterChange: (filter: KonsulFilter) => void;
  onRemove: () => void;
}

const fieldOptions = [{ value: "konsul_count", label: "Konsul Count" }];

const operatorOptions = [
  { value: "=", label: "[=] equals", symbol: "=" },
  { value: "<>", label: "[<>] not equal", symbol: "<>" },
  { value: ">", label: "[>] greater than", symbol: ">" },
  { value: "<", label: "[<] less than", symbol: "<" },
  { value: ">=", label: "[>=] greater than or equal", symbol: ">=" },
  { value: "<=", label: "[<=] less than or equal", symbol: "<=" },
];

export function KonsulFilterComponent({
  filter,
  onFilterChange,
  onRemove,
}: KonsulFilterProps) {
  const [isFieldOpen, setIsFieldOpen] = useState(false);
  const [isOperatorOpen, setIsOperatorOpen] = useState(false);

  const selectedField = fieldOptions.find((f) => f.value === filter.field);
  const selectedOperator = operatorOptions.find(
    (o) => o.value === filter.operator
  );

  const handleFieldChange = (field: string) => {
    onFilterChange({ ...filter, field });
    setIsFieldOpen(false);
  };

  const handleOperatorChange = (operator: string) => {
    onFilterChange({ ...filter, operator });
    setIsOperatorOpen(false);
  };

  const handleValueChange = (value: string) => {
    onFilterChange({ ...filter, value });
  };

  const handleClearValue = () => {
    onFilterChange({ ...filter, value: "" });
  };

  return (
    <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
      {/* Field Selector */}
      <DropdownMenu open={isFieldOpen} onOpenChange={setIsFieldOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 min-w-[120px]">
            {selectedField?.label || "Select field"}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {fieldOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleFieldChange(option.value)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Operator Selector */}
      <DropdownMenu open={isOperatorOpen} onOpenChange={setIsOperatorOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 min-w-[100px]">
            {selectedOperator?.symbol || "="}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {operatorOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleOperatorChange(option.value)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Value Input */}
      <div className="relative">
        <Input
          type="number"
          placeholder="Enter value"
          value={filter.value}
          onChange={(e) => handleValueChange(e.target.value)}
          className="h-8 w-[140px] pr-8"
        />
        {filter.value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearValue}
            className="absolute right-0 top-0 h-8 w-8 p-0 hover:bg-transparent"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Remove Filter */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
