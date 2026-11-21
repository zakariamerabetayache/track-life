"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ── Query key ──────────────────────────────────────────────────────────────────
export const todayGoalsKey = ["today-goals"];

// ── Prayer period metadata ─────────────────────────────────────────────────────
export const PRAYER_META = {
  fajr:    { name: "Fajr",    badge: "Dawn",      borderColor: "#2d6a4f", bgColor: "#0d2318", titleColor: "#6ee7b7", badgeBg: "#14532d", badgeText: "#6ee7b7" },
  dhuhr:   { name: "Dhuhr",   badge: "Midday",    borderColor: "#854d0e", bgColor: "#1c1200", titleColor: "#fcd34d", badgeBg: "#713f12", badgeText: "#fcd34d" },
  asr:     { name: "Asr",     badge: "Afternoon", borderColor: "#9a3412", bgColor: "#1a0d04", titleColor: "#fb923c", badgeBg: "#7c2d12", badgeText: "#fb923c" },
  maghrib: { name: "Maghrib", badge: "Sunset",    borderColor: "#9f1239", bgColor: "#1a0511", titleColor: "#fda4af", badgeBg: "#881337", badgeText: "#fda4af" },
  isha:    { name: "Isha",    badge: "Night",     borderColor: "#3730a3", bgColor: "#0d0b1f", titleColor: "#a5b4fc", badgeBg: "#312e81", badgeText: "#a5b4fc" },
};

export const PRAYER_ORDER = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

// ── Transform raw API response into dashboard-ready shape ─────────────────────
function transformDayGoals(rawDayGoals = []) {
  const prayerGoals = rawDayGoals.filter((dg) => dg.prayer_time !== null);
  const habitGoals  = rawDayGoals.filter((dg) => dg.prayer_time === null);

  // Prayer periods — fixed prayer is always first (is_auto: true)
  const prayerPeriods = PRAYER_ORDER.map((key) => {
    const meta  = PRAYER_META[key];
    const items = prayerGoals
      .filter((dg) => dg.prayer_time?.toLowerCase() === key)
      .map((dg) => ({
        dayGoalId:  dg.id,
        goalId:     dg.goal_id,
        label:      dg.goal.title,
        timesADay:  dg.goal.times_a_day ?? 1,
        done:       (dg.completions?.length ?? 0) >= (dg.goal.times_a_day ?? 1),
        completions: dg.completions ?? [],
        isFixed:    dg.is_auto || dg.goal.is_fixed,  // cannot be deleted
      }));

    return { key, ...meta, items };
  });

  // Habits — no prayer time
  const habits = habitGoals.map((dg) => ({
    dayGoalId:  dg.id,
    goalId:     dg.goal_id,
    label:      dg.goal.title,
    timesADay:  dg.goal.times_a_day ?? 1,
    done:       (dg.completions?.length ?? 0) >= (dg.goal.times_a_day ?? 1),
    completions: dg.completions ?? [],
    streak:     dg.streak ?? 0,
    barColor:   dg.goal.category?.color ?? "#475569",
    isFixed:    dg.is_auto || dg.goal.is_fixed,
  }));

  // Overall progress
  let totalSlots = 0, doneSlots = 0;
  for (const dg of rawDayGoals) {
    const times = dg.goal.times_a_day ?? 1;
    totalSlots += times;
    doneSlots  += Math.min(dg.completions?.length ?? 0, times);
  }
  const progress = totalSlots > 0 ? Math.round((doneSlots / totalSlots) * 100) : 0;

  return { prayerPeriods, habits, progress };
}

// ── Main hook ─────────────────────────────────────────────────────────────────
export function useTodayGoals() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: todayGoalsKey,
    queryFn:  () => api.getTodayGoals(),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const rawDayGoals = data?.data?.day_goals ?? [];
  const weekId      = data?.data?.week_id   ?? null;
  const dayOfWeek   = data?.data?.day_of_week ?? new Date().getDay();
  const sleepData   = data?.data?.sleep_data  ?? null;

  const { prayerPeriods, habits, progress } = transformDayGoals(rawDayGoals);

  return {
    prayerPeriods,
    habits,
    progress,
    weekId,
    dayOfWeek,
    sleepData,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}

// ── Toggle completion ─────────────────────────────────────────────────────────
export function useToggleCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ dayGoalId, occurrenceIndex, isCompleted }) =>
      api.toggleCompletion({
        day_goal_id:      dayGoalId,
        occurrence_index: occurrenceIndex,
        is_completed:     isCompleted,
      }),

    onMutate: async ({ dayGoalId, occurrenceIndex, isCompleted }) => {
      await queryClient.cancelQueries({ queryKey: todayGoalsKey });
      const previous = queryClient.getQueryData(todayGoalsKey);

      queryClient.setQueryData(todayGoalsKey, (old) => {
        if (!old?.data?.day_goals) return old;
        return {
          ...old,
          data: {
            ...old.data,
            day_goals: old.data.day_goals.map((dg) => {
              if (dg.id !== dayGoalId) return dg;
              const completions = isCompleted
                ? [...(dg.completions ?? []), { id: Date.now(), occurrence_index: occurrenceIndex }]
                : (dg.completions ?? []).filter((c) => c.occurrence_index !== occurrenceIndex);
              return { ...dg, completions };
            }),
          },
        };
      });

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(todayGoalsKey, ctx.previous);
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: todayGoalsKey }),
  });
}

// ── Add a goal to a prayer period or habit section ────────────────────────────
// prayerTime: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha" | null (habit)
export function useAddGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ weekId, dayOfWeek, prayerTime, title }) =>
      api.addDayGoal({
        week_id:    weekId,
        day_of_week: dayOfWeek,
        prayer_time: prayerTime ?? null,
        new_goal:   { title },
      }),

    onSuccess: () => queryClient.invalidateQueries({ queryKey: todayGoalsKey }),
    onError: (err) => console.error("Add goal failed:", err.message),
  });
}

// ── Delete a non-fixed day goal ───────────────────────────────────────────────
export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dayGoalId) => api.removeDayGoal(dayGoalId),

    onMutate: async (dayGoalId) => {
      await queryClient.cancelQueries({ queryKey: todayGoalsKey });
      const previous = queryClient.getQueryData(todayGoalsKey);

      queryClient.setQueryData(todayGoalsKey, (old) => {
        if (!old?.data?.day_goals) return old;
        return {
          ...old,
          data: {
            ...old.data,
            day_goals: old.data.day_goals.filter((dg) => dg.id !== dayGoalId),
          },
        };
      });

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(todayGoalsKey, ctx.previous);
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: todayGoalsKey }),
  });
}
