"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const todayInsightKey = ["today-insight"];
export const dailyInsightsKey = ["daily-insights"];

// ── Today's insight ───────────────────────────────────────────────────────────
export function useTodayInsight(day) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...todayInsightKey, day ?? "today"],
    queryFn:  () => api.getTodayInsight(day),
    staleTime: 60_000,
  });

  return {
    weekId:      data?.data?.week_id      ?? null,
    dayOfWeek:   day ?? data?.data?.day_of_week ?? new Date().getDay(),
    insight:     data?.data?.insight      ?? null,
    sleep_data:  data?.data?.sleep_data   ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}

// ── Upsert (partial — only the fields you send are changed) ───────────────────
export function useUpsertInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => api.upsertDailyInsight(payload),

    onSuccess: (response) => {
      // Patch matching day insight cache immediately
      queryClient.setQueriesData({ queryKey: todayInsightKey }, (old) => {
        if (!old?.data) return old;
        if (
          old.data.week_id !== response.data?.week_id ||
          old.data.day_of_week !== response.data?.day_of_week
        ) {
          return old;
        }
        return {
          ...old,
          data: {
            ...old.data,
            sleep_data: response.data?.sleep_data ?? old.data?.sleep_data,
            insight: response.data,
          },
        };
      });
      queryClient.invalidateQueries({ queryKey: todayInsightKey });
      queryClient.invalidateQueries({ queryKey: dailyInsightsKey });
      queryClient.invalidateQueries({ queryKey: ["today-goals"] });
    },

    onError: (err) => {
      toast.error(err?.message ?? "Failed to save insight");
    },
  });
}

// ── Paginated list (for /daily_insights page) ─────────────────────────────────
export function useDailyInsights(params = {}) {
  return useQuery({
    queryKey: [...dailyInsightsKey, params],
    queryFn:  () => api.getDailyInsights(params),
    staleTime: 30_000,
  });
}

// ── Delete ────────────────────────────────────────────────────────────────────
export function useDeleteInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.deleteDailyInsight(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dailyInsightsKey });
      toast.success("Insight deleted");
    },
    onError: (err) => toast.error(err?.message ?? "Failed to delete"),
  });
}
