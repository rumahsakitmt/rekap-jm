import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Route } from "@/routes/rawat-inap";

interface FilterSwitchProps {
  label: string;
  searchParam: string;
}

export const FilterSwitch = ({ label, searchParam }: FilterSwitchProps) => {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const setValue = (checked: boolean) => {
    navigate({
      search: (prev) => ({
        ...prev,
        [searchParam]: checked,
      }),
    });
  };

  return (
    <div className="flex items-center gap-4">
      <Label>{label}</Label>
      <Switch
        checked={!!search[searchParam as keyof typeof search]}
        onCheckedChange={setValue}
      />
    </div>
  );
};
