import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Route } from "@/routes/rawat-inap";

export const OperationSwitch = () => {
  const { operation } = Route.useSearch();
  const navigate = Route.useNavigate();

  const setOperation = (checked: boolean) => {
    navigate({
      search: (prev) => ({
        ...prev,
        operation: checked,
      }),
    });
  };
  return (
    <div className="flex items-center gap-4">
      <Label>Operasi</Label>
      <Switch checked={operation} onCheckedChange={setOperation} />
    </div>
  );
};
