import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RotateCcw, AlertTriangle } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export function ResetStatusInapDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const [prefix, setPrefix] = useState("");

  const resetMutation = useMutation({
    ...trpc.tarif.resetAllStatusInap.mutationOptions(),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.tarif.getTarifRawatInap.queryKey(),
      });
      setIsDialogOpen(false);
      setPrefix("");
    },
  });

  const handleReset = () => {
    resetMutation.mutate({ prefix });
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Status
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Reset Status Tarif Inap
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Apakah Anda yakin ingin mereset semua status tarif? Tindakan ini
              tidak dapat dibatalkan dan akan mempengaruhi semua data tarif
              rawat inap.
            </p>
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
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReset}
            className="bg-red-600 hover:bg-red-700"
            disabled={resetMutation.isPending}
          >
            {resetMutation.isPending ? "Memproses..." : "Ya, Reset"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
