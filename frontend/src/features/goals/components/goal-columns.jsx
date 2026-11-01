"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

/**
 * getGoalColumns — returns column definitions for the goals table.
 *
 * Receives the sort state and callbacks from the parent so columns
 * can trigger sorts and row actions (edit, delete, toggle) without owning that state.
 *
 * Follows the same pattern as reminder-columns.jsx.
 *
 * @param {Object} params
 * @param {string}   params.sortBy         - Currently sorted column
 * @param {string}   params.sortOrder      - "asc" or "desc"
 * @param {Function} params.onSort         - (sortBy, sortOrder) => void
 * @param {Function} params.onEdit         - (goal) => void
 * @param {Function} params.onDelete       - (goal) => void
 * @param {Function} [params.onToggleStatus] - (goal, checked) => void
 */
export function getGoalColumns({ sortBy, sortOrder, onSort, onEdit, onDelete, onToggleStatus }) {
  return [
    // ── Title (sortable) ──────────────────────────────────────────────────────
    {
      key: "title",
      header: (
        <DataTableColumnHeader
          title="Title"
          sortKey="title"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSort={onSort}
        />
      ),
      skeletonWidth: "w-40",
      render: (row) => (
        <span className="font-medium text-foreground">{row.title}</span>
      ),
    },

    // ── Category ──────────────────────────────────────────────────────────────
    {
      key: "category",
      header: "Category",
      skeletonWidth: "w-28",
      render: (row) => {
        if (!row.category) {
          return <span className="text-muted-foreground text-xs italic">None</span>;
        }
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border"
            style={{
              backgroundColor: `${row.category.color || "#6366F1"}15`,
              borderColor: `${row.category.color || "#6366F1"}35`,
              color: row.category.color || "#6366F1",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: row.category.color || "#6366F1" }}
            />
            {row.category.name}
          </span>
        );
      },
    },

    // ── Frequency (sortable) ──────────────────────────────────────────────────
    {
      key: "times_a_day",
      header: (
        <DataTableColumnHeader
          title="Frequency"
          sortKey="times_a_day"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSort={onSort}
        />
      ),
      skeletonWidth: "w-24",
      render: (row) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {row.times_a_day || 1}x / day
        </span>
      ),
    },

    // ── Type (Fixed / Daily) ──────────────────────────────────────────────────
    {
      key: "type",
      header: "Type",
      skeletonWidth: "w-28",
      render: (row) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge
            variant="outline"
            className={
              row.is_fixed
                ? "bg-primary/10 text-primary border-primary/25 text-xs font-normal"
                : "bg-muted text-muted-foreground border-border text-xs font-normal"
            }
          >
            {row.is_fixed ? "Fixed" : "Flexible"}
          </Badge>
          <Badge
            variant="outline"
            className={
              row.is_daily
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25 text-xs font-normal"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25 text-xs font-normal"
            }
          >
            {row.is_daily ? "Daily" : "Weekly"}
          </Badge>
        </div>
      ),
    },

    // ── Status switch & badge (is_active) ─────────────────────────────────────
    {
      key: "status",
      header: "Status",
      skeletonWidth: "w-28",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Switch
            checked={row.is_active}
            onCheckedChange={(checked) => onToggleStatus?.(row, checked)}
            aria-label={`Toggle active status for ${row.title}`}
          />
          <Badge
            variant={row.is_active ? "default" : "secondary"}
            className={
              row.is_active
                ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-0"
                : "bg-muted text-muted-foreground border-0"
            }
          >
            {row.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      ),
    },

    // ── Created date (sortable) ───────────────────────────────────────────────
    {
      key: "created_at",
      header: (
        <DataTableColumnHeader
          title="Created"
          sortKey="created_at"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSort={onSort}
        />
      ),
      skeletonWidth: "w-24",
      render: (row) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {formatRelativeDate(row.created_at)}
        </span>
      ),
    },

    // ── Row actions ───────────────────────────────────────────────────────────
    {
      key: "actions",
      header: "",
      headerClassName: "w-[50px]",
      className: "w-[50px]",
      skeletonWidth: "w-8",
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Actions for ${row.title}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit(row)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(row)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}

// ── Helper ────────────────────────────────────────────────────────────────────
function formatRelativeDate(dateString) {
  if (!dateString) return "-";
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

