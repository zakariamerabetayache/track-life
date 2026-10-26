
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { goalsApi } from "../api/goals.api";
import { toast } from "sonner";

/**
 * Query key factory — keeps keys consistent across all hooks.
 *
 * Pattern from TanStack Query docs:
 *   ["goals"]             → matches ALL reminder queries (for bulk invalidation)
 *   ["goals", "list", {}] → matches a specific list configuration
 *   ["goals", "detail", id] → matches a specific record
 *
 * Why a factory? Typo-proof, refactor-safe, and grep-able.
 */
export const goalsKeys = {
    all: ["goals"],
    lists: () => [...goalsKeys.all, "list"],
    list: (params) => [...goalsKeys.lists(), params],
    details: () => [...goalsKeys.all, "detail"],
    detail: (id) => [...goalsKeys.details(), id],
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
export function useGoals(params) {
    return useQuery({
        queryKey: goalsKeys.list(params),
        queryFn: () => goalsApi.list(params),
    });
}

// ── Detail hook ────────────────────────────────────────────────────────────────
export function useGoal(id) {
    return useQuery({
        queryKey: goalsKeys.detail(id),
        queryFn: () => goalsApi.getOne(id),
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
export function useCreateGoal({ onSuccess } = {}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => goalsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: goalsKeys.lists() });
            toast.success("Goal created");
            onSuccess?.();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create goal");
        },
    });
}

// ── Update mutation ────────────────────────────────────────────────────────────
export function useUpdateReminder({ onSuccess } = {}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => goalsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: goalsKeys.lists() });
            toast.success("Goal updated");
            onSuccess?.();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update goal");
        },
    });
}

// ── Delete mutation ────────────────────────────────────────────────────────────
export function useDeleteReminder({ onSuccess } = {}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => remindersApi.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: goalsKeys.lists() });
            toast.success("Goal deleted");
            onSuccess?.();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete goal");
        },
    });
}

// ── Toggle status mutation ───────────────────────────────────────────────────
export function useToggleGoalStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, is_active }) => goalsApi.toggleStatus(id, is_active),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: goalsKeys.lists() });
            const nextStatus = res?.data?.is_active;
            toast.success(nextStatus ? "Goal activated" : "Goal deactivated");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update goal status");
        },
    });
}

