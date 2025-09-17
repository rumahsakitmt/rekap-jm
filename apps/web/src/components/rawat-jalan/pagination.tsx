import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate, useSearch } from "@tanstack/react-router";

interface DataTablePaginationProps<TData> {
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    page: number;
    totalPages: number;
  };
  from: "/rawat-inap" | "/";
}

export function DataTablePagination<TData>({
  pagination,
  from,
}: DataTablePaginationProps<TData>) {
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
        Showing {pagination.offset + 1} to{" "}
        {Math.min(pagination.offset + pagination.limit, total)} of {total}{" "}
        entries
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={currentLimit.toString()}
            onValueChange={(value) => handleLimitChange(Number(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="500">500</SelectItem>
              <SelectItem value="2000">2000</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => handlePageChange(1)}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">Go to first page</span>
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
            <span className="sr-only">Go to previous page</span>
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
            <span className="sr-only">Go to next page</span>
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
            <span className="sr-only">Go to last page</span>
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
