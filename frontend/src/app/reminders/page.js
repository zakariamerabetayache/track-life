"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { useReminders, useToggleReminderStatus } from "@/features/reminders/hooks/use-reminders";
import { RemindersTable } from "@/features/reminders/components/reminders-table";
import { ReminderFormDialog } from "@/features/reminders/components/reminder-form-dialog";
import { DeleteReminderDialog } from "@/features/reminders/components/delete-reminder-dialog";

/**
 * RemindersPage — the orchestrator.
 *
 * Owns ALL state (table params, dialog visibility, selected reminder).
 * Child components are stateless — they receive values and call callbacks.
 *
 * This pattern (lifting state up to the page) makes the entire flow
 * predictable: one place to look for what's happening, one place to debug.
 *
 * State flow:
 *   page state → useReminders(params) → data/meta → RemindersTable → columns/toolbar/pagination
 *   user action → callback → setState → params change → useReminders refetches automatically
 */
export default function RemindersPage() {
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
  const [selectedReminder, setSelectedReminder] = useState(null);

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
  const { data: response, isLoading, isError, refetch } = useReminders(queryParams);

  const reminders = response?.data || [];
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
    setSelectedReminder(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((reminder) => {
    setSelectedReminder(reminder);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback((reminder) => {
    setSelectedReminder(reminder);
    setIsDeleteOpen(true);
  }, []);

  const toggleStatusMutation = useToggleReminderStatus();

  const handleToggleStatus = useCallback((reminder, nextChecked) => {
    if (!reminder?.id) return;
    toggleStatusMutation.mutate({
      id: reminder.id,
      is_active: nextChecked,
    });
  }, [toggleStatusMutation]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-border/40 px-4 py-4 sticky top-0 bg-background/80 backdrop-blur-lg z-10">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" aria-label="Back to home">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Reminders</h1>
            <p className="text-sm text-muted-foreground">
              Manage your reminders and notifications
            </p>
          </div>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <RemindersTable
          data={reminders}
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
      <ReminderFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        reminder={selectedReminder}
      />

      <DeleteReminderDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        reminder={selectedReminder}
      />
    </div>
  );
}
