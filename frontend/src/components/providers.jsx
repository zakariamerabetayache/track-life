"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

/**
 * Providers — wraps the entire app with client-side context providers.
 *
 * QueryClient is created inside useState so it's stable across re-renders
 * but unique per browser tab (prevents shared state between SSR requests).
 */
export function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Don't refetch when the user switches browser tabs —
            // good default for admin/dashboard apps, prevents disorienting jumps
            refetchOnWindowFocus: false,

            // Stale after 30 seconds — balances freshness vs request volume
            staleTime: 30 * 1000,

            // Show previous data while a new page is loading —
            // prevents the table from flashing empty between page changes
            placeholderData: (prev) => prev,

            // Retry once on failure, then show the error state
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
