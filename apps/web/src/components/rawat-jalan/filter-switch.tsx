import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Route } from "@/routes/rekap.rawat-jalan";

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
      <Label htmlFor={label}>{label}</Label>
      <Switch
        id={label}
        checked={!!search[searchParam as keyof typeof search]}
        onCheckedChange={setValue}
      />
    </div>
  );
};
