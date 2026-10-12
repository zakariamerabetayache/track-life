import { fetchAPI } from "@/lib/api";

/**
 * Reminders API layer — pure fetch functions with zero UI logic.
 *
 * Each function maps 1:1 to a backend endpoint. They're consumed by
 * the TanStack Query hooks in use-reminders.js, never called directly
 * from components.
 *
 * Why separate from hooks?
 *  - Testable in isolation (no React required)
 *  - Clear boundary between "how to call the server" and "how to cache the response"
 *  - Easy to swap fetch for axios or a generated client later
 */
export const remindersApi = {
  /**
   * Fetch a paginated, filtered, sorted list of reminders.
   * @param {Object} params - { page, pageSize, search, status, sortBy, sortOrder }
   */
  list: (params = {}) => {
    // Filter out empty strings and undefined values to keep the URL clean
    const cleaned = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== "" && v !== undefined)
    );
    const query = new URLSearchParams(cleaned).toString();
    return fetchAPI(`/reminders${query ? `?${query}` : ""}`);
  },

  /** Fetch a single reminder by ID */
  getOne: (id) => fetchAPI(`/reminders/${id}`),

  /** Create a new reminder */
  create: (data) =>
    fetchAPI("/reminders", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** Update an existing reminder (partial — only send changed fields) */
  update: (id, data) =>
    fetchAPI(`/reminders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /** Permanently delete a reminder */
  remove: (id) =>
    fetchAPI(`/reminders/${id}`, {
      method: "DELETE",
    }),

  /** Toggle or set active status of a reminder */
  toggleStatus: (id, isActive) =>
    fetchAPI(`/reminders/${id}/toggle`, {
      method: "PATCH",
      body: JSON.stringify(isActive !== undefined ? { is_active: isActive } : {}),
    }),
};
