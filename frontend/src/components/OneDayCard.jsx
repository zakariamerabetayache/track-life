"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Sun, Moon, Target, Plus, X, Check, AlertCircle, RefreshCw, Trash2, ArrowLeft, Pencil } from "lucide-react";
import {
  useTodayGoals,
  useToggleCompletion,
  useAddGoal,
  useDeleteGoal,
  useUpdateSleepTime,
} from "@/features/weekDashBoard/hooks/use-today-goals";

// ── Sleep / Wake time input component ────────────────────────────────────────
function SleepAnchor({ sleepData, sleepDayGoalId, updateSleepMutation }) {
  const [editing, setEditing] = useState(!sleepData);
  const [wakeVal, setWakeVal] = useState("");
  const [bedVal, setBedVal] = useState("");

  const handleSave = () => {
    if (!wakeVal || !bedVal || !sleepDayGoalId) return;
    updateSleepMutation.mutate(
      { dayGoalId: sleepDayGoalId, time_from: bedVal, time_to: wakeVal },
      { onSuccess: () => setEditing(false) }
    );
  };

  if (!editing && sleepData) {
    return (
      <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
        {/* Wake Up pill */}
        <div
          className="flex items-center gap-2 sm:gap-3 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
          style={{ background: "#1c1200", border: "1px solid #854d0e" }}
        >
          <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "#451a03" }}>
            <Sun className="h-3 sm:h-3.5 w-3 sm:w-3.5" style={{ color: "#fbbf24" }} />
          </div>
          <span style={{ color: "#94a3b8" }}>Wake Up:</span>
          <span className="font-bold text-white">{sleepData.wake_up}</span>
        </div>

        {/* Sleep Target pill */}
        <div
          className="flex items-center gap-2 sm:gap-3 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm flex-wrap"
          style={{ background: "#0d0b1f", border: "1px solid #3730a3" }}
        >
          <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "#1e1b4b" }}>
            <Moon className="h-3 sm:h-3.5 w-3 sm:w-3.5" style={{ color: "#818cf8" }} />
          </div>
          <span style={{ color: "#94a3b8" }}>Bedtime:</span>
          <span className="font-bold text-white">{sleepData.sleep_target}</span>
          <div style={{ width: 1, height: 14, background: "#3730a3", margin: "0 2px" }} />
          <span style={{ color: "#94a3b8" }}>Goal:</span>
          <span className="font-semibold text-white">{sleepData.goal_duration}</span>
        </div>

        {/* Edit button */}
        <button
          onClick={() => { setWakeVal(""); setBedVal(""); setEditing(true); }}
          className="h-7 w-7 rounded-full flex items-center justify-center transition-opacity hover:opacity-90"
          style={{ background: "#1e293b", border: "1px solid #334155" }}
          title="Edit sleep times"
        >
          <Pencil className="h-3 w-3" style={{ color: "#94a3b8" }} />
        </button>
      </div>
    );
  }

  // Input mode
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div
        className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs"
        style={{ background: "#1c1200", border: "1px solid #854d0e" }}
      >
        <Sun className="h-3 w-3 shrink-0" style={{ color: "#fbbf24" }} />
        <span style={{ color: "#94a3b8" }}>Wake Up:</span>
        <input
          type="time"
          value={wakeVal}
          onChange={(e) => setWakeVal(e.target.value)}
          className="rounded outline-none text-xs px-1"
          style={{ background: "transparent", color: "#f1f5f9", border: "none", width: 90 }}
        />
      </div>

      <div
        className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs"
        style={{ background: "#0d0b1f", border: "1px solid #3730a3" }}
      >
        <Moon className="h-3 w-3 shrink-0" style={{ color: "#818cf8" }} />
        <span style={{ color: "#94a3b8" }}>Bedtime:</span>
        <input
          type="time"
          value={bedVal}
          onChange={(e) => setBedVal(e.target.value)}
          className="rounded outline-none text-xs px-1"
          style={{ background: "transparent", color: "#f1f5f9", border: "none", width: 90 }}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={!wakeVal || !bedVal || updateSleepMutation.isPending}
        className="h-7 px-3 rounded-full flex items-center gap-1 text-xs font-semibold transition-opacity disabled:opacity-50"
        style={{ background: "#0891b2", color: "#fff" }}
      >
        <Check className="h-3 w-3" strokeWidth={3} />
        {updateSleepMutation.isPending ? "Saving…" : "Save"}
      </button>

      {sleepData && (
        <button
          onClick={() => setEditing(false)}
          className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-slate-700"
          style={{ background: "#1e293b" }}
          title="Cancel"
        >
          <X className="h-3 w-3" style={{ color: "#94a3b8" }} />
        </button>
      )}
    </div>
  );
}

