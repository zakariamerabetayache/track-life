"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Legend,
} from "recharts";
import { Moon, Briefcase, Clock, TrendingUp, TrendingDown, Sun, Bed } from "lucide-react";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Calculates duration in decimal hours between two "HH:MM" strings.
 *  Handles midnight crossings: 23:00 → 07:00 = 8 hours. */
function calcHours(from, to) {
  if (!from || !to) return 0;
  const [fh, fm] = from.split(":").map(Number);
  const [th, tm] = to.split(":").map(Number);
  if (isNaN(fh) || isNaN(fm) || isNaN(th) || isNaN(tm)) return 0;
  const fromMins = fh * 60 + fm;
  const toMins = th * 60 + tm;
  const diffMins = toMins >= fromMins
    ? toMins - fromMins
    : 24 * 60 - fromMins + toMins;
  return Math.round((diffMins / 60) * 100) / 100;
}

/** Converts "HH:MM" string to minutes from midnight.
 *  If isBedtime & hour < 12 (e.g. 01:00 AM), we treat as 24+1 = 25h so it averages correctly with 23:00. */
function timeToMins(timeStr, isBedtime = false) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  let mins = h * 60 + m;
  if (isBedtime && h < 12) {
    mins += 24 * 60; // 01:00 AM becomes 25:00 for smooth averaging
  }
  return mins;
}

/** Formats minutes from midnight into 12-hour time (e.g. "11:15 PM" or "7:30 AM") */
function minsToTimeStr(mins) {
  if (mins === null || isNaN(mins) || mins === 0) return "—";
  let normalized = Math.round(mins) % (24 * 60);
  if (normalized < 0) normalized += 24 * 60;

  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m < 10 ? `0${m}` : m;

  return `${displayH}:${displayM} ${period}`;
}

