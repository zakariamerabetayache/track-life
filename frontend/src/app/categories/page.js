"use client";

import { useState, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { CategoriesTable } from "@/features/categories/components/categories-table";
import { CategoryFormDialog } from "@/features/categories/components/category-form-dialog";
import { DeleteCategoryDialog } from "@/features/categories/components/delete-category-dialog";
import CrudsHeader from "@/components/CrudsHeader";

/**
 * CategoriesPage — the orchestrator for Categories CRUD.
 *
 * Full parity with Reminders and Goals:
 * - Server-side pagination, search, and sorting
 * - Debounced search input
 * - TanStack Query caching and mutations
 * - Reusable DataTable with pagination
 * - Separate declarative Form & Delete Dialogs
 */
export default function CategoriesPage() {
  // ── Table state ─────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("sort_order");
  const [sortOrder, setSortOrder] = useState("asc");

  // ── Dialog state ────────────────────────────────────────────────────────────
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ── Debounced search ────────────────────────────────────────────────────────
  const debouncedSearch = useDebounce(search, 300);

  // ── Build query params ──────────────────────────────────────────────────────
  const queryParams = {
    page: page.toString(),
    pageSize: pageSize.toString(),
    search: debouncedSearch,
    sortBy,
    sortOrder,
  };

  // ── Fetch data ──────────────────────────────────────────────────────────────
  const { data: response, isLoading, isError, refetch } = useCategories(queryParams);

  const categories = response?.data || [];
  const meta = response?.meta || { page: 1, pageSize: 10, total: 0, totalPages: 1 };

  // ── Callbacks ───────────────────────────────────────────────────────────────
  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleSort = useCallback((newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
  }, []);

  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  const handleCreateNew = useCallback(() => {
    setSelectedCategory(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((category) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback((category) => {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <CrudsHeader
        title="Categories"
        description="Organize your goals into distinct colored categories"
      />

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <CategoriesTable
          data={categories}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          meta={meta}
          search={search}
          onSearchChange={handleSearchChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>

      {/* ── Dialogs ────────────────────────────────────────────────────────── */}
      <CategoryFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        category={selectedCategory}
      />

      <DeleteCategoryDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        category={selectedCategory}
      />
    </div>
  );
}