// ── Loading skeleton for a prayer card ────────────────────────────────────────
function PeriodSkeleton() {
  return (
    <div
      className="rounded-xl flex flex-col overflow-hidden animate-pulse min-h-[160px]"
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
      className="h-4 w-4 rounded-sm shrink-0 flex items-center justify-center transition-all cursor-pointer select-none"
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

// ── Inline add-goal input ─────────────────────────────────────────────────────
function AddInput({ onCommit, onCancel, placeholder = "Goal title..." }) {
  const [val, setVal] = useState("");

  const submit = () => {
    if (val.trim()) onCommit(val.trim());
    setVal("");
  };

  return (
    <div className="flex items-center gap-1.5 pt-2 pb-1 px-3">
      <input
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") onCancel();
        }}
        placeholder={placeholder}
        className="flex-1 h-7 text-xs px-2 rounded outline-none"
        style={{ background: "#0f172a", border: "1px solid #334155", color: "#f1f5f9" }}
      />
      <button
        onClick={submit}
        className="h-7 w-7 rounded flex items-center justify-center shrink-0 transition-opacity hover:opacity-90 active:scale-95"
        style={{ background: "#0891b2" }}
        title="Add"
      >
        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
      </button>
      <button
        onClick={onCancel}
        className="h-7 w-7 rounded flex items-center justify-center shrink-0 transition-colors hover:bg-slate-700"
        style={{ background: "#1e293b" }}
        title="Cancel"
      >
        <X className="h-3.5 w-3.5" style={{ color: "#94a3b8" }} />
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function OneDayCard() {
  const {
    prayerPeriods,
    habits,
    progress,
    weekId,
    dayOfWeek,
    sleepData,
    sleepDayGoalId,
    isLoading,
    error,
    refetch,
  } = useTodayGoals();

  const toggleMutation = useToggleCompletion();
  const addGoalMutation = useAddGoal();
  const deleteGoalMutation = useDeleteGoal();
  const updateSleepMutation = useUpdateSleepTime();
  // Which section is showing the add input: "fajr"|"dhuhr"|...|"habits"|null
  const [addingTo, setAddingTo] = useState(null);

  const today = useMemo(
    () => new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    []
  );

  // Circular SVG ring
  const R = 42, C = 2 * Math.PI * R;
  const offset = C - (progress / 100) * C;

  const handleToggle = (dayGoalId, done) => {
    toggleMutation.mutate({ dayGoalId, occurrenceIndex: 0, isCompleted: !done });
  };

  const handleAdd = (prayerTime, title) => {
    if (!weekId) return;
    addGoalMutation.mutate(
      { weekId, dayOfWeek, prayerTime, title },
      { onSuccess: () => setAddingTo(null) }
    );
  };

  const handleDelete = (dayGoalId) => {
    deleteGoalMutation.mutate(dayGoalId);
  };

  return (
    <div
      className="min-h-screen lg:h-screen w-full overflow-y-auto lg:overflow-hidden flex flex-col p-3 sm:p-5 gap-3 sm:gap-4"
      style={{ background: "#0B0F17", color: "#f1f5f9", fontFamily: "inherit" }}
    >

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <div
        className="rounded-2xl px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-3 shrink-0"
        style={{ background: "#111827", border: "1px solid #1f2937" }}
      >
        {/* Far-left back arrow → home */}
        <Link
          href="/"
          className="shrink-0 flex items-center justify-center rounded-xl p-1.5 transition-colors hover:bg-slate-800"
          title="Go Home"
        >
          <ArrowLeft className="h-5 w-5" style={{ color: "#64748b" }} />
        </Link>

        {/* Logo & title */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <img
            src="/icon.svg"
            alt="Track Life Logo"
            className="h-8 w-8 rounded-lg shrink-0 object-contain shadow-sm"
          />
          <span className="text-sm sm:text-base font-bold tracking-tight text-white">
            Track Life
          </span>
        </div>

        {/* Date — centred in remaining space */}
        <span className="text-xs sm:text-base font-medium text-center flex-1" style={{ color: "#cbd5e1" }}>
          {today}
        </span>

        {/* Progress ring */}
        <div className="relative shrink-0" style={{ width: 68, height: 68 }}>
          <svg width="68" height="68" viewBox="0 0 96 96" style={{ transform: "rotate(-90deg)" }}>
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
            <span className="text-base sm:text-lg font-black text-white leading-none">
              {isLoading ? "—" : `${progress}%`}
            </span>
            <span className="text-[8px] sm:text-[9px] mt-0.5" style={{ color: "#64748b", letterSpacing: "0.07em" }}>
              Completed
            </span>
          </div>
        </div>
      </div>

      {/* ══ QUICK ANCHORS ═══════════════════════════════════════════════════ */}
      <div className="shrink-0">
        <p className="text-[11px] sm:text-xs font-semibold uppercase mb-2" style={{ color: "#475569", letterSpacing: "0.1em" }}>
          Quick Anchors
        </p>
        <SleepAnchor
          sleepData={sleepData}
          sleepDayGoalId={sleepDayGoalId}
          updateSleepMutation={updateSleepMutation}
        />
      </div>

      {/* ══ DAILY FLOW (5 PRAYER CARDS) ═════════════════════════════════════ */}
      <div className="flex-1 flex flex-col lg:min-h-0">
        <div className="flex items-center justify-between mb-2 shrink-0">
          <p className="text-[11px] sm:text-xs font-semibold uppercase" style={{ color: "#475569", letterSpacing: "0.1em" }}>
            Daily Flow
          </p>
          {error && (
            <button onClick={refetch} className="flex items-center gap-1 text-xs" style={{ color: "#ef4444" }}>
              <RefreshCw className="h-3 w-3" /> Retry
            </button>
          )}
        </div>

        {/* Error */}
        {error && !isLoading && (
          <div
            className="flex-1 flex flex-col items-center justify-center gap-3 rounded-xl p-6"
            style={{ background: "#111827", border: "1px solid #7f1d1d" }}
          >
            <AlertCircle className="h-8 w-8" style={{ color: "#ef4444" }} />
            <p className="text-sm" style={{ color: "#94a3b8" }}>{error}</p>
            <button onClick={refetch} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: "#1e293b", color: "#cbd5e1" }}>
              Retry
            </button>
          </div>
        )}

        {/* Skeleton */}
        {isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 flex-1 lg:min-h-0">
            {[1, 2, 3, 4, 5].map((i) => <PeriodSkeleton key={i} />)}
          </div>
        )}

        {/* Prayer cards: stacked in mobile (grid-cols-1), 5 side-by-side on desktop (lg:grid-cols-5) */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 flex-1 lg:min-h-0">
            {prayerPeriods.map((period) => (
              <div
                key={period.key}
                className="rounded-xl flex flex-col overflow-hidden min-h-[170px]"
                style={{ background: period.bgColor, border: `1.5px solid ${period.borderColor}` }}
              >
                {/* Card header */}
                <div
                  className="flex items-center justify-between px-3 pt-3 pb-2.5 shrink-0"
                  style={{ borderBottom: `1px solid ${period.borderColor}40` }}
                >
                  <span className="text-base font-bold" style={{ color: period.titleColor }}>
                    {period.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[10px] font-semibold rounded-full px-2.5 py-0.5"
                      style={{ background: period.badgeBg, color: period.badgeText }}
                    >
                      {period.badge}
                    </span>
                    {/* Header Quick Add Button */}
                    <button
                      onClick={() => setAddingTo(addingTo === period.key ? null : period.key)}
                      className="h-5 w-5 rounded flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                      style={{
                        background: `${period.borderColor}60`,
                        color: period.titleColor,
                      }}
                      title={`Add goal to ${period.name}`}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Items list */}
                <div className="flex flex-col gap-2 px-3 pt-2.5 flex-1 overflow-y-auto pb-1 max-h-56 lg:max-h-none">
                  {period.items.map((item) => (
                    <div key={item.dayGoalId} className="flex items-center gap-2 group py-0.5">
                      <Checkbox checked={item.done} onClick={() => handleToggle(item.dayGoalId, item.done)} />
                      <span
                        className="text-xs sm:text-sm leading-snug flex-1 transition-colors cursor-pointer select-none"
                        onClick={() => handleToggle(item.dayGoalId, item.done)}
                        style={{ color: item.done ? "#e2e8f0" : "#94a3b8" }}
                      >
                        {item.label}
                      </span>
                      {/* Delete button — only for non-fixed goals (visible on mobile, hover on desktop) */}
                      {!item.isFixed && (
                        <button
                          onClick={() => handleDelete(item.dayGoalId)}
                          className="shrink-0 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-0.5 hover:text-red-400"
                          style={{ color: "#64748b" }}
                          title="Remove goal"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Inline add input */}
                  {addingTo === period.key && (
                    <AddInput
                      placeholder={`Add to ${period.name}...`}
                      onCommit={(title) => handleAdd(period.key, title)}
                      onCancel={() => setAddingTo(null)}
                    />
                  )}
                </div>

                {/* Add goal footer button */}
                {addingTo !== period.key && (
                  <button
                    onClick={() => setAddingTo(period.key)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all shrink-0 hover:brightness-110 active:scale-98"
                    style={{
                      color: period.titleColor,
                      background: `${period.borderColor}25`,
                      borderTop: `1px solid ${period.borderColor}40`,
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add goal
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══ HABITS ══════════════════════════════════════════════════════════ */}
      <div className="shrink-0">
        <div className="rounded-2xl p-3.5 sm:p-4" style={{ background: "#111827", border: "1px solid #1f2937" }}>
          {/* Habits Header with Prominent Add Habit Button */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs sm:text-sm font-semibold text-white">Daily Habits &amp; Discipline</p>
            {/* <button
              onClick={() => setAddingTo(addingTo === "habits" ? null : "habits")}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all hover:brightness-110 active:scale-95"
              style={{
                background: "#1e293b",
                color: "#38bdf8",
                border: "1px solid #0284c760",
              }}
            >
              <Plus className="h-3.5 w-3.5" /> Add habit
            </button> */}
          </div>

          {/* Skeleton */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl animate-pulse" style={{ background: "#0f172a", border: "1px solid #1e293b", height: 56 }} />
              ))}
            </div>
          )}

          {/* Habit pills */}
          {!isLoading && (
            <>
              {/* Inline add input for habits */}
              {addingTo === "habits" && (
                <div className="mb-3">
                  <AddInput
                    placeholder="Enter habit title (e.g. No Sugar, Read 10 mins)..."
                    onCommit={(title) => handleAdd(null, title)}
                    onCancel={() => setAddingTo(null)}
                  />
                </div>
              )}

              {habits.length === 0 && addingTo !== "habits" && (
                <p className="text-xs py-2" style={{ color: "#64748b" }}>
                  No habits yet. Click <strong>+ Add habit</strong> above to create one.
                </p>
              )}

              {habits.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                  {habits.map((habit) => (
                    <div
                      key={habit.dayGoalId}
                      className="relative rounded-xl overflow-hidden cursor-pointer transition-all group"
                      style={{ background: "#0f172a", border: "1px solid #1e293b", paddingBottom: "12px" }}
                    >
                      <div className="flex items-center justify-between gap-2 px-3 pt-2.5 pb-2">
                        <div
                          className="flex items-center gap-2 min-w-0 flex-1"
                          onClick={() => handleToggle(habit.dayGoalId, habit.done)}
                        >
                          <Checkbox checked={habit.done} />
                          <span
                            className="text-xs font-medium leading-tight truncate select-none"
                            style={{ color: habit.done ? "#e2e8f0" : "#94a3b8" }}
                          >
                            {habit.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {habit.streak > 0 && (
                            <span className="text-xs font-semibold whitespace-nowrap" style={{ color: "#fbbf24" }}>
                              🔥 {habit.streak}d
                            </span>
                          )}
                          {/* Delete button — visible on touch, hover on desktop */}
                          {!habit.isFixed && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(habit.dayGoalId);
                              }}
                              className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-0.5 hover:text-red-400"
                              style={{ color: "#64748b" }}
                              title="Remove habit"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
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
            </>
          )}
        </div>
      </div>

    </div>
  );
}
