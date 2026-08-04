"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Check, X, Clock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Returns total minutes between two "HH:MM" strings.
 *  If time_to < time_from the period crosses midnight — handled correctly. */
function calcDurationMins(from, to) {
  if (!from || !to) return null;
  const [fh, fm] = from.split(":").map(Number);
  const [th, tm] = to.split(":").map(Number);
  if (isNaN(fh) || isNaN(fm) || isNaN(th) || isNaN(tm)) return null;
  const fromMins = fh * 60 + fm;
  const toMins = th * 60 + tm;
  return toMins >= fromMins
    ? toMins - fromMins
    : 24 * 60 - fromMins + toMins;
}

/** Formats minutes as "Xh Ym" or "Xh" */
function fmtDuration(mins) {
  if (mins === null) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Returns Tailwind color styling based on duration */
function durationColor(mins, isSleep) {
  if (!isSleep || mins === null) return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
  const hrs = mins / 60;
  if (hrs >= 7) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  if (hrs >= 5) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  return "text-rose-400 bg-rose-500/10 border-rose-500/20";
}

const TIMED_KEYWORDS = ["work", "النوم", "sleep", "عمل", "job", "نوم", "", null];

export default function GoalItem({ dayGoal, onToggle, onRemove }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [timeFrom, setTimeFrom] = useState(dayGoal.time_from || "");
  const [timeTo, setTimeTo] = useState(dayGoal.time_to || "");
  const [saved, setSaved] = useState(false);

  // Sync state when dayGoal prop updates from parent/server
  useEffect(() => {
    setTimeFrom(dayGoal.time_from || "");
    setTimeTo(dayGoal.time_to || "");
  }, [dayGoal.time_from, dayGoal.time_to]);

  const title = dayGoal?.goal?.title ?? "";
  const categoryName = dayGoal?.goal?.category?.name ?? "";
  const combinedText = `${title} ${categoryName}`.toLowerCase();

  const isTimed = TIMED_KEYWORDS.some((w) => combinedText.includes(w.toLowerCase())) ||
    Boolean(dayGoal.time_from) ||
    Boolean(dayGoal.time_to);

  const isSleep = combinedText.includes("نوم") || combinedText.includes("sleep");

  const durationMins = calcDurationMins(timeFrom, timeTo);
  const durationText = fmtDuration(durationMins);
  const colorClass = durationColor(durationMins, isSleep);

  const isCompleted = (index) =>
    dayGoal.completions?.some((c) => c.occurrence_index === index);

  const handleToggle = async (index, currentState) => {
    try {
      setLoading(true);
      await api.toggleCompletion({
        day_goal_id: dayGoal.id,
        occurrence_index: index,
        is_completed: !currentState,
      });
      if (onToggle) onToggle();
    } catch (error) {
      console.error("Failed to toggle completion", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm(`Remove "${dayGoal.goal?.title}" from this day?`)) return;
    try {
      setLoading(true);
      await api.removeDayGoal(dayGoal.id);
      if (onRemove) onRemove();
    } catch (error) {
      console.error("Failed to remove day goal", error);
      alert(error.message);
      setLoading(false);
    }
  };

  const handleSaveTime = async () => {
    try {
      setSaving(true);
      await api.updateDayGoal(dayGoal.id, {
        time_from: timeFrom || null,
        time_to: timeTo || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (onToggle) onToggle();
    } catch (error) {
      console.error("Failed to save time", error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const timesADay = dayGoal.goal?.times_a_day || 1;
  const isAuto = dayGoal.is_auto;

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl border border-border/40 bg-background/50 hover:bg-background/80 transition-all duration-200 group">
      {/* Row 1: Goal title, category & completion checkboxes */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {dayGoal.goal?.category && (
            <div
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: dayGoal.goal.category.color }}
            />
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate text-foreground/90">
              {dayGoal.goal?.title}
            </span>
            {dayGoal.goal?.category && (
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {dayGoal.goal.category.name}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {Array.from({ length: timesADay }).map((_, i) => {
            const checked = isCompleted(i);
            return (
              <button
                key={i}
                onClick={() => handleToggle(i, checked)}
                disabled={loading}
                className={`
                  h-7 w-7 rounded-md flex items-center justify-center transition-all duration-200 border
                  ${checked
                    ? "bg-indigo-500 border-indigo-500 text-white shadow-sm shadow-indigo-500/20"
                    : "bg-muted/50 border-border/60 text-transparent hover:border-indigo-400/50 hover:bg-indigo-500/10"
                  }
                `}
              >
                <Check className={`h-4 w-4 ${checked ? "opacity-100 scale-100" : "opacity-0 scale-50"}`} />
              </button>
            );
          })}

          {!isAuto && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              onClick={handleRemove}
              disabled={loading}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Row 2: Time inputs for work / sleep / timed goals */}
      {isTimed && (
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-border/20">
          <div className="flex items-center gap-1.5 bg-muted/40 rounded-lg px-2.5 py-1 border border-border/40">
            <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <Input
              type="time"
              value={timeFrom}
              onChange={(e) => setTimeFrom(e.target.value)}
              className="h-6 w-24 border-0 bg-transparent p-0 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground"
            />
            <span className="text-muted-foreground text-xs">→</span>
            <Input
              type="time"
              value={timeTo}
              onChange={(e) => setTimeTo(e.target.value)}
              className="h-6 w-24 border-0 bg-transparent p-0 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground"
            />
          </div>

          {durationText && (
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}>
              <Clock className="h-3 w-3" />
              {durationText}
            </span>
          )}

          <Button
            size="sm"
            variant={saved ? "outline" : "default"}
            className={`h-7 px-3 text-xs font-medium transition-all ${saved ? "border-emerald-500 text-emerald-500 bg-emerald-500/10" : ""}`}
            onClick={handleSaveTime}
            disabled={saving}
          >
            {saving ? (
              <span className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full border border-current border-t-transparent animate-spin" />
                Saving…
              </span>
            ) : saved ? (
              <span className="flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-emerald-500" /> Saved
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Save className="h-3.5 w-3.5" /> Save
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
