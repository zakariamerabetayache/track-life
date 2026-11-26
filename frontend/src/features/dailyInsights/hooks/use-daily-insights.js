"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const todayInsightKey = ["today-insight"];
export const dailyInsightsKey = ["daily-insights"];

// ── Today's insight ───────────────────────────────────────────────────────────
export function useTodayInsight() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: todayInsightKey,
    queryFn:  () => api.getTodayInsight(),
    staleTime: 60_000,
  });

  return {
    weekId:      data?.data?.week_id      ?? null,
    dayOfWeek:   data?.data?.day_of_week  ?? new Date().getDay(),
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
      // Patch today cache directly so the UI reflects saved values immediately
      queryClient.setQueryData(todayInsightKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            sleep_data: response.data?.sleep_data ?? old.data?.sleep_data,
            insight: response.data,
          },
        };
      });
      queryClient.invalidateQueries({ queryKey: dailyInsightsKey });
    },

    onError: (err) => {
      toast.error(err?.message ?? "Failed to save insight");
    },
  });
}

// ── Paginated list (for /daily_insights page) ─────────────────────────────────
export function useDailyInsights(params = {}) {
  return useQuery({
    queryKey: [dailyInsightsKey, params],
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
