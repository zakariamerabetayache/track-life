"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
 * getCategoryColumns — returns column definitions for the categories table.
 *
 * @param {Object} params
 * @param {string}   params.sortBy         - Currently sorted column
 * @param {string}   params.sortOrder      - "asc" or "desc"
 * @param {Function} params.onSort         - (sortBy, sortOrder) => void
 * @param {Function} params.onEdit         - (category) => void
 * @param {Function} params.onDelete       - (category) => void
 */
export function getCategoryColumns({ sortBy, sortOrder, onSort, onEdit, onDelete }) {
  return [
    // ── Name & Color Indicator (sortable) ───────────────────────────────────
    {
      key: "name",
      header: (
        <DataTableColumnHeader
          title="Category Name"
          sortKey="name"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSort={onSort}
        />
      ),
      skeletonWidth: "w-44",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <span
            className="h-3.5 w-3.5 rounded-full shrink-0 border border-black/10 shadow-xs"
            style={{ backgroundColor: row.color || "#6366F1" }}
          />
          <span className="font-semibold text-foreground">{row.name}</span>
        </div>
      ),
    },

    // ── Color Hex Code ───────────────────────────────────────────────────────
    {
      key: "color",
      header: "Color",
      skeletonWidth: "w-28",
      render: (row) => (
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-mono font-medium border"
          style={{
            backgroundColor: `${row.color || "#6366F1"}15`,
            borderColor: `${row.color || "#6366F1"}35`,
            color: row.color || "#6366F1",
          }}
        >
          {row.color || "#6366F1"}
        </span>
      ),
    },

    // ── Linked Goals Count ───────────────────────────────────────────────────
    {
      key: "goals_count",
      header: "Active Goals",
      skeletonWidth: "w-24",
      render: (row) => (
        <Badge variant="secondary" className="font-normal text-xs">
          {row.goals_count ?? 0} active {row.goals_count === 1 ? "goal" : "goals"}
        </Badge>
      ),
    },

    // ── Sort Order (sortable) ────────────────────────────────────────────────
    {
      key: "sort_order",
      header: (
        <DataTableColumnHeader
          title="Sort Order"
          sortKey="sort_order"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSort={onSort}
        />
      ),
      skeletonWidth: "w-20",
      render: (row) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {row.sort_order ?? 0}
        </span>
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
                aria-label={`Actions for ${row.name}`}
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
  if (!dateString) return "—";
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

