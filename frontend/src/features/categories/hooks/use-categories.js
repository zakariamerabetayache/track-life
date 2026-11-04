import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "../api/categories.api";
import { toast } from "sonner";

/**
 * Query key factory — keeps keys consistent across all hooks.
 */
export const categoryKeys = {
  all: ["categories"],
  lists: () => [...categoryKeys.all, "list"],
  list: (params) => [...categoryKeys.lists(), params],
  details: () => [...categoryKeys.all, "detail"],
  detail: (id) => [...categoryKeys.details(), id],
};

// ── List hook ──────────────────────────────────────────────────────────────────
export function useCategories(params) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoriesApi.list(params),
  });
}

// ── Detail hook ────────────────────────────────────────────────────────────────
export function useCategory(id) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoriesApi.getOne(id),
    enabled: !!id,
  });
}

// ── Create mutation ────────────────────────────────────────────────────────────
export function useCreateCategory({ onSuccess } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => categoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Category created");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create category");
    },
  });
}

// ── Update mutation ────────────────────────────────────────────────────────────
export function useUpdateCategory({ onSuccess } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Category updated");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update category");
    },
  });
}

// ── Delete mutation ────────────────────────────────────────────────────────────
export function useDeleteCategory({ onSuccess } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => categoriesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Category deleted");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete category");
    },
  });
}

