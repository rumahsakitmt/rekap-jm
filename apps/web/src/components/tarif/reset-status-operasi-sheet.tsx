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
import { RotateCcw, AlertTriangle, X } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function ResetStatusOperasiDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const [prefix, setPrefix] = useState("");

  const resetMutation = useMutation({
    ...trpc.tarif.resetAllStatusPaketOperasi.mutationOptions(),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.tarif.getPaketOperasi.queryKey(),
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
            Reset Status Paket Operasi
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            Apakah Anda yakin ingin mereset semua status paket operasi? Tindakan
            ini tidak dapat dibatalkan dan akan mempengaruhi semua data paket
            operasi.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center gap-2 w-full">
          <Label className="uppercase">Prefix:</Label>
          <div className="relative w-full">
            <Input
              type="text"
              value={prefix}
              placeholder="ex: OP"
              onChange={(e) => setPrefix(e.target.value)}
            />
            {prefix && (
              <button
                onClick={() => setPrefix("")}
                className="absolute right-0 top-0 translate-y-1/2 pr-2"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
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
