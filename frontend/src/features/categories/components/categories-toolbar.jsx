"use client";

import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

/**
 * CategoriesToolbar — resource-specific toolbar for the categories table.
 *
 * @param {Object} props
 * @param {string}   props.search        - Raw search value
 * @param {Function} props.onSearchChange
 * @param {Function} props.onCreateNew   - Opens the create dialog
 */
export function CategoriesToolbar({
  search,
  onSearchChange,
  onCreateNew,
}) {
  return (
    <DataTableToolbar
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search categories..."
    >
      <Button size="sm" className="h-9 gap-1.5" onClick={onCreateNew}>
        <Plus className="h-4 w-4" />
        New Category
      </Button>
    </DataTableToolbar>
  );
}

