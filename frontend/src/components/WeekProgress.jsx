"use client";

export default function WeekProgress({ progress }) {
  const getProgressColor = () => {
    if (progress >= 80) return "bg-emerald-500";
    if (progress >= 50) return "bg-amber-500";
    if (progress >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">
          Week Progress
        </span>
        <span className="text-sm font-bold tabular-nums">
          {progress}%
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
