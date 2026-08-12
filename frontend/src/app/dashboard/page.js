import Link from "next/link";

import dashboardService from "@/services/dashboardService";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import PreviousStreaks from "@/components/PreviousStreaks";

import {
  ChevronLeft,
  Flame,
  CircleHelp,
} from "lucide-react";


function daysBetween(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);

  const diff = end - start; // milliseconds
  if (isNaN(diff)) return 0;

  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24))) + 1;
}

function StreakHoverCard({ streak, children }) {
  if (!streak) return children;
  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger>
        {children}
      </HoverCardTrigger>

      <HoverCardContent className="w-64 rounded-xl">
        <div className="space-y-2">
          <h4 className="font-semibold text-base">
            🔥 {streak?.count ?? 0} Day Streak
          </h4>

          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">
                Started:
              </span>{" "}
              {streak?.date_from || "N/A"}
            </p>

            <p>
              <span className="font-medium text-foreground">
                Ended:
              </span>{" "}
              {streak?.date_to || "N/A"}
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function DashboardHeader() {
  return (
    <header className="flex items-center justify-between p-6">
      <Link href="/">
        <Button variant="ghost" className="gap-2 rounded-xl">
          <ChevronLeft className="h-4 w-4" />
          Go Home
        </Button>
      </Link>
    </header>
  );
}


export default async function Dashboard() {
  const badHabitsData = await dashboardService.getBadHubbitsStatus();
  const badHabits_tusus = badHabitsData?.badHabits_tusus || [];

  const habits = badHabits_tusus.map((habit) => ({
    ...habit,
    days_without_this_habit: (habit.count_list || []).reduce(
      (sum, streak) => sum + streak.count,
      0
    ),
  }));

  return (
    <>
      <DashboardHeader />

      <main className="mx-auto max-w-7xl p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Bad Habits Dashboard
          </h1>

          <p className="text-muted-foreground">
            Track your current streaks and history.
          </p>
        </div>

        {habits.length === 0 ? (
          <div className="rounded-2xl border p-12 text-center text-muted-foreground">
            No bad habits recorded yet. Add some goals in the &quot;Bad Habbits&quot; category to get started!
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {habits.map((habit) => {
              const countList = habit.count_list || [];
              const currentStreak = countList[0] || { count: 0, date_from: "", date_to: "" };
              const oldestStreak = countList[countList.length - 1] || currentStreak;

              const longest =
                countList.length > 0
                  ? Math.max(...countList.map((s) => s.count))
                  : 0;

              const isZero = currentStreak.count === 0;

              return (
                <Card
                  key={habit.name}
                  className="rounded-2xl border p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-xl p-3 ${
                          isZero ? "bg-zinc-100" : "bg-orange-100"
                        }`}
                      >
                        <Flame
                          className={`h-6 w-6 ${
                            isZero ? "text-zinc-400" : "text-orange-600"
                          }`}
                        />
                      </div>

                      <div>
                        <h2 className="font-semibold text-lg">
                          {habit.name}
                        </h2>

                        <p className="text-xs text-muted-foreground">
                          Current streak
                        </p>
                      </div>
                    </div>

                    <CircleHelp className="h-5 w-5 cursor-pointer text-muted-foreground" />
                  </div>

                  {/* Current streak */}
                  <div className="mt-5 text-center">
                    <StreakHoverCard streak={currentStreak}>
                      <button
                        className={`
                          rounded-2xl
                          px-8
                          py-3
                          text-5xl
                          font-bold
                          transition
                          ${
                            isZero
                              ? "bg-zinc-100 text-zinc-400"
                              : "bg-orange-500 text-white hover:bg-orange-600"
                          }
                        `}
                      >
                        {currentStreak.count}
                      </button>
                    </StreakHoverCard>
                  </div>

                  {/* Compact stats */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-muted p-3 text-center">
                      <p className="text-[11px] uppercase text-muted-foreground">
                        Days Clean
                      </p>

                      <p className="text-xl font-bold text-orange-500">
                        {habit.days_without_this_habit}
                        <span className="mx-1 text-muted-foreground">/</span>
                        {daysBetween(
                          currentStreak.date_from,
                          oldestStreak.date_to
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-muted p-3 text-center">
                      <p className="text-[11px] uppercase text-muted-foreground">
                        Best
                      </p>

                      <p className="text-xl font-bold text-orange-500">
                        {longest}
                      </p>
                    </div>
                  </div>

                  {/* Previous streaks */}
                  <PreviousStreaks streaks={countList.slice(1)} />
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}