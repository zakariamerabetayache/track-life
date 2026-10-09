import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { remindersApi } from "../api/reminders.api";
import { toast } from "sonner";

/**
 * Query key factory — keeps keys consistent across all hooks.
 *
 * Pattern from TanStack Query docs:
 *   ["reminders"]             → matches ALL reminder queries (for bulk invalidation)
 *   ["reminders", "list", {}] → matches a specific list configuration
 *   ["reminders", "detail", id] → matches a specific record
 *
 * Why a factory? Typo-proof, refactor-safe, and grep-able.
 */
export const reminderKeys = {
  all: ["reminders"],
  lists: () => [...reminderKeys.all, "list"],
  list: (params) => [...reminderKeys.lists(), params],
  details: () => [...reminderKeys.all, "detail"],
  detail: (id) => [...reminderKeys.details(), id],
};

// ── List hook ──────────────────────────────────────────────────────────────────
/**
 * Fetches a paginated, filtered, sorted list of reminders.
 *
 * The query key includes all params, so changing page/search/sort/filter
 * automatically triggers a refetch — no manual refetch() needed.
 *
 * placeholderData is set globally in the QueryClient (providers.jsx)
 * to keep previous data visible while the new page loads.
 */
export function useReminders(params) {
  return useQuery({
    queryKey: reminderKeys.list(params),
    queryFn: () => remindersApi.list(params),
  });
}

// ── Detail hook ────────────────────────────────────────────────────────────────
export function useReminder(id) {
  return useQuery({
    queryKey: reminderKeys.detail(id),
    queryFn: () => remindersApi.getOne(id),
    enabled: !!id, // Don't fetch until we have an ID
  });
}

// ── Create mutation ────────────────────────────────────────────────────────────
/**
 * After a successful create:
 *  1. Invalidate all list queries so the table shows the new record
 *  2. Show a success toast
 *  3. Call the optional onSuccess callback (to close the dialog)
 *
 * On error: show the server's error message in a toast.
 * The form component also receives the error to map field-level validation
 * messages back to the inputs.
 */
export function useCreateReminder({ onSuccess } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => remindersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
      toast.success("Reminder created");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create reminder");
    },
  });
}

// ── Update mutation ────────────────────────────────────────────────────────────
export function useUpdateReminder({ onSuccess } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => remindersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
      toast.success("Reminder updated");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update reminder");
    },
  });
}

// ── Delete mutation ────────────────────────────────────────────────────────────
export function useDeleteReminder({ onSuccess } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => remindersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
      toast.success("Reminder deleted");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete reminder");
    },
  });
}
