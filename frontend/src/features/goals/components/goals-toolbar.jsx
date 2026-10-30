"use client";

import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

/**
 * goalsToolbar — resource-specific toolbar for the goals table.
 *
 * Composes the generic DataTableToolbar with goal-specific controls:
 *  - Status filter dropdown (All / Active / Inactive)
 *  - "New goal" CTA button
 *
 * Adding a new filter (e.g. date range) means adding another child here —
 * the generic toolbar handles layout and search automatically.
 *
 * @param {Object} props
 * @param {string}   props.search        - Raw search value
 * @param {Function} props.onSearchChange
 * @param {string}   props.status        - "all" | "active" | "inactive"
 * @param {Function} props.onStatusChange
 * @param {Function} props.onCreateNew   - Opens the create dialog
 */
export function GoalsToolbar({
    search,
    onSearchChange,
    status,
    onStatusChange,
    onCreateNew,
}) {
    return (
        <DataTableToolbar
            searchValue={search}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search goals..."
        >
            {/* Status filter */}
            <Select value={status} onValueChange={onStatusChange}>
                <SelectTrigger className="h-9 w-[130px]">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
            </Select>

            {/* Create CTA */}
            <Button size="sm" className="h-9 gap-1.5" onClick={onCreateNew}>
                <Plus className="h-4 w-4" />
                New Goal
            </Button>
        </DataTableToolbar>
    );
}
