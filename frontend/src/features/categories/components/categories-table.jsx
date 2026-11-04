"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { getCategoryColumns } from "./category-columns";
import { CategoriesToolbar } from "./categories-toolbar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

/**
 * CategoriesTable — composes generic data-table with category-specific parts.
 *
 * @param {Object} props
 * @param {Array}    props.data        - Category rows
 * @param {boolean}  props.isLoading
 * @param {boolean}  props.isError
 * @param {Function} props.onRetry
 * @param {Object}   props.meta        - { page, pageSize, total, totalPages }
 * @param {string}   props.search      - Raw search value
 * @param {Function} props.onSearchChange
 * @param {string}   props.sortBy
 * @param {string}   props.sortOrder
 * @param {Function} props.onSort
 * @param {Function} props.onPageChange
 * @param {Function} props.onPageSizeChange
 * @param {Function} props.onCreateNew
 * @param {Function} props.onEdit
 * @param {Function} props.onDelete
 */
export function CategoriesTable({
  data,
  isLoading,
  isError,
  onRetry,
  meta,
  search,
  onSearchChange,
  sortBy,
  sortOrder,
  onSort,
  onPageChange,
  onPageSizeChange,
  onCreateNew,
  onEdit,
  onDelete,
}) {
  const columns = getCategoryColumns({
    sortBy,
    sortOrder,
    onSort,
    onEdit,
    onDelete,
  });

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      isError={isError}
      onRetry={onRetry}
      emptyTitle="No categories yet"
      emptyDescription="Create your first category to organize your goals."
      emptyAction={
        <Button size="sm" onClick={onCreateNew} className="mt-2 gap-1.5">
          <Plus className="h-4 w-4" />
          New Category
        </Button>
      }
      toolbar={
        <CategoriesToolbar
          search={search}
          onSearchChange={onSearchChange}
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

