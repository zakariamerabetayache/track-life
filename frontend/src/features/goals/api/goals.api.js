import { fetchAPI } from "@/lib/api";

/**
 * goals API layer — pure fetch functions with zero UI logic.
 *
 * Each function maps 1:1 to a backend endpoint. They're consumed by
 * the TanStack Query hooks in use-goals.js, never called directly
 * from components.
 *
 * Why separate from hooks?
 *  - Testable in isolation (no React required)
 *  - Clear boundary between "how to call the server" and "how to cache the response"
 *  - Easy to swap fetch for axios or a generated client later
 */
export const GoalsApi = {
    /**
     * Fetch a paginated, filtered, sorted list of goals.
     * @param {Object} params - { page, pageSize, search, status, sortBy, sortOrder }
     */
    list: (params = {}) => {
        // Filter out empty strings and undefined values to keep the URL clean
        const cleaned = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== "" && v !== undefined)
        );
        const query = new URLSearchParams(cleaned).toString();
        return fetchAPI(`/goals${query ? `?${query}` : ""}`);
    },

    /** Fetch a single goal by ID */
    getOne: (id) => fetchAPI(`/goals/${id}`),

    /** Create a new goal */
    create: (data) =>
        fetchAPI("/goals", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    /** Update an existing goal (partial — only send changed fields) */
    update: (id, data) =>
        fetchAPI(`/goals/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    /** Permanently delete a goal */
    remove: (id) =>
        fetchAPI(`/goals/${id}`, {
            method: "DELETE",
        }),

    /** Toggle or set active status of a goal */
    toggleStatus: (id, isActive) =>
        fetchAPI(`/goals/${id}/toggle`, {
            method: "PATCH",
            body: JSON.stringify(isActive !== undefined ? { is_active: isActive } : {}),
        }),
};
