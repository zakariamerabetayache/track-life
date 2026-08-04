"use client";

import React, { useState } from "react";
import GoalItem from "@/components/GoalItem";
import AddGoalDialog from "@/components/AddGoalDialog";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronUp, Sunrise, Sun, Sunset, Moon, Star, Target, CheckCircle2 } from "lucide-react";

const getPrayerStyle = (prayer) => {
  switch (prayer?.toLowerCase()) {
    case 'fajr': return { icon: Sunrise, color: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500/20' };
    case 'dhuhr': return { icon: Sun, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    case 'asr': return { icon: Sun, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
    case 'maghrib': return { icon: Sunset, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
    case 'isha': return { icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' };
    case 'witr': return { icon: Star, color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20' };
    default: return { icon: Target, color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
  }
};

export default function DayCard({ dayName, dayIndex, dayGoals, weekId, isToday, onRefresh }) {
  const [isExpanded, setIsExpanded] = useState(isToday);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Calculate day progress
  const totalChecks = dayGoals.reduce((sum, dg) => sum + (dg.goal?.times_a_day || 1), 0);
  const completedChecks = dayGoals.reduce((sum, dg) => sum + (dg.completions?.length || 0), 0);
  const dayProgress = totalChecks === 0 ? 0 : Math.round((completedChecks / totalChecks) * 100);

  // Separate fixed and manual goals
  const fixedGoals = dayGoals.filter(dg => dg.goal?.is_fixed).sort((a, b) => (a.goal?.sort_order || 0) - (b.goal?.sort_order || 0));
  const manualGoals = dayGoals.filter(dg => !dg.goal?.is_fixed).sort((a, b) => (a.goal?.sort_order || 0) - (b.goal?.sort_order || 0)).sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
  console.log("manualGoals----->", JSON.stringify(manualGoals))
  const handleGoalAdded = () => {
    setDialogOpen(false);
    onRefresh();
  };
  let goalsBasedOnPrayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];


  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${isToday
        ? "border-indigo-500/50 bg-indigo-500/5 shadow-lg shadow-indigo-500/5"
        : "border-border/50 bg-card"
        }`}
    >
      {/* Day Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-3">
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${isToday
              ? "bg-indigo-500 text-white"
              : "bg-muted text-muted-foreground"
              }`}
          >
            {dayName.slice(0, 2)}
          </div>
          <div>
            <span className="text-sm font-semibold">{dayName}</span>
            {isToday && (
              <span className="ml-2 text-[10px] font-medium text-indigo-400 uppercase tracking-wider">
                Today
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mini progress */}
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${dayProgress >= 80
                  ? "bg-emerald-500"
                  : dayProgress >= 50
                    ? "bg-amber-500"
                    : "bg-muted-foreground/30"
                  }`}
                style={{ width: `${dayProgress}%` }}
              />
            </div>
            <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">
              {dayProgress}%
            </span>
          </div>

          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {dayGoals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No goals for this day yet.
            </p>
          ) : (
            <div className="space-y-4">
              {fixedGoals.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border bg-indigo-500/10 border-indigo-500/20 shadow-sm">
                      <Target className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">
                        Fixed Goals
                      </span>
                    </div>
                    <div className="h-px bg-border flex-1 opacity-50" />
                  </div>
                  {fixedGoals.map((dg) => (
                    <GoalItem
                      key={dg.id}
                      dayGoal={dg}
                      onToggle={onRefresh}
                      onRemove={onRefresh}
                    />
                  ))}
                </div>
              )}

              {manualGoals.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3 mb-3 mt-4">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border bg-emerald-500/10 border-emerald-500/20 shadow-sm">
                      <Plus className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                        Additional Goals
                      </span>
                    </div>
                    <div className="h-px bg-border flex-1 opacity-50" />
                  </div>
                  <div className="space-y-4">
                    {/* Goals grouped by prayer time */}
                    {goalsBasedOnPrayers.map(item => {
                      const prayerGoals = manualGoals.filter(dg => dg.prayer_time === item).reverse()
                      if (prayerGoals.length === 0) return null;

                      const style = getPrayerStyle(item);
                      const Icon = style.icon;

                      return (
                        <React.Fragment key={item}>
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${style.bg} ${style.border}`}>
                              <Icon className={`w-3 h-3 ${style.color}`} />
                              <span className={`text-[9px] font-bold uppercase tracking-widest ${style.color}`}>
                                After {item}
                              </span>
                            </div>
                            <div className="h-px bg-border flex-1 opacity-30" />
                          </div>
                          <div className="space-y-1.5">
                            {prayerGoals.map((dg) => (
                              <GoalItem
                                key={dg.id}
                                dayGoal={dg}
                                onToggle={onRefresh}
                                onRemove={onRefresh}
                              />
                            ))}
                          </div>
                        </React.Fragment>
                      );
                    })}

                    {/* Goals with no prayer_time assigned */}
                    {manualGoals.filter(dg => !dg.prayer_time).length > 0 && (
                      <React.Fragment>
                        <div className="flex items-center gap-3 mb-2 mt-3">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-slate-500/10 border-slate-500/20">
                            <CheckCircle2 className="w-3 h-3 text-slate-500" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                              Other
                            </span>
                          </div>
                          <div className="h-px bg-border flex-1 opacity-30" />
                        </div>
                        <div className="space-y-1.5">
                          {manualGoals.filter(dg => !dg.prayer_time).map((dg) => (
                            <GoalItem
                              key={dg.id}
                              dayGoal={dg}
                              onToggle={onRefresh}
                              onRemove={onRefresh}
                            />
                          ))}
                        </div>
                      </React.Fragment>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Add Goal Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2 border-dashed gap-2"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Goal
          </Button>

          <AddGoalDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            weekId={weekId}
            dayOfWeek={dayIndex}
            existingGoalIds={dayGoals.map((dg) => dg.goal_id)}
            onGoalAdded={handleGoalAdded}
          />
        </div>
      )}
    </div>
  );
}
