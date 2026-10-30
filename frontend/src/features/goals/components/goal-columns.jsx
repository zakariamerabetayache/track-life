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
 * getReminderColumns — returns column definitions for the reminders table.
 *
 * Receives the sort state and callbacks from the parent so columns
 * can trigger sorts and row actions (edit, delete, toggle) without owning that state.
 *
 * Separation rationale: column definitions describe WHAT to render,
 * not HOW the data is fetched. This keeps them pure and testable.
 *
 * @param {Object} params
 * @param {string}   params.sortBy         - Currently sorted column
 * @param {string}   params.sortOrder      - "asc" or "desc"
 * @param {Function} params.onSort         - (sortBy, sortOrder) => void
 * @param {Function} params.onEdit         - (reminder) => void
 * @param {Function} params.onDelete       - (reminder) => void
 * @param {Function} [params.onToggleStatus] - (reminder, checked) => void
 * 

 */
export function getReminderColumns({ sortBy, sortOrder, onSort, onEdit, onDelete, onToggleStatus }) {
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
        {
            key: "times_a_day",
            header: (
                <DataTableColumnHeader
                    title="Times a day"
                    sortKey="times_a_day"
                    currentSortBy={sortBy}
                    currentSortOrder={sortOrder}
                    onSort={onSort}
                />
            ),
            skeletonWidth: "w-40",
            render: (row) => (
                <span className="font-medium text-foreground">{row.times_a_day}</span>
            ),
        },

        // ── Content preview ───────────────────────────────────────────────────────
        {
            key: "category",
            header: "category",
            className: "max-w-[300px]",
            headerClassName: "max-w-[300px]",
            skeletonWidth: "w-56",
            render: (row) => (
                <span className="text-muted-foreground line-clamp-1">
                    {row.category?.name}
                </span>
            ),
        },

        // ── Status switch & badge ──────────────────────────────────────────────────
        {
            key: "is_fixed",
            header: "fixed",
            skeletonWidth: "w-28",
            render: (row) => (
                <div className="flex items-center gap-2.5">
                    <Switch
                        checked={row.is_fixed}
                        onCheckedChange={(checked) => onToggleStatus?.(row, checked)}
                        aria-label={`Toggle fixed status for ${row.title}`}
                    />
                    <Badge
                        variant={row.is_fixed ? "default" : "secondary"}
                        className={
                            row.is_fixed
                                ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-0"
                                : "bg-muted text-muted-foreground border-0"
                        }
                    >
                        {row.is_fixed ? "Fixed" : "Not fixed"}
                    </Badge>
                </div>
            ),
        },
        {
            key: "is_active",
            header: "Active",
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
                        {row.is_active ? "Active" : "Not Active"}
                    </Badge>
                </div>
            ),
        },
        {
            key: "is_daily",
            header: "daily",
            skeletonWidth: "w-28",
            render: (row) => (
                <div className="flex items-center gap-2.5">
                    <Switch
                        checked={row.is_daily}
                        onCheckedChange={(checked) => onToggleStatus?.(row, checked)}
                        aria-label={`Toggle daily status for ${row.title}`}
                    />
                    <Badge
                        variant={row.is_daily ? "default" : "secondary"}
                        className={
                            row.is_daily
                                ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-0"
                                : "bg-muted text-muted-foreground border-0"
                        }
                    >
                        {row.is_daily ? "Daily" : "Not Daily"}
                    </Badge>
                </div>
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
// Relative date formatting: "Just now", "5m ago", "3h ago", "2d ago", etc.
function formatRelativeDate(dateString) {
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

    // Fallback to formatted date for older records
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
}
