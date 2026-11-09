"use client";

import React, { useState, useMemo } from "react";
import { Sun, Moon, Target, Plus, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";

// ── FAKE DATA ────────────────────────────────────────────────────────────────

const PERIODS = [
  {
    id: "fajr",
    name: "Fajr",
    badge: "Dawn",
    borderColor: "#2d6a4f",        // dark green border
    bgColor: "#0d2318",            // very dark green tint
    titleColor: "#6ee7b7",         // emerald-300
    badgeBg: "#14532d",
    badgeText: "#6ee7b7",
    items: [
      { id: "fp", label: "Fajr Prayer", done: true },
      { id: "fq", label: "Quran & Adhkar", done: true },
      { id: "fc", label: "Deep Coding", done: true },
    ],
  },
  {
    id: "dhuhr",
    name: "Dhuhr",
    badge: "Midday",
    borderColor: "#854d0e",
    bgColor: "#1c1200",
    titleColor: "#fcd34d",
    badgeBg: "#713f12",
    badgeText: "#fcd34d",
    items: [
      { id: "dp", label: "Dhuhr Prayer", done: true },
      { id: "dl", label: "Healthy Lunch", done: true },
      { id: "dw", label: "Work Sprint", done: true },
    ],
  },
  {
    id: "asr",
    name: "Asr",
    badge: "Afternoon",
    borderColor: "#9a3412",
    bgColor: "#1a0d04",
    titleColor: "#fb923c",
    badgeBg: "#7c2d12",
    badgeText: "#fb923c",
    items: [
      { id: "ap", label: "Asr Prayer", done: true },
      { id: "aw", label: "Outdoor Walk", done: true },
      { id: "ar", label: "Read 1 Chapter", done: false },
    ],
  },
  {
    id: "maghrib",
    name: "Maghrib",
    badge: "Sunset",
    borderColor: "#9f1239",
    bgColor: "#1a0511",
    titleColor: "#fda4af",
    badgeBg: "#881337",
    badgeText: "#fda4af",
    items: [
      { id: "mp", label: "Maghrib Prayer", done: true },
      { id: "md", label: "Family Dinner", done: false },
    ],
  },
  {
    id: "isha",
    name: "Isha",
    badge: "Night",
    borderColor: "#3730a3",
    bgColor: "#0d0b1f",
    titleColor: "#a5b4fc",
    badgeBg: "#312e81",
    badgeText: "#a5b4fc",
    items: [
      { id: "ip", label: "Isha Prayer", done: false },
      { id: "iw", label: "Witr & Journaling", done: false },
    ],
  },
];

const HABITS = [
  { id: "h1", label: "No Doomscrolling", streak: "14d streak", done: true, barColor: "#10b981" },
  { id: "h2", label: "Zero Sugar", streak: "8d streak", done: true, barColor: "#f59e0b" },
  { id: "h3", label: "Drink 3L Water", streak: null, done: true, barColor: "#06b6d4" },
  { id: "h4", label: "No Social Media after 9 PM", streak: null, done: false, barColor: "#475569" },
];

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export default function OneDayCard() {
  const [periods, setPeriods] = useState(PERIODS);
  const [habits, setHabits] = useState(HABITS);
  const [addingTo, setAddingTo] = useState(null);
  const [newLabel, setNewLabel] = useState("");

  // Progress
  const pct = useMemo(() => {
    let total = 0, done = 0;
    periods.forEach(p => p.items.forEach(i => { total++; if (i.done) done++; }));
    habits.forEach(h => { total++; if (h.done) done++; });
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [periods, habits]);

  // Circular SVG ring
  const R = 42, C = 2 * Math.PI * R;
  const offset = C - (pct / 100) * C;

  // Today label
  const today = useMemo(() =>
    new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }), []);

  const toggleItem = (pid, iid) =>
    setPeriods(ps => ps.map(p => p.id !== pid ? p : {
      ...p,
      items: p.items.map(i => i.id !== iid ? i : { ...i, done: !i.done }),
    }));

  const toggleHabit = (id) =>
    setHabits(hs => hs.map(h => h.id !== id ? h : { ...h, done: !h.done }));

  const commitAdd = (pid) => {

  };

  return (
    /* Full-viewport, no scroll */
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

        {/* Progress Ring — raw SVG, no wrapper shadow */}
        <div className="relative shrink-0" style={{ width: 80, height: 80 }}>
          <svg width="80" height="80" viewBox="0 0 96 96" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="48" cy="48" r={R} strokeWidth="6" fill="none" stroke="#1e293b" />
            <circle
              cx="48" cy="48" r={R}
              strokeWidth="6" fill="none"
              stroke="#22d3ee"
              strokeDasharray={C}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center"
            style={{ top: 0, left: 0 }}
          >
            <span className="text-lg font-black text-white leading-none">{pct}%</span>
            <span className="text-[9px] mt-0.5" style={{ color: "#64748b", letterSpacing: "0.07em" }}>Completed</span>
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
            <span className="text-sm font-bold text-white">05:15 AM</span>
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
            <span className="text-sm font-bold text-white">10:30 PM</span>
            <div style={{ width: 1, height: 14, background: "#3730a3", margin: "0 4px" }} />
            <span className="text-sm" style={{ color: "#94a3b8" }}>Goal:</span>
            <span className="text-sm font-semibold text-white">7h 15m</span>
          </div>

        </div>
      </div>

      {/* ══ DAILY FLOW ══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-h-0">
        <p className="text-xs font-semibold uppercase mb-2 shrink-0" style={{ color: "#475569", letterSpacing: "0.1em" }}>
          Daily Flow
        </p>
        <div className="grid grid-cols-5 gap-3 flex-1 min-h-0">
          {periods.map(period => (
            <div
              key={period.id}
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
              <div className="flex flex-col gap-2 px-3 pt-2.5 flex-1 overflow-y-auto">
                {period.items.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={() => toggleItem(period.id, item.id)}
                  >
                    {/* Checkbox — shadcn, but visually overridden */}
                    <div
                      className="h-4 w-4 rounded-sm shrink-0 flex items-center justify-center transition-all"
                      style={item.done ? {
                        background: "#10b981",
                        border: "1.5px solid #34d399",
                      } : {
                        background: "transparent",
                        border: "1.5px solid #475569",
                      }}
                    >
                      {item.done && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                    </div>
                    <span
                      className="text-sm leading-snug transition-colors"
                      style={{ color: item.done ? "#e2e8f0" : "#64748b" }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}

                {/* Inline add */}
                {addingTo === period.id && (
                  <div className="flex items-center gap-1 pb-1">
                    <Input
                      autoFocus
                      value={newLabel}
                      onChange={e => setNewLabel(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") commitAdd(period.id);
                        if (e.key === "Escape") setAddingTo(null);
                      }}
                      placeholder="Goal title..."
                      className="h-6 text-xs px-2 text-white"
                      style={{ background: "#0f172a", border: "1px solid #334155" }}
                    />
                    <button
                      onClick={() => commitAdd(period.id)}
                      className="h-6 w-6 rounded flex items-center justify-center shrink-0"
                      style={{ background: "#0891b2" }}
                    >
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </button>
                    <button
                      onClick={() => setAddingTo(null)}
                      className="h-6 w-6 rounded flex items-center justify-center shrink-0"
                      style={{ background: "#1e293b" }}
                    >
                      <X className="h-3 w-3" style={{ color: "#94a3b8" }} />
                    </button>
                  </div>
                )}
              </div>

              {/* Add goal */}
              {addingTo !== period.id && (
                <button
                  onClick={() => { setAddingTo(period.id); setNewLabel(""); }}
                  className="flex items-center gap-1 px-3 py-2 text-[11px] font-medium transition-colors shrink-0"
                  style={{
                    color: "#475569",
                    borderTop: `1px solid ${period.borderColor}30`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "#94a3b8"}
                  onMouseLeave={e => e.currentTarget.style.color = "#475569"}
                >
                  <Plus className="h-3 w-3" />
                  Add goal
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ══ HABITS ══════════════════════════════════════════════════════════ */}
      <div className="shrink-0">
        <div
          className="rounded-2xl p-4"
          style={{ background: "#111827", border: "1px solid #1f2937" }}
        >
          <p className="text-sm font-semibold text-white mb-3">Daily Habits & Discipline</p>
          <div className="grid grid-cols-4 gap-3">
            {habits.map(habit => (
              <div
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className="relative rounded-xl overflow-hidden cursor-pointer transition-all"
                style={{
                  background: "#0f172a",
                  border: "1px solid #1e293b",
                  paddingBottom: "14px", // room for the bar
                }}
              >
                <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Custom checkbox */}
                    <div
                      className="h-4 w-4 rounded-sm shrink-0 flex items-center justify-center transition-all"
                      style={habit.done ? {
                        background: "#10b981",
                        border: "1.5px solid #34d399",
                      } : {
                        background: "transparent",
                        border: "1.5px solid #475569",
                      }}
                    >
                      {habit.done && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                    </div>
                    <span
                      className="text-xs font-medium leading-tight truncate"
                      style={{ color: habit.done ? "#e2e8f0" : "#64748b" }}
                    >
                      {habit.label}
                    </span>
                  </div>
                  {habit.streak && (
                    <span className="text-xs font-semibold shrink-0 whitespace-nowrap" style={{ color: "#fbbf24" }}>
                      🔥 {habit.streak}
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
        </div>
      </div>

    </div>
  );
}
