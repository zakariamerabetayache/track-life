const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `API Error: ${res.status}`);
  }

  return res.json();
}

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
