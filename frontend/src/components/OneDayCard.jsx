"use client";

import React, { useMemo } from "react";
import { Sun, Moon, Target, Plus, AlertCircle, RefreshCw } from "lucide-react";
import { Check } from "lucide-react";
import { useTodayGoals, useToggleCompletion } from "@/features/weekDashBoard/hooks/use-today-goals";

// ── Static anchors (wake-up / sleep not yet in DB) ────────────────────────────
const WAKE_UP = "05:15 AM";
const SLEEP_TARGET = "10:30 PM";
const SLEEP_GOAL = "7h 15m";

// ── Loading skeleton ──────────────────────────────────────────────────────────
function PeriodSkeleton() {
  return (
    <div
      className="rounded-xl flex flex-col overflow-hidden animate-pulse"
      style={{ background: "#111827", border: "1.5px solid #1f2937" }}
    >
      <div className="flex items-center justify-between px-3 pt-3 pb-2.5" style={{ borderBottom: "1px solid #1f293740" }}>
        <div className="h-4 w-14 rounded" style={{ background: "#1e293b" }} />
        <div className="h-4 w-10 rounded-full" style={{ background: "#1e293b" }} />
      </div>
      <div className="flex flex-col gap-2.5 px-3 pt-3 pb-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-sm shrink-0" style={{ background: "#1e293b" }} />
            <div className="h-3 rounded flex-1" style={{ background: "#1e293b" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Custom checkbox ───────────────────────────────────────────────────────────
function Checkbox({ checked, onClick }) {
  return (
    <div
      onClick={onClick}
      className="h-4 w-4 rounded-sm shrink-0 flex items-center justify-center transition-all cursor-pointer"
      style={
        checked
          ? { background: "#10b981", border: "1.5px solid #34d399" }
          : { background: "transparent", border: "1.5px solid #475569" }
      }
    >
      {checked && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function OneDayCard() {
  const { prayerPeriods, habits, progress, isLoading, error, refetch } = useTodayGoals();
  const toggleMutation = useToggleCompletion();

  // Today label
  const today = useMemo(
    () => new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    []
  );

  // Circular SVG ring
  const R = 42;
  const C = 2 * Math.PI * R;
  const offset = C - (progress / 100) * C;

  // Handler — toggles occurrence_index 0 (single-occurrence goals)
  const handleToggle = (dayGoalId, currentDone) => {
    toggleMutation.mutate({
      dayGoalId,
      occurrenceIndex: 0,
      isCompleted: !currentDone,
    });
  };

  return (
    <div
      className="h-screen w-full overflow-hidden flex flex-col p-4 sm:p-5 gap-4"
      style={{ background: "#0B0F17", color: "#f1f5f9", fontFamily: "inherit" }}
    >

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <div
        className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4 shrink-0"
        style={{ background: "#111827", border: "1px solid #1f2937" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "#1e293b", border: "1px solid #334155" }}
          >
            <Target className="h-4 w-4" style={{ color: "#22d3ee" }} />
          </div>
          <span className="text-base font-bold tracking-tight text-white">Track Life</span>
        </div>

        {/* Date */}
        <span className="text-base font-medium" style={{ color: "#cbd5e1" }}>{today}</span>

        {/* Progress Ring */}
        <div className="relative shrink-0" style={{ width: 80, height: 80 }}>
          <svg width="80" height="80" viewBox="0 0 96 96" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="48" cy="48" r={R} strokeWidth="6" fill="none" stroke="#1e293b" />
            <circle
              cx="48" cy="48" r={R}
              strokeWidth="6" fill="none"
              stroke="#22d3ee"
              strokeDasharray={C}
              strokeDashoffset={isLoading ? C : offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-lg font-black text-white leading-none">
              {isLoading ? "—" : `${progress}%`}
            </span>
            <span className="text-[9px] mt-0.5" style={{ color: "#64748b", letterSpacing: "0.07em" }}>
              Completed
            </span>
          </div>
        </div>
      </div>

      {/* ══ QUICK ANCHORS ═══════════════════════════════════════════════════ */}
      <div className="shrink-0">
        <p className="text-xs font-semibold uppercase mb-2" style={{ color: "#475569", letterSpacing: "0.1em" }}>
          Quick Anchors
        </p>
        <div className="flex flex-wrap gap-3">

          {/* Wake Up */}
          <div
            className="flex items-center gap-3 rounded-full px-4 py-2"
            style={{ background: "#1c1200", border: "1px solid #854d0e" }}
          >
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "#451a03" }}
            >
              <Sun className="h-3.5 w-3.5" style={{ color: "#fbbf24" }} />
            </div>
            <span className="text-sm" style={{ color: "#94a3b8" }}>Wake Up:</span>
            <span className="text-sm font-bold text-white">{WAKE_UP}</span>
          </div>

          {/* Sleep Target */}
          <div
            className="flex items-center gap-3 rounded-full px-4 py-2"
            style={{ background: "#0d0b1f", border: "1px solid #3730a3" }}
          >
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "#1e1b4b" }}
            >
              <Moon className="h-3.5 w-3.5" style={{ color: "#818cf8" }} />
            </div>
            <span className="text-sm" style={{ color: "#94a3b8" }}>Sleep Target:</span>
            <span className="text-sm font-bold text-white">{SLEEP_TARGET}</span>
            <div style={{ width: 1, height: 14, background: "#3730a3", margin: "0 4px" }} />
            <span className="text-sm" style={{ color: "#94a3b8" }}>Goal:</span>
            <span className="text-sm font-semibold text-white">{SLEEP_GOAL}</span>
          </div>

        </div>
      </div>

      {/* ══ DAILY FLOW ══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-2 shrink-0">
          <p className="text-xs font-semibold uppercase" style={{ color: "#475569", letterSpacing: "0.1em" }}>
            Daily Flow
          </p>
          {error && (
            <button
              onClick={refetch}
              className="flex items-center gap-1 text-xs"
              style={{ color: "#ef4444" }}
            >
              <RefreshCw className="h-3 w-3" /> Retry
            </button>
          )}
        </div>

        {/* Error state */}
        {error && !isLoading && (
          <div
            className="flex-1 flex flex-col items-center justify-center gap-3 rounded-xl"
            style={{ background: "#111827", border: "1px solid #7f1d1d" }}
          >
            <AlertCircle className="h-8 w-8" style={{ color: "#ef4444" }} />
            <p className="text-sm" style={{ color: "#94a3b8" }}>{error}</p>
            <button
              onClick={refetch}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ background: "#1e293b", color: "#cbd5e1" }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && !error && (
          <div className="grid grid-cols-5 gap-3 flex-1 min-h-0">
            {[1, 2, 3, 4, 5].map((i) => <PeriodSkeleton key={i} />)}
          </div>
        )}

        {/* Data state */}
        {!isLoading && !error && (
          <div className="grid grid-cols-5 gap-3 flex-1 min-h-0">
            {prayerPeriods.map((period) => (
              <div
                key={period.key}
                className="rounded-xl flex flex-col overflow-hidden"
                style={{
                  background: period.bgColor,
                  border: `1.5px solid ${period.borderColor}`,
                }}
              >
                {/* Card header */}
                <div
                  className="flex items-center justify-between px-3 pt-3 pb-2.5 shrink-0"
                  style={{ borderBottom: `1px solid ${period.borderColor}40` }}
                >
                  <span className="text-base font-bold" style={{ color: period.titleColor }}>
                    {period.name}
                  </span>
                  <span
                    className="text-[10px] font-semibold rounded-full px-2.5 py-0.5"
                    style={{ background: period.badgeBg, color: period.badgeText }}
                  >
                    {period.badge}
                  </span>
                </div>

                {/* Items */}
                <div className="flex flex-col gap-2 px-3 pt-2.5 flex-1 overflow-y-auto pb-2">
                  {period.items.length === 0 ? (
                    <p className="text-xs" style={{ color: "#475569" }}>No goals yet</p>
                  ) : (
                    period.items.map((item) => (
                      <div
                        key={item.dayGoalId}
                        className="flex items-center gap-2 group"
                        onClick={() => handleToggle(item.dayGoalId, item.done)}
                      >
                        <Checkbox checked={item.done} />
                        <span
                          className="text-sm leading-snug transition-colors"
                          style={{ color: item.done ? "#e2e8f0" : "#64748b" }}
                        >
                          {item.label}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══ HABITS ══════════════════════════════════════════════════════════ */}
      <div className="shrink-0">
        <div
          className="rounded-2xl p-4"
          style={{ background: "#111827", border: "1px solid #1f2937" }}
        >
          <p className="text-sm font-semibold text-white mb-3">Daily Habits &amp; Discipline</p>

          {/* Loading skeleton for habits */}
          {isLoading && (
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-xl animate-pulse"
                  style={{ background: "#0f172a", border: "1px solid #1e293b", height: 60 }}
                />
              ))}
            </div>
          )}

          {/* Habit pills */}
          {!isLoading && habits.length === 0 && (
            <p className="text-xs" style={{ color: "#475569" }}>
              No habit goals found. Add goals with no prayer time assigned.
            </p>
          )}

          {!isLoading && habits.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {habits.map((habit) => (
                <div
                  key={habit.dayGoalId}
                  onClick={() => handleToggle(habit.dayGoalId, habit.done)}
                  className="relative rounded-xl overflow-hidden cursor-pointer transition-all"
                  style={{
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                    paddingBottom: "14px",
                  }}
                >
                  <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Checkbox checked={habit.done} />
                      <span
                        className="text-xs font-medium leading-tight truncate"
                        style={{ color: habit.done ? "#e2e8f0" : "#64748b" }}
                      >
                        {habit.label}
                      </span>
                    </div>
                    {habit.streak > 0 && (
                      <span
                        className="text-xs font-semibold shrink-0 whitespace-nowrap"
                        style={{ color: "#fbbf24" }}
                      >
                        🔥 {habit.streak}d
                      </span>
                    )}
                  </div>

                  {/* Bottom color bar */}
                  <div
                    className="absolute bottom-0 left-0 right-0"
                    style={{
                      height: 3,
                      background: habit.done ? habit.barColor : "#1e293b",
                      boxShadow: habit.done ? `0 0 8px ${habit.barColor}cc` : "none",
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
