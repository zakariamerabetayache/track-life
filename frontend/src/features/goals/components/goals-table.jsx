"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { getGoalColumns } from "./goal-columns";
import { GoalsToolbar } from "./goals-toolbar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

/**
 * GoalsTable — composes generic data-table with goal-specific parts.
 *
 * This is the glue layer that plugs columns, toolbar, and pagination into
 * the reusable DataTable shell. It doesn't own any state — everything
 * flows down from the page component.
 *
 * @param {Object} props
 * @param {Array}    props.data        - Reminder rows
 * @param {boolean}  props.isLoading
 * @param {boolean}  props.isError
 * @param {Function} props.onRetry
 * @param {Object}   props.meta        - { page, pageSize, total, totalPages }
 * @param {string}   props.search      - Raw search value
 * @param {Function} props.onSearchChange
 * @param {string}   props.status      - Filter value
 * @param {Function} props.onStatusChange
 * @param {string}   props.sortBy
 * @param {string}   props.sortOrder
 * @param {Function} props.onSort
 * @param {Function} props.onPageChange
 * @param {Function} props.onPageSizeChange
 * @param {Function} props.onCreateNew
 * @param {Function} props.onEdit
 * @param {Function} props.onDelete
 * @param {Function} [props.onToggleStatus]
 */
export function GoalsTable({
    data,
    isLoading,
    isError,
    onRetry,
    meta,
    search,
    onSearchChange,
    status,
    onStatusChange,
    sortBy,
    sortOrder,
    onSort,
    onPageChange,
    onPageSizeChange,
    onCreateNew,
    onEdit,
    onDelete,
    onToggleStatus,
}) {
    const columns = getGoalColumns({
        sortBy,
        sortOrder,
        onSort,
        onEdit,
        onDelete,
        onToggleStatus,
    });

    return (
        <DataTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            isError={isError}
            onRetry={onRetry}
            emptyTitle="No goals yet"
            emptyDescription="Create your first goal to get started."
            emptyAction={
                <Button size="sm" onClick={onCreateNew} className="mt-2 gap-1.5">
                    <Plus className="h-4 w-4" />
                    New Goal
                </Button>
            }
            toolbar={
                <GoalsToolbar
                    search={search}
                    onSearchChange={onSearchChange}
                    status={status}
                    onStatusChange={onStatusChange}
                    onCreateNew={onCreateNew}
                />
            }
            pagination={
                meta && (
                    <DataTablePagination
                        page={meta.page}
                        pageSize={meta.pageSize}
                        total={meta.total}
                        totalPages={meta.totalPages}
                        onPageChange={onPageChange}
                        onPageSizeChange={onPageSizeChange}
                    />
                )
            }
        />
    );
}
