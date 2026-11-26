"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search, Trash2, BookOpen, Lightbulb, Zap, Eye, Smile, Briefcase, Moon, Sun } from "lucide-react";
import { useDailyInsights, useDeleteInsight } from "@/features/dailyInsights/hooks/use-daily-insights";

// ── Score badge ───────────────────────────────────────────────────────────────
function ScoreBadge({ icon: Icon, label, value, color }) {
  if (value == null) return null;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
    >
      <Icon className="h-3 w-3" />
      {label} {value}/10
    </span>
  );
}

// ── Individual day card ───────────────────────────────────────────────────────
function InsightCard({ insight, onDelete }) {
  const dateLabel = new Date(insight.insight_date).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
  const weekLabel = `Week ${insight.week?.week_number}, ${insight.week?.year}`;

  return (
    <article
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ background: "#111827", border: "1px solid #1f2937" }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-white">{dateLabel}</p>
          <p className="text-[11px] mt-0.5" style={{ color: "#475569" }}>{weekLabel}</p>
        </div>
        <button
          onClick={() => { if (confirm("Delete this insight?")) onDelete(insight.id); }}
          className="p-1.5 rounded-lg transition-colors hover:bg-red-900/30"
          style={{ color: "#64748b" }}
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Sleep + Work row */}
      {(insight.sleep_data || insight.work_hours != null) && (
        <div className="flex flex-wrap gap-2 text-[11px]">
          {insight.sleep_data && (
            <>
              <span className="rounded-full px-2.5 py-0.5 font-medium flex items-center gap-1" style={{ background: "#1c1200", color: "#fcd34d", border: "1px solid #854d0e40" }}>
                <Moon className="h-3 w-3" /> {insight.sleep_data.sleep_target} → {insight.sleep_data.wake_up}
              </span>
              <span className="rounded-full px-2.5 py-0.5 font-medium flex items-center gap-1" style={{ background: "#0d1f0d", color: "#6ee7b7", border: "1px solid #2d6a4f40" }}>
                <Sun className="h-3 w-3" /> {insight.sleep_data.goal_duration}
              </span>
            </>
          )}
          {insight.work_hours != null && (
            <span className="rounded-full px-2.5 py-0.5 font-medium flex items-center gap-1" style={{ background: "#0d1a0d", color: "#34d399", border: "1px solid #34d39930" }}>
              <Briefcase className="h-3 w-3" /> {insight.work_hours}h work
            </span>
          )}
        </div>
      )}

      {/* Score badges */}
      <div className="flex flex-wrap gap-1.5">
        <ScoreBadge icon={Zap}   label="Energy"       value={insight.energy}       color="#f59e0b" />
        <ScoreBadge icon={Eye}   label="Focus"         value={insight.focus}        color="#22d3ee" />
        <ScoreBadge icon={Smile} label="Satisfaction"  value={insight.satisfaction} color="#a78bfa" />
        {insight.goals_pct != null && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={{ background: "#0d2318", color: "#6ee7b7", border: "1px solid #2d6a4f30" }}
          >
            ✓ {insight.goals_pct}% goals ({insight.goals_achieved}/{insight.goals_total})
          </span>
        )}
      </div>

      {/* Evaluation */}
      {insight.evaluation && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <BookOpen className="h-3.5 w-3.5" style={{ color: "#fb923c" }} />
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#64748b" }}>Evaluation</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "#cbd5e1" }}>{insight.evaluation}</p>
        </div>
      )}

      {/* Lesson */}
      {insight.lesson && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Lightbulb className="h-3.5 w-3.5" style={{ color: "#facc15" }} />
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#64748b" }}>Lesson Learned</span>
          </div>
          <p
            className="text-xs leading-relaxed rounded-xl px-3 py-2"
            style={{ background: "#0f172a", border: "1px solid #facc1520", color: "#fef9c3" }}
          >
            {insight.lesson}
          </p>
        </div>
      )}
    </article>
  );
}

