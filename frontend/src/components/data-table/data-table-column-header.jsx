"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

/**
 * DataTableColumnHeader — sortable column header with direction indicator.
 *
 * Click cycles: asc → desc → asc → ...
 * Shows a subtle icon indicating current sort direction (or neutral if unsorted).
 *
 * @param {Object} props
 * @param {string}   props.title      - Column display name
 * @param {string}   props.sortKey    - The key this column sorts by (e.g. "created_at")
 * @param {string}   props.currentSortBy    - Currently active sort column
 * @param {string}   props.currentSortOrder - "asc" or "desc"
 * @param {Function} props.onSort     - (sortBy, sortOrder) => void
 */
export function DataTableColumnHeader({
  title,
  sortKey,
  currentSortBy,
  currentSortOrder,
  onSort,
}) {
  const isActive = currentSortBy === sortKey;

  const handleClick = () => {
    if (!isActive) {
      // First click on a new column → default to descending (newest first)
      onSort(sortKey, "desc");
    } else {
      // Toggle direction on the same column
      onSort(sortKey, currentSortOrder === "asc" ? "desc" : "asc");
    }
  };

  const Icon = isActive
    ? currentSortOrder === "asc"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 font-semibold"
      onClick={handleClick}
    >
      {title}
      <Icon
        className={`ml-1.5 h-3.5 w-3.5 ${
          isActive ? "text-foreground" : "text-muted-foreground"
        }`}
      />
    </Button>
  );
}
