"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

function StreakHoverCard({ streak, children }) {
  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger>{children}</HoverCardTrigger>

      <HoverCardContent className="w-64 rounded-xl">
        <div className="space-y-2">
          <h4 className="font-semibold text-base">
            🔥 {streak?.count} Day Streak
          </h4>

          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Started:</span>{" "}
              {streak.date_from}
            </p>
            <p>
              <span className="font-medium text-foreground">Ended:</span>{" "}
              {streak.date_to}
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export default function PreviousStreaks({ streaks }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateScrollState();

    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction * 220,
      behavior: "smooth",
    });
  };

  if (!streaks?.length) {
    return null;
  }

  return (
    <div className="mt-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Previous Streaks
        </p>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7 rounded-full"
            onClick={() => scroll(-1)}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7 rounded-full"
            onClick={() => scroll(1)}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-hidden scroll-smooth"
      >
        {streaks.map((streak, index) => (
          <div key={index} className="flex shrink-0 items-center gap-2">
            <StreakHoverCard streak={streak}>
              <button
                className="h-9 min-w-9 rounded-full bg-slate-800 px-3 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-orange-500"
              >
                {streak.count}
              </button>
            </StreakHoverCard>

            {index !== streaks.length - 1 && (
              <div className="h-[2px] w-5 rounded-full bg-border" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
