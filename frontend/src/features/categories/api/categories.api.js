import { fetchAPI } from "@/lib/api";

/**
 * Categories API layer — pure fetch functions with zero UI logic.
 *
 * Each function maps 1:1 to a backend endpoint. They're consumed by
 * the TanStack Query hooks in use-categories.js, never called directly
 * from components.
 */
export const categoriesApi = {
  /**
   * Fetch a paginated, filtered, sorted list of categories.
   * @param {Object} params - { page, pageSize, search, sortBy, sortOrder, all }
   */
  list: (params = {}) => {
    const cleaned = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== "" && v !== undefined)
    );
    const query = new URLSearchParams(cleaned).toString();
    return fetchAPI(`/categories${query ? `?${query}` : ""}`);
  },

  /** Fetch a single category by ID */
  getOne: (id) => fetchAPI(`/categories/${id}`),

  /** Create a new category */
  create: (data) =>
    fetchAPI("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** Update an existing category */
  update: (id, data) =>
    fetchAPI(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /** Permanently delete a category */
  remove: (id) =>
    fetchAPI(`/categories/${id}`, {
      method: "DELETE",
    }),
};

