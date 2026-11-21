"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ── Query key ──────────────────────────────────────────────────────────────────
export const todayGoalsKey = ["today-goals"];

// ── Prayer period metadata ─────────────────────────────────────────────────────
// Defines the visual style and label for each of the 5 prayer periods.
// Goals are associated with a period via their `prayer_time` field on DayGoal.
export const PRAYER_META = {
  fajr: {
    name: "Fajr",
    badge: "Dawn",
    borderColor: "#2d6a4f",
    bgColor: "#0d2318",
    titleColor: "#6ee7b7",
    badgeBg: "#14532d",
    badgeText: "#6ee7b7",
  },
  dhuhr: {
    name: "Dhuhr",
    badge: "Midday",
    borderColor: "#854d0e",
    bgColor: "#1c1200",
    titleColor: "#fcd34d",
    badgeBg: "#713f12",
    badgeText: "#fcd34d",
  },
  asr: {
    name: "Asr",
    badge: "Afternoon",
    borderColor: "#9a3412",
    bgColor: "#1a0d04",
    titleColor: "#fb923c",
    badgeBg: "#7c2d12",
    badgeText: "#fb923c",
  },
  maghrib: {
    name: "Maghrib",
    badge: "Sunset",
    borderColor: "#9f1239",
    bgColor: "#1a0511",
    titleColor: "#fda4af",
    badgeBg: "#881337",
    badgeText: "#fda4af",
  },
  isha: {
    name: "Isha",
    badge: "Night",
    borderColor: "#3730a3",
    bgColor: "#0d0b1f",
    titleColor: "#a5b4fc",
    badgeBg: "#312e81",
    badgeText: "#a5b4fc",
  },
};

const PRAYER_ORDER = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

// ── Transform raw API response into dashboard-ready shape ─────────────────────
function transformDayGoals(rawDayGoals = []) {
  // Separate prayer-linked goals from free-floating habits
  const prayerGoals = rawDayGoals.filter((dg) => dg.prayer_time !== null);
  const habitGoals  = rawDayGoals.filter((dg) => dg.prayer_time === null);

  // ── Build prayer period objects ───────────────────────────────────────────
  const prayerPeriods = PRAYER_ORDER.map((key) => {
    const meta = PRAYER_META[key];
    const items = prayerGoals
      .filter((dg) => dg.prayer_time?.toLowerCase() === key)
      .map((dg) => ({
        dayGoalId: dg.id,
        goalId:    dg.goal_id,
        label:     dg.goal.title,
        timesADay: dg.goal.times_a_day ?? 1,
        // For single-occurrence goals, done = at least 1 completion
        done:      (dg.completions?.length ?? 0) >= (dg.goal.times_a_day ?? 1),
        completions: dg.completions ?? [],
      }));

    return { key, ...meta, items };
  });

  // ── Build habit objects ───────────────────────────────────────────────────
  const habits = habitGoals.map((dg) => ({
    dayGoalId: dg.id,
    goalId:    dg.goal_id,
    label:     dg.goal.title,
    timesADay: dg.goal.times_a_day ?? 1,
    done:      (dg.completions?.length ?? 0) >= (dg.goal.times_a_day ?? 1),
    completions: dg.completions ?? [],
    streak:    dg.streak ?? 0,
    // Use the category color if available, fall back to slate
    barColor:  dg.goal.category?.color ?? "#475569",
  }));

  // ── Overall progress ──────────────────────────────────────────────────────
  let totalSlots = 0;
  let doneSlots  = 0;
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
    // Refetch every 60 s so the dashboard stays fresh without manual refresh
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const rawDayGoals = data?.data?.day_goals ?? [];
  const weekId      = data?.data?.week_id ?? null;
  const dayOfWeek   = data?.data?.day_of_week ?? new Date().getDay();

  const { prayerPeriods, habits, progress } = transformDayGoals(rawDayGoals);

  return {
    prayerPeriods,
    habits,
    progress,
    weekId,
    dayOfWeek,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}

// ── Toggle completion mutation ─────────────────────────────────────────────────
export function useToggleCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ dayGoalId, occurrenceIndex, isCompleted }) =>
      api.toggleCompletion({
        day_goal_id:      dayGoalId,
        occurrence_index: occurrenceIndex,
        is_completed:     isCompleted,
      }),

    // Optimistic update — flip the checkbox instantly, then confirm from server
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

    // On error, roll back
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(todayGoalsKey, ctx.previous);
      }
    },

    // Always refetch to sync with server truth
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todayGoalsKey });
    },
  });
}
