import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { formatCurrency } from "@/lib/utils";

export const DialogNotFoundSep = ({
  notFoundInDb,
}: {
  notFoundInDb: {
    no_sep: string;
    tarif: number;
  }[];
}) => {
  return (
    <Dialog>
      <DialogTrigger>
        <p className="text-2xl font-bold text-red-500 text-center">
          {notFoundInDb.length}
        </p>
        <p className="text-sm text-muted-foreground">
          SEP tidak ditemukan di SIMRS
        </p>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>List SEP</DialogTitle>
          <DialogDescription>SEP tidak ditemukan di SIMRS</DialogDescription>
        </DialogHeader>
        <div>
          <ScrollArea className="h-[450px]">
            <div className="grid grid-cols-2 gap-2 text-center">
              <p>No SEP</p>
              <p>Tarif</p>
            </div>
            {notFoundInDb.map((item) => (
              <div key={item.no_sep} className="grid grid-cols-2  gap-2">
                <p>{item.no_sep}</p>
                <p className="text-right">{formatCurrency(item.tarif)}</p>
              </div>
            ))}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
