"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

/**
 * DataTablePagination — renders page navigation + page size selector.
 *
 * Shows "Showing X–Y of Z" for context, page navigation buttons,
 * and a rows-per-page dropdown.
 *
 * @param {Object} props
 * @param {number}   props.page        - Current page (1-indexed)
 * @param {number}   props.pageSize    - Rows per page
 * @param {number}   props.total       - Total matching records
 * @param {number}   props.totalPages  - Total pages
 * @param {Function} props.onPageChange     - (newPage) => void
 * @param {Function} props.onPageSizeChange - (newSize) => void
 */
export function DataTablePagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1">
      {/* Record count summary */}
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">{from}–{to}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span> results
      </p>

      <div className="flex items-center gap-4">
        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground whitespace-nowrap">Rows per page</p>
          <Select
            value={pageSize.toString()}
            onValueChange={(val) => onPageSizeChange(Number(val))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page indicator */}
        <p className="text-sm text-muted-foreground whitespace-nowrap">
          Page {page} of {totalPages}
        </p>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page <= 1}
            onClick={() => onPageChange(1)}
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages}
            onClick={() => onPageChange(totalPages)}
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
