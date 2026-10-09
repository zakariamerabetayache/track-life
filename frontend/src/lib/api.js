const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Central API client — every request flows through here.
 *
 * Responsibilities:
 *  1. Prepend the base URL
 *  2. Set JSON headers
 *  3. Parse the response
 *  4. Throw a structured error on non-2xx responses
 *
 * The thrown error object carries `status`, `message`, and `errors` (field-level)
 * so the UI can display server validation messages on the correct form fields.
 */
class ApiError extends Error {
  constructor(status, message, errors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors; // { field: ["error message"] } — from Zod on the server
  }
}

export async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  // Try to parse JSON regardless of status — the server always returns JSON
  const json = await res.json().catch(() => ({
    message: 'Network error — could not reach the server',
  }));

  if (!res.ok) {
    throw new ApiError(
      res.status,
      json.message || `Request failed (${res.status})`,
      json.errors || {}
    );
  }

  return json;
}

// ── Convenience exports ────────────────────────────────────────────────────────
// These keep API calls readable and consistent across the codebase.
// Each resource module (reminders.api.js, etc.) imports fetchAPI directly.

export const api = {
  // Weeks
  getCurrentWeek: () => fetchAPI('/weeks/current'),
  navigateWeek: (year, week, direction) =>
    fetchAPI(`/weeks/navigate?year=${year}&week=${week}&direction=${direction}`),
  getWeek: (year, week) => fetchAPI(`/weeks/${year}/${week}`),

  // Goals
  getGoals: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/goals${query ? '?' + query : ''}`);
  },
  createGoal: (data) =>
    fetchAPI('/goals', { method: 'POST', body: JSON.stringify(data) }),
  updateGoal: (id, data) =>
    fetchAPI(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteGoal: (id) =>
    fetchAPI(`/goals/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => fetchAPI('/categories'),
  createCategory: (data) =>
    fetchAPI('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) =>
    fetchAPI(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) =>
    fetchAPI(`/categories/${id}`, { method: 'DELETE' }),

  // Day Goals
  addDayGoal: (data) =>
    fetchAPI('/day-goals', { method: 'POST', body: JSON.stringify(data) }),
  removeDayGoal: (id) =>
    fetchAPI(`/day-goals/${id}`, { method: 'DELETE' }),
  updateDayGoal: (id, data) =>
    fetchAPI(`/day-goals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Completions
  toggleCompletion: (data) =>
    fetchAPI('/completions/toggle', { method: 'POST', body: JSON.stringify(data) }),
};
