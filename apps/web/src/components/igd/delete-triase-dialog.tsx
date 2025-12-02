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
import { Button, buttonVariants } from "@/components/ui/button";
import { queryClient, trpc } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Trash } from "lucide-react";

export const DeleteTriaseDialog = ({
  norawat,
  triase_type,
}: {
  norawat: string;
  triase_type: string;
}) => {
  const router = useRouter();
  const deleteTriaseMutation = useMutation({
    ...trpc.triase.deleteTriase.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(
        trpc.triase.getPatientTriase.queryOptions({
          no_rawat: norawat,
          triase_type,
        })
      );
      router.navigate({ to: "/igd/triase" });
    },
  });
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash />
          Hapus
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Apakah Yakin ingin menghapus triase?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Data yang dihapus tidak dapat dikembalikan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              deleteTriaseMutation.mutate({ no_rawat: norawat });
            }}
            className={buttonVariants({ variant: "destructive" })}
          >
            Ya, Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
