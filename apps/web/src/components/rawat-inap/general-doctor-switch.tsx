import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Route } from "@/routes/rawat-inap";

export const GeneralDoctorSwitch = () => {
  const { generalDoctor } = Route.useSearch();
  const navigate = Route.useNavigate();

  const setGeneralDoctor = (checked: boolean) => {
    navigate({
      search: (prev) => ({
        ...prev,
        generalDoctor: checked,
      }),
    });
  };
  return (
    <div className="flex items-center gap-4">
      <Label>Dokter Umum</Label>
      <Switch checked={generalDoctor} onCheckedChange={setGeneralDoctor} />
    </div>
  );
};
