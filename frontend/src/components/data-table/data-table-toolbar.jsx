"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * DataTableToolbar — generic toolbar rendered above any data table.
 *
 * Provides a search input with debounce-ready onChange, a clear button,
 * and a children slot for resource-specific filters and action buttons.
 *
 * @param {Object} props
 * @param {string}   props.searchValue    - Current raw search string
 * @param {Function} props.onSearchChange - Called on every keystroke (debounce in the parent)
 * @param {string}   props.searchPlaceholder - Input placeholder text
 * @param {React.ReactNode} props.children - Filter dropdowns, action buttons, etc.
 */
export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  children,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search input */}
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9 pr-9"
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Resource-specific filters and action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {children}
      </div>
    </div>
  );
}
