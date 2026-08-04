"use client";

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WeekNavigator({ week, onNavigate, loading }) {
  if (!week) return null;

  const startDate = new Date(week.start_date);
  const endDate = new Date(week.end_date);

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Check if this is the current week
  const today = new Date();
  const isCurrentWeek = today >= startDate && today <= endDate;

  return (
    <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onNavigate("prev")}
        disabled={loading}
        className="h-9 w-9 shrink-0"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-3 text-center">
        <CalendarDays className="h-5 w-5 text-indigo-400" />
        <div>
          <p className="text-sm font-semibold">
            Week {week.week_number}, {week.year}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(startDate)} — {formatDate(endDate)}
            {isCurrentWeek && (
              <span className="ml-2 inline-flex items-center rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-medium text-indigo-400">
                Current
              </span>
            )}
          </p>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onNavigate("next")}
        disabled={loading}
        className="h-9 w-9 shrink-0"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
