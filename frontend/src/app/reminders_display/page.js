"use client";

import { useMemo, useState } from "react";
import { useReminders } from "@/features/reminders/hooks/use-reminders";

// Each entry bundles the card color with matching text/chip styles so contrast stays good.
// Full class names are listed so Tailwind can detect them.
const PALETTE = [
    { card: "bg-violet-600", text: "text-white", body: "text-white/90", chip: "bg-white/20 text-white" },
    { card: "bg-fuchsia-600", text: "text-white", body: "text-white/90", chip: "bg-white/20 text-white" },
    { card: "bg-indigo-500", text: "text-white", body: "text-white/90", chip: "bg-white/20 text-white" },
    { card: "bg-rose-600", text: "text-white", body: "text-white/90", chip: "bg-white/20 text-white" },
    { card: "bg-sky-400", text: "text-slate-900", body: "text-slate-800", chip: "bg-black/10 text-slate-900" },
    { card: "bg-cyan-400", text: "text-slate-900", body: "text-slate-800", chip: "bg-black/10 text-slate-900" },
    { card: "bg-emerald-400", text: "text-slate-900", body: "text-slate-800", chip: "bg-black/10 text-slate-900" },
    { card: "bg-lime-300", text: "text-slate-900", body: "text-slate-800", chip: "bg-black/10 text-slate-900" },
    { card: "bg-amber-300", text: "text-slate-900", body: "text-slate-800", chip: "bg-black/10 text-slate-900" },
    { card: "bg-orange-400", text: "text-slate-900", body: "text-slate-800", chip: "bg-black/10 text-slate-900" },
];

function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

// Random color per card, never the same color twice in a row.
function withRandomColors(list) {
    let last = -1;
    return list.map((data) => {
        let index;
        do {
            index = Math.floor(Math.random() * PALETTE.length);
        } while (index === last && PALETTE.length > 1);
        last = index;
        return { data, color: PALETTE[index] };
    });
}

function parseDate(time) {
    const date = new Date(time);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatWhen(time) {
    const date = parseDate(time);
    if (!date) return time;
    return date.toLocaleString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function RemindersPage() {
    const { data: response, isLoading, isError, refetch } = useReminders();
    const [round, setRound] = useState(0);

    // Order and colors are picked once when the data arrives (and again on "Shuffle"),
    // so cards don't change on every re-render.
    const cards = useMemo(
        () => withRandomColors(shuffle(response?.data || [])),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [response?.data, round]
    );

    return (
        <div className="min-h-screen bg-zinc-950">
            <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
                <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                            Reminders
                        </h1>
                        {!isLoading && !isError && cards.length > 0 && (
                            <p className="mt-2 text-sm text-zinc-400">
                                {cards.length} {cards.length === 1 ? "reminder" : "reminders"}
                            </p>
                        )}
                    </div>

                    {!isLoading && !isError && cards.length > 1 && (
                        <button
                            type="button"
                            onClick={() => setRound((r) => r + 1)}
                            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                            <ShuffleIcon />
                            Shuffle
                        </button>
                    )}
                </header>

                {isLoading ? (
                    <LoadingState />
                ) : isError ? (
                    <ErrorState onRetry={() => refetch?.()} />
                ) : cards.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
                        {cards.map(({ data: reminder, color }) => {
                            const date = parseDate(reminder.time);
                            const overdue = date ? date < new Date() : false;

                            return (
                                <article
                                    key={reminder.id}
                                    className={`mb-4 break-inside-avoid rounded-2xl p-5 transition-transform motion-safe:hover:-translate-y-0.5 ${color.card}`}
                                >
                                    <div className="mb-4 flex items-center justify-between gap-2">
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${color.chip}`}
                                        >
                                            <ClockIcon />
                                            <time dateTime={date?.toISOString()}>{formatWhen(reminder.time)}</time>
                                        </span>
                                        {overdue && (
                                            <span className="rounded-full bg-zinc-950 px-2 py-0.5 text-xs font-medium text-white">
                                                Overdue
                                            </span>
                                        )}
                                    </div>

                                    <h2 className={`text-lg font-semibold leading-snug ${color.text}`}>
                                        {reminder.title}
                                    </h2>
                                    {reminder.content && (
                                        <p className={`mt-2 text-sm leading-relaxed ${color.body}`}>
                                            {reminder.content}
                                        </p>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

function LoadingState() {
    return (
        <div
            aria-busy="true"
            aria-live="polite"
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
            <span className="sr-only">Loading reminders</span>
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 motion-safe:animate-pulse"
                >
                    <div className="h-6 w-32 rounded-full bg-zinc-800" />
                    <div className="h-5 w-2/3 rounded bg-zinc-800" />
                    <div className="h-3 w-full rounded bg-zinc-800/70" />
                    <div className="h-3 w-4/5 rounded bg-zinc-800/70" />
                </div>
            ))}
        </div>
    );
}

function ErrorState({ onRetry }) {
    return (
        <div role="alert" className="rounded-2xl border border-rose-500/40 bg-rose-950/50 p-6">
            <h2 className="text-base font-semibold text-rose-200">We couldn’t load your reminders</h2>
            <p className="mt-1 text-sm text-rose-300/90">
                Check your connection and try again. If it keeps happening, reload the page.
            </p>
            <button
                type="button"
                onClick={onRetry}
                className="mt-4 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
                Try again
            </button>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-10 text-center">
            <h2 className="text-base font-semibold text-white">No reminders yet</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-400">
                Reminders you create will appear here as colorful cards.
            </p>
        </div>
    );
}

function ClockIcon() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </svg>
    );
}

function ShuffleIcon() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 3h5v5" />
            <path d="M4 20 21 3" />
            <path d="M21 16v5h-5" />
            <path d="m15 15 6 6" />
            <path d="m4 4 5 5" />
        </svg>
    );
}