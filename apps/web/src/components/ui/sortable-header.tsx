import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import { type Column } from "@tanstack/react-table";

interface SortableHeaderProps {
  column: Column<any, unknown>;
  title: string;
  className?: string;
}

export function SortableHeader({
  column,
  title,
  className,
}: SortableHeaderProps) {
  return (
    <div
      className={`flex items-center w-full justify-center ${className || ""}`}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="uppercase">
            {title}
            {column.getIsSorted() === "desc" ? (
              <ArrowDown />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp />
            ) : (
              <ChevronsUpDown />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUp />
            ASC
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDown />
            DESC
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
