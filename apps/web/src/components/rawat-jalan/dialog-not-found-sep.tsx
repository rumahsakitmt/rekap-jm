import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { SearchX } from "lucide-react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="destructive">
              <SearchX />
              <p className="text-2xl font-bold  text-center">
                {notFoundInDb.length}
              </p>
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent className="bg-background text-destructive">
          <p>SEP tidak ditemukan di SIMRS</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>List SEP</DialogTitle>
          <DialogDescription>
            {notFoundInDb.length} SEP tidak ditemukan di SIMRS, silahkan hubungi
            petugas RM untuk tarik SEP.
          </DialogDescription>
        </DialogHeader>
        <div>
          <ScrollArea className="h-[450px]">
            {notFoundInDb.map((item) => (
              <div key={item.no_sep} className="grid grid-cols-2  gap-2">
                <p>{item.no_sep}</p>
              </div>
            ))}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
