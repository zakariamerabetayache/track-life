"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import WeekNavigator from "@/components/WeekNavigator";
import DayCard from "@/components/DayCard";
import WeekProgress from "@/components/WeekProgress";
import WeekGoals from "@/components/WeekGoals";
import TimeTrackingDashboard from "@/components/TimeTrackingDashboard";

import Link from "next/link";
import { Settings, Target, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Home() {
  const [week, setWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCurrentWeek = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getCurrentWeek();
      setWeek(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentWeek();
  }, [loadCurrentWeek]);

  const handleNavigate = async (direction) => {
    if (!week) return;
    try {
      setLoading(true);
      const res = await api.navigateWeek(week.year, week.week_number, direction);
      setWeek(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshWeek = async () => {
    if (!week) return;
    try {
      const res = await api.getWeek(week.year, week.week_number);
      setWeek(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Group day_goals by day_of_week — fixed goals always come first
  const getDayGoals = (dayOfWeek) => {
    if (!week?.day_goals) return [];
    return week.day_goals
      .filter((dg) => dg.day_of_week === dayOfWeek)
      .sort((a, b) => {
        // Fixed goals first
        const fixedDiff = (b.goal?.is_fixed ? 1 : 0) - (a.goal?.is_fixed ? 1 : 0);
        if (fixedDiff !== 0) return fixedDiff;
        // Then by sort_order
        return (a.goal?.sort_order || 0) - (b.goal?.sort_order || 0);
      });
  };

  // Calculate overall progress
  const getOverallProgress = () => {
    if (!week?.day_goals || week.day_goals.length === 0) return 0;
    let totalCheckboxes = 0;
    let completedCheckboxes = 0;
    week.day_goals.forEach((dg) => {
      totalCheckboxes += dg.goal?.times_a_day || 1;
      completedCheckboxes += dg.completions?.length || 0;
    });
    return totalCheckboxes === 0 ? 0 : Math.round((completedCheckboxes / totalCheckboxes) * 100);
  };

  // Get today's day index
  const todayIndex = new Date().getDay(); // 0 = Sunday

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Track Life</h1>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </Link>
            <Link href="/goals">
              <Button variant="ghost" size="sm" className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Goals</span>
              </Button>
            </Link>
            <Link href="/categories">
              <Button variant="ghost" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Categories</span>
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive text-sm">
            {error}
            <button onClick={loadCurrentWeek} className="ml-2 underline">Retry</button>
          </div>
        )}

        {loading && !week ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Loading week...</p>
            </div>
          </div>
        ) : week ? (
          <>
            <WeekNavigator
              week={week}
              onNavigate={handleNavigate}
              loading={loading}
            />
            <WeekGoals weekId={week.id} />

            <WeekProgress progress={getOverallProgress()} />

            <TimeTrackingDashboard dayGoals={week.day_goals} />

            <div className="grid gap-4">
              {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                <DayCard
                  key={dayIndex}
                  dayName={DAY_NAMES[dayIndex]}
                  dayIndex={dayIndex}
                  dayGoals={getDayGoals(dayIndex)}
                  weekId={week.id}
                  isToday={dayIndex === todayIndex}
                  onRefresh={refreshWeek}
                />
              ))}
            </div>
          </>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-4 text-center text-xs text-muted-foreground">
        Track Life — Stay Disciplined, Stay On Track
      </footer>
    </div>
  );
}