// ── Summary strip ─────────────────────────────────────────────────────────────
function SummaryStrip({ insights }) {
  if (!insights.length) return null;

  const avg = (key) => {
    const vals = insights.map((i) => i[key]).filter((v) => v != null);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "—";
  };
  const avgSleep = () => {
    const vals = insights.map((i) => i.sleep_hours).filter((v) => v != null);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "—";
  };

  const stats = [
    { label: "Avg Energy",       value: avg("energy"),       color: "#f59e0b" },
    { label: "Avg Focus",        value: avg("focus"),        color: "#22d3ee" },
    { label: "Avg Satisfaction", value: avg("satisfaction"), color: "#a78bfa" },
    { label: "Avg Work",         value: `${avg("work_hours")}h`,  color: "#34d399" },
    { label: "Avg Sleep",        value: `${avgSleep()}h`,    color: "#818cf8" },
  ];

  return (
    <div
      className="rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-5 gap-3"
      style={{ background: "#111827", border: "1px solid #1f2937" }}
    >
      {stats.map(({ label, value, color }) => (
        <div key={label} className="flex flex-col items-center gap-0.5">
          <span className="text-lg font-black" style={{ color }}>{value}</span>
          <span className="text-[10px] text-center uppercase tracking-wide" style={{ color: "#64748b" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DailyInsightsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  // Simple debounce on input
  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(window.__insightSearchTimer);
    window.__insightSearchTimer = setTimeout(() => { setDebouncedSearch(val); setPage(1); }, 400);
  };

  const { data, isLoading, isError, refetch } = useDailyInsights({
    page,
    pageSize: 15,
    search: debouncedSearch,
  });

  const deleteMutation = useDeleteInsight();
  const insights = data?.data ?? [];
  const meta     = data?.meta ?? {};

  return (
    <div className="min-h-screen" style={{ background: "#0B0F17", color: "#f1f5f9" }}>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm mb-3 transition-opacity hover:opacity-70"
              style={{ color: "#64748b" }}
            >
              <ChevronLeft className="h-4 w-4" /> Home
            </Link>
            <h1 className="text-3xl font-bold text-white">Daily Insights</h1>
            {!isLoading && meta.total != null && (
              <p className="text-sm mt-1" style={{ color: "#64748b" }}>
                {meta.total} {meta.total === 1 ? "day" : "days"} recorded
              </p>
            )}
          </div>

          <Link
            href="/one_day_dashboard"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:brightness-110"
            style={{ background: "#0891b2", color: "#fff" }}
          >
            <BookOpen className="h-4 w-4" /> Log Today
          </Link>
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: "#111827", border: "1px solid #1f2937" }}
        >
          <Search className="h-4 w-4 shrink-0" style={{ color: "#64748b" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search evaluations and lessons…"
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
          />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl animate-pulse" style={{ background: "#111827", height: 180 }} />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="rounded-2xl p-6 text-center" style={{ background: "#1a0505", border: "1px solid #7f1d1d" }}>
            <p className="text-sm text-red-400 mb-3">Failed to load insights.</p>
            <button onClick={() => refetch()} className="text-xs px-4 py-1.5 rounded-lg" style={{ background: "#1e293b", color: "#cbd5e1" }}>Retry</button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && insights.length === 0 && (
          <div className="rounded-2xl p-12 text-center" style={{ background: "#111827", border: "1px dashed #334155" }}>
            <p className="text-white font-semibold">No insights yet</p>
            <p className="text-sm mt-1" style={{ color: "#64748b" }}>
              Go to{" "}
              <Link href="/one_day_dashboard" className="underline" style={{ color: "#38bdf8" }}>
                One Day Dashboard
              </Link>{" "}
              and fill in your daily check-in.
            </p>
          </div>
        )}

        {/* Summary strip */}
        {!isLoading && insights.length > 0 && <SummaryStrip insights={insights} />}

        {/* Cards */}
        {!isLoading && insights.length > 0 && (
          <div className="space-y-4">
            {insights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-1.5 rounded-lg text-sm font-medium disabled:opacity-40"
              style={{ background: "#1e293b", color: "#cbd5e1" }}
            >
              ← Prev
            </button>
            <span className="px-3 py-1.5 text-sm" style={{ color: "#64748b" }}>
              {page} / {meta.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="px-4 py-1.5 rounded-lg text-sm font-medium disabled:opacity-40"
              style={{ background: "#1e293b", color: "#cbd5e1" }}
            >
              Next →
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
