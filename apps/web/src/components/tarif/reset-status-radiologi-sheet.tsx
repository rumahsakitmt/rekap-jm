import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { RotateCcw, AlertTriangle } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export function ResetStatusRadiologiSheet() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const [prefix, setPrefix] = useState("");

  const resetAllStatusRadiologi = useMutation({
    ...trpc.tarif.resetAllStatusRadiologi.mutationOptions(),
    onSettled: () => {
      queryClient.invalidateQueries(
        trpc.tarif.getTarifRadiologi.queryOptions()
      );
      toast.success("Status semua tarif radiologi berhasil direset");
      setOpen(false);
      setPrefix("");
    },
    onError: (error) => {
      toast.error(`Gagal mereset status: ${error.message}`);
    },
  });

  const handleReset = () => {
    resetAllStatusRadiologi.mutate({ prefix });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Status
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Reset Status Tarif Radiologi
          </DialogTitle>
          <DialogDescription>
            Tindakan ini akan mengubah status semua tarif radiologi yang aktif
            menjadi tidak aktif.
            <br />
            <strong>Perhatian:</strong> Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
          <div className="flex items-center gap-2 w-full">
            <Label className="uppercase">Prefix:</Label>
            <div className="relative w-full">
              <Input
                type="text"
                value={prefix}
                placeholder="ex: R00"
                onChange={(e) => setPrefix(e.target.value)}
              />
            </div>
          </div>
        </DialogHeader>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={resetAllStatusRadiologi.isPending}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleReset}
            disabled={resetAllStatusRadiologi.isPending}
          >
            {resetAllStatusRadiologi.isPending
              ? "Memproses..."
              : "Reset Status"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