function fmtHours(h) {
  if (!h || h === 0) return "0h";
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

/* ─── Duration Tooltip ─────────────────────────────────────────────────── */
function DurationTooltip({ active, payload, label, target }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const diff = val - target;
  return (
    <div className="rounded-xl border border-border/60 bg-popover/95 backdrop-blur-sm p-3 shadow-xl text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-muted-foreground">
        Duration: <span className="font-bold text-foreground">{fmtHours(val)}</span>
      </p>
      {target > 0 && val > 0 && (
        <p className={`text-xs mt-1 font-medium ${diff >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
          {diff >= 0 ? `+${fmtHours(diff)} over target` : `${fmtHours(Math.abs(diff))} under target`}
        </p>
      )}
    </div>
  );
}

/* ─── Schedule Tooltip ─────────────────────────────────────────────────── */
function ScheduleTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="rounded-xl border border-border/60 bg-popover/95 backdrop-blur-sm p-3 shadow-xl text-sm space-y-1">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>

      <div className="flex items-center gap-2 text-amber-400">
        <Sun className="h-3.5 w-3.5" />
        <span>Wake Up: <strong className="text-foreground">{data.wakeStr || "—"}</strong></span>
      </div>
      <div className="flex items-center gap-2 text-indigo-400">
        <Bed className="h-3.5 w-3.5" />
        <span>Bedtime: <strong className="text-foreground">{data.bedtimeStr || "—"}</strong></span>
      </div>
    </div>
  );
}

/* ─── Duration Chart Panel ─────────────────────────────────────────────── */
function TrackingChart({
  title,
  icon: Icon,
  data,
  target,
  targetLabel,
  goodColor,
  warnColor,
  badColor,
  accentColor,
  emptyMessage,
}) {
  const filled = data.filter((d) => d.hours > 0);
  const avg = filled.length ? filled.reduce((s, d) => s + d.hours, 0) / filled.length : 0;
  const best = filled.length ? filled.reduce((a, d) => (d.hours > a.hours ? d : a), filled[0]) : null;
  const worst = filled.length ? filled.reduce((a, d) => (d.hours > 0 && d.hours < a.hours ? d : a), filled[0]) : null;

  const getColor = (h) => {
    if (h === 0) return "hsl(var(--muted)/0.5)";
    if (h >= target) return goodColor;
    if (h >= target * 0.75) return warnColor;
    return badColor;
  };

  const maxVal = Math.max(target + 2, ...data.map((d) => d.hours));

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
      <div className="px-6 pt-5 pb-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}20`, border: `1px solid ${accentColor}30` }}
          >
            <Icon className="h-5 w-5" style={{ color: accentColor }} />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">{title}</h3>
            {target > 0 && (
              <p className="text-xs text-muted-foreground">
                Target: <span className="font-semibold">{targetLabel}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border/30 border-b border-border/30">
        {[
          { label: "Weekly Avg", value: fmtHours(avg), icon: Clock },
          { label: "Best Day", value: best ? `${best.day} · ${fmtHours(best.hours)}` : "—", icon: TrendingUp },
          { label: "Worst Day", value: worst ? `${worst.day} · ${fmtHours(worst.hours)}` : "—", icon: TrendingDown },
        ].map(({ label, value, icon: I }) => (
          <div key={label} className="px-4 py-3 text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5 flex items-center justify-center gap-1">
              <I className="h-3 w-3" /> {label}
            </p>
            <p className="text-sm font-bold text-foreground leading-tight">{value}</p>
          </div>
        ))}
      </div>

      <div className="px-4 pt-4 pb-5">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} barSize={32} margin={{ top: 12, right: 4, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `${v}h`}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, maxVal + 1]}
            />
            <Tooltip
              content={<DurationTooltip target={target} />}
              cursor={{ fill: "hsl(var(--muted)/0.3)", radius: 6 }}
            />
            {target > 0 && (
              <ReferenceLine
                y={target}
                stroke={accentColor}
                strokeDasharray="5 3"
                strokeOpacity={0.7}
                label={{
                  value: targetLabel,
                  position: "insideTopRight",
                  fill: accentColor,
                  fontSize: 10,
                  dy: -4,
                }}
              />
            )}
            <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={getColor(entry.hours)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {filled.length === 0 && (
          <p className="text-xs text-muted-foreground text-center mt-2 italic">
            {emptyMessage}
          </p>
        )}

        <div className="flex items-center justify-center gap-4 mt-3 pt-2 border-t border-border/20">
          {[
            { color: goodColor, label: `≥ ${target}h target` },
            { color: warnColor, label: "Close" },
            { color: badColor, label: "Under" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Sleep & Wake Times Schedule Chart Panel ──────────────────────────── */
function SleepScheduleChart({ dayGoals }) {
  const safeDayGoals = dayGoals || [];
  const keywords = ["نوم", "sleep", "النوم"];

  const scheduleData = DAY_LABELS.map((day, dayIndex) => {
    const match = safeDayGoals.find(
      (dg) =>
        dg.day_of_week === dayIndex &&
        keywords.some((kw) => {
          const title = (dg.goal?.title ?? "").toLowerCase();
          const cat = (dg.goal?.category?.name ?? "").toLowerCase();
          return title.includes(kw.toLowerCase()) || cat.includes(kw.toLowerCase());
        }) &&
        dg.time_from &&
        dg.time_to
    );

    const bedMins = match ? timeToMins(match.time_from, true) : null;
    const wakeMins = match ? timeToMins(match.time_to, false) : null;

    return {
      day,
      bedMins,
      wakeMins,
      bedtimeStr: match ? minsToTimeStr(timeToMins(match.time_from, false)) : null,
      wakeStr: match ? minsToTimeStr(wakeMins) : null,
      // For charting: bedtime as decimal hours (e.g. 23.5 for 11:30 PM), wake as decimal hours (e.g. 7.5)
      bedHour: bedMins !== null ? Math.round(((bedMins % (24 * 60)) / 60) * 10) / 10 : null,
      wakeHour: wakeMins !== null ? Math.round((wakeMins / 60) * 10) / 10 : null,
    };
  });

  // Calculate Average Bedtime and Average Wake Time
  const validBeds = scheduleData.map((d) => d.bedMins).filter((m) => m !== null);
  const validWakes = scheduleData.map((d) => d.wakeMins).filter((m) => m !== null);

  const avgBedMins = validBeds.length ? validBeds.reduce((a, b) => a + b, 0) / validBeds.length : null;
  const avgWakeMins = validWakes.length ? validWakes.reduce((a, b) => a + b, 0) / validWakes.length : null;

  const avgBedStr = minsToTimeStr(avgBedMins);
  const avgWakeStr = minsToTimeStr(avgWakeMins);

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm col-span-full">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-border/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Bed className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Bedtime & Wake Up Schedule</h3>
            <p className="text-xs text-muted-foreground">Daily sleep & wake times for this week</p>
          </div>
        </div>

        {/* Average Stats Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10">
            <Moon className="h-4 w-4 text-indigo-400" />
            <div>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Avg Bedtime</p>
              <p className="text-xs font-bold text-indigo-400">{avgBedStr}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10">
            <Sun className="h-4 w-4 text-amber-400" />
            <div>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Avg Wake Up</p>
              <p className="text-xs font-bold text-amber-400">{avgWakeStr}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="px-4 pt-4 pb-5">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={scheduleData} margin={{ top: 12, right: 16, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `${v}:00`}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 14]}
              ticks={ [0, 4, 7,8, 12, 14]}
            />
            <Tooltip content={<ScheduleTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
            />
            <Line
              type="monotone"
              dataKey="bedHour"
              name="Bedtime"
              stroke="#818cf8"
              strokeWidth={2.5}
              dot={{ fill: "#818cf8", r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="wakeHour"
              name="Wake Up Time"
              stroke="#fbbf24"
              strokeWidth={2.5}
              dot={{ fill: "#fbbf24", r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>

        {validBeds.length === 0 && (
          <p className="text-xs text-muted-foreground text-center mt-2 italic">
            Enter start & end times on sleep goals to see bedtime & wake up trends.
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Main Export ────────────────────────────────────────────────────────── */
export default function TimeTrackingDashboard({ dayGoals }) {
  const safeDayGoals = dayGoals || [];

  function buildChartData(keywords) {
    return DAY_LABELS.map((day, dayIndex) => {
      const matches = safeDayGoals.filter(
        (dg) =>
          dg.day_of_week === dayIndex &&
          keywords.some((kw) => {
            const title = (dg.goal?.title ?? "").toLowerCase();
            const cat = (dg.goal?.category?.name ?? "").toLowerCase();
            if (keywords.includes("work")) {
  const noCategory = cat === "";

  return (
    title.includes(kw.toLowerCase()) ||
    (noCategory && !title.includes("sleep") && !title.includes("نوم") && !title.includes("النوم"))
  );
}
            else{
            return title.includes(kw.toLowerCase()) || cat.includes(kw.toLowerCase());
            }
          }) &&
          dg.time_from &&
          dg.time_to
      );

      const totalHours = matches.reduce(
        (sum, dg) => sum + calcHours(dg.time_from, dg.time_to),
        0
      );

      return {
        day,
        hours: Math.round(totalHours * 100) / 100,
      };
    });
  }

  const sleepData = buildChartData(["نوم", "sleep", "النوم"]);
  const workData = buildChartData(["work", "عمل", "job"]);

  return (
    <section className="space-y-4 my-4">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border/50" />
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-2">
          Time Tracking Dashboard
        </span>
        <div className="h-px flex-1 bg-border/50" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Sleep Duration Bar Chart */}
        <TrackingChart
          title="Sleep Hours"
          icon={Moon}
          data={sleepData}
          target={7}
          targetLabel="7h goal"
          goodColor="#6366f1"
          warnColor="#f59e0b"
          badColor="#f43f5e"
          accentColor="#818cf8"
          emptyMessage="Enter start & end times on sleep goals below to track hours."
        />

        {/* Work Duration Bar Chart */}
        <TrackingChart
          title="Work Hours Tracking"
          icon={Briefcase}
          data={workData}
          target={8}
          targetLabel="8h goal"
          goodColor="#10b981"
          warnColor="#f59e0b"
          badColor="#f43f5e"
          accentColor="#34d399"
          emptyMessage="Enter start & end times on work goals below to track hours."
        />

        {/* NEW: Bedtime & Wake Up Times Schedule Chart with Averages */}
        <SleepScheduleChart dayGoals={safeDayGoals} />
      </div>
    </section>
  );
}
