"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, Inbox } from "lucide-react";

/**
 * DataTable — generic, reusable table component.
 *
 * This component knows NOTHING about any specific resource.
 * It receives columns, data, and state — and renders a professional table
 * with loading skeletons, empty states, and error recovery.
 *
 * @param {Object} props
 * @param {Array}  props.columns     - Column definitions: { key, header, render, className }
 * @param {Array}  props.data        - Row data from the server
 * @param {boolean} props.isLoading  - Show skeleton rows
 * @param {boolean} props.isError    - Show error state
 * @param {Function} props.onRetry   - Called when user clicks "Retry" on error state
 * @param {string} props.emptyTitle  - Heading for empty state
 * @param {string} props.emptyDescription - Subtext for empty state
 * @param {React.ReactNode} props.emptyAction - CTA button for empty state
 * @param {React.ReactNode} props.toolbar - Rendered above the table (search, filters, actions)
 * @param {React.ReactNode} props.pagination - Rendered below the table
 */
export function DataTable({
  columns,
  data,
  isLoading,
  isError,
  onRetry,
  emptyTitle = "No results found",
  emptyDescription = "Try adjusting your search or filters.",
  emptyAction,
  toolbar,
  pagination,
}) {
  // ── Loading skeleton ────────────────────────────────────────────────────────
  const renderSkeletonRows = () =>
    Array.from({ length: 6 }).map((_, i) => (
      <TableRow key={`skeleton-${i}`}>
        {columns.map((col) => (
          <TableCell key={col.key} className={col.className}>
            <Skeleton
              className={`h-4 ${col.skeletonWidth || "w-full"} rounded`}
            />
          </TableCell>
        ))}
      </TableRow>
    ));

  // ── Error state ─────────────────────────────────────────────────────────────
  const renderError = () => (
    <TableRow>
      <TableCell
        colSpan={columns.length}
        className="h-60"
      >
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <p className="font-medium text-foreground">Something went wrong</p>
            <p className="text-sm text-muted-foreground mt-1">
              Failed to load data. Please try again.
            </p>
          </div>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );

  // ── Empty state ─────────────────────────────────────────────────────────────
  const renderEmpty = () => (
    <TableRow>
      <TableCell
        colSpan={columns.length}
        className="h-60"
      >
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div className="rounded-full bg-muted p-3">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">{emptyTitle}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {emptyDescription}
            </p>
          </div>
          {emptyAction}
        </div>
      </TableCell>
    </TableRow>
  );

  // ── Data rows ───────────────────────────────────────────────────────────────
  const renderRows = () =>
    data.map((row) => (
      <TableRow key={row.id} className="group">
        {columns.map((col) => (
          <TableCell key={col.key} className={col.className}>
            {col.render(row)}
          </TableCell>
        ))}
      </TableRow>
    ));

  return (
    <div className="space-y-4">
      {toolbar}

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {columns.map((col) => (
                <TableHead key={col.key} className={col.headerClassName}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? renderSkeletonRows()
              : isError
                ? renderError()
                : data.length === 0
                  ? renderEmpty()
                  : renderRows()}
          </TableBody>
        </Table>
      </div>

      {pagination}
    </div>
  );
}
