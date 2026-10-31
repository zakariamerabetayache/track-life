"use client";

import { useState, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useGoals, useToggleGoalStatus } from "@/features/goals/hooks/use-goals";
import { GoalsTable } from "@/features/goals/components/goals-table";
import { GoalFormDialog } from "@/features/goals/components/goal-form-dialog";
import { DeleteGoalDialog } from "@/features/goals/components/delete-goal-dialog";
import CrudsHeader from "@/components/CrudsHeader";

/**
 * goalsPage — the orchestrator.
 *
 * Owns ALL state (table params, dialog visibility, selected goal).
 * Child components are stateless — they receive values and call callbacks.
 *
 * This pattern (lifting state up to the page) makes the entire flow
 * predictable: one place to look for what's happening, one place to debug.
 *
 * State flow:
 *   page state → useGoals(params) → data/meta → GoalsTable → columns/toolbar/pagination
 *   user action → callback → setState → params change → useGoals refetches automatically
 */
export default function GoalsPage() {
  // ── Table state ─────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // ── Dialog state ────────────────────────────────────────────────────────────
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  // ── Debounced search ────────────────────────────────────────────────────────
  // Raw `search` updates instantly (so the input feels responsive),
  // but `debouncedSearch` only updates after 300ms of inactivity.
  // The query uses debouncedSearch, so the API isn't called on every keystroke.
  const debouncedSearch = useDebounce(search, 300);

  // ── Build query params ──────────────────────────────────────────────────────
  const queryParams = {
    page: page.toString(),
    pageSize: pageSize.toString(),
    search: debouncedSearch,
    status,
    sortBy,
    sortOrder,
  };

  // ── Fetch data ──────────────────────────────────────────────────────────────
  const { data: response, isLoading, isError, refetch } = useGoals(queryParams);

  const goals = response?.data || [];
  const meta = response?.meta || { page: 1, pageSize: 10, total: 0, totalPages: 1 };

  // ── Callbacks ───────────────────────────────────────────────────────────────
  // useCallback is used here not for premature optimization but because these
  // are passed as props — stable references prevent unnecessary child re-renders.

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    setPage(1); // Reset to page 1 when search changes
  }, []);

  const handleStatusChange = useCallback((value) => {
    setStatus(value);
    setPage(1); // Reset to page 1 when filter changes
  }, []);

  const handleSort = useCallback((newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1); // Reset to page 1 when sort changes
  }, []);

  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
    setPage(1); // Reset to page 1 when page size changes
  }, []);

  const handleCreateNew = useCallback(() => {
    setSelectedGoal(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((goal) => {
    setSelectedGoal(goal);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback((goal) => {
    setSelectedGoal(goal);
    setIsDeleteOpen(true);
  }, []);

  const toggleStatusMutation = useToggleGoalStatus();

  const handleToggleStatus = useCallback((goal, nextChecked) => {
    if (!goal?.id) return;
    toggleStatusMutation.mutate({
      id: goal.id,
      is_active: nextChecked,
    });
  }, [toggleStatusMutation]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <CrudsHeader title="Goals" description="Manage Goals" />

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <GoalsTable
          data={goals}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          meta={meta}
          search={search}
          onSearchChange={handleSearchChange}
          status={status}
          onStatusChange={handleStatusChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      </main>

      {/* ── Dialogs ────────────────────────────────────────────────────────── */}
      <GoalFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        goal={selectedGoal}
      />

      <DeleteGoalDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        goal={selectedGoal}
      />
    </div>
  );
}
