import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate, useSearch } from "@tanstack/react-router";

interface DataTablePaginationProps {
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    page: number;
    totalPages: number;
  };
  from: "/rekap/rawat-inap" | "/rekap/rawat-jalan";
}

export function DataTablePagination({
  pagination,
  from,
}: DataTablePaginationProps) {
  const searchParams = useSearch({ from });
  const navigate = useNavigate({ from });
  const { limit, page } = searchParams;
  if (!pagination) {
    return null;
  }

  const { total, totalPages } = pagination;
  const currentPage = page || 1;
  const currentLimit = limit || 50;
  const canPreviousPage = currentPage > 1;
  const canNextPage = currentPage < totalPages;

  const handleLimitChange = (newLimit: number) => {
    navigate({
      search: (prev: any) => ({
        ...prev,
        limit: newLimit,
        offset: 0,
        page: 1,
      }),
    });
  };

  const handlePageChange = (newPage: number) => {
    const newOffset = (newPage - 1) * currentLimit;
    navigate({
      search: (prev: any) => ({
        ...prev,
        page: newPage,
        offset: newOffset,
      }),
    });
  };

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        Menampilkan {pagination.offset + 1} sampai{" "}
        {Math.min(pagination.offset + pagination.limit, total)} dari {total}{" "}
        data
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Baris per halaman</p>
          <Select
            value={currentLimit.toString()}
            onValueChange={(value) => handleLimitChange(Number(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Baris per halaman" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="500">500</SelectItem>
              <SelectItem value="1000">1000</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[150px] items-center justify-center text-sm font-medium">
          Halaman {currentPage} dari {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => handlePageChange(1)}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">Ke halaman pertama</span>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">Ke halaman sebelumnya</span>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!canNextPage}
          >
            <span className="sr-only">Ke halaman selanjutnya</span>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => handlePageChange(totalPages)}
            disabled={!canNextPage}
          >
            <span className="sr-only">Ke halaman terakhir</span>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
