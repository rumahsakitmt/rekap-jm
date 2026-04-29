import { Button } from "@/components/ui/button";
import { Loader2, Save, Trash2, Send } from "lucide-react";
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
import { SpinnerVerb } from "./spinner-verb";
import { useKlaimRanapStore } from "@/stores/klaim-ranap-store";

export function KlaimActionButtons({
  isKlaimed,
  simpanPending,
  kirimPending,
  hapusPending,
  onSimpan,
  onKirim,
  onHapus,
}: {
  isKlaimed: boolean;
  simpanPending: boolean;
  kirimPending: boolean;
  hapusPending: boolean;
  onSimpan: () => void;
  onKirim: () => void;
  onHapus: () => void;
}) {
  const {
    kirimDialogOpen,
    hapusDialogOpen,
    setKirimDialogOpen,
    setHapusDialogOpen,
  } = useKlaimRanapStore();

  return (
    <div className="flex flex-col gap-3">
      {!isKlaimed ? (
        <Button onClick={onSimpan} disabled={simpanPending} className="flex-1">
          {simpanPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              <SpinnerVerb />
            </>
          ) : (
            <>
              <Save className="mr-2 size-4" />
              Simpan Klaim
            </>
          )}
        </Button>
      ) : (
        <>
          <AlertDialog
            open={kirimDialogOpen}
            onOpenChange={setKirimDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button className="flex-1" disabled={kirimPending}>
                {kirimPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Send className="mr-2 size-4" />
                )}
                Kirim Klaim
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Kirim Klaim ke DC</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin mengirim klaim ini ke DC (Data
                  Center)?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={onKirim}>Kirim</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog
            open={hapusDialogOpen}
            onOpenChange={setHapusDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={hapusPending}
              >
                {hapusPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 size-4" />
                )}
                Hapus Klaim
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Klaim</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus klaim ini? Tindakan ini
                  tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={onHapus}
                >
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
