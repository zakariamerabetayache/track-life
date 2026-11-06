"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import DayCard from "@/components/DayCard";
import CrudsHeader from "@/components/CrudsHeader"
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
import { OneDayCard } from "../../components/OneDayCard"

export default function OneDayDashboard() {

    let weekdata = useQuery({
        queryFn: loadCurrentWeek,
        queryKey: ['week']
    })

    console.log(JSON.stringify(weekdata))
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


    // Get today's day index
    const todayIndex = new Date().getDay(); // 0 = Sunday

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}

            <CrudsHeader title="day dash" description="track day goals and habits " />


            {/* Main Content */}
            {/* <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
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


                        <div className="grid gap-4">
                            {[0, 1, 2, 3, 4, 5, 6].filter(item => item === todayIndex).map((dayIndex) => (
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
            </main> */}
            <OneDayCard />

            {/* Footer */}
            <footer className="border-t border-border/40 py-4 text-center text-xs text-muted-foreground">
                Track Life — Stay Disciplined, Stay On Track
            </footer>
        </div>
    );
}
