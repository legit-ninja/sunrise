import { ReactNode, Suspense } from "react";
import {
  HydrationBoundary,
  dehydrate,
  type QueryClient,
} from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/query-client";
import { Spinner } from "@/components/ui/spinner";

interface PrefetchHydrationBoundaryProps {
  queries: Array<any>;
  children: ReactNode;
  fallback?: ReactNode;
  queryClient?: QueryClient;
}

function DefaultLoadingFallback() {
  return (
    <div className="flex items-center justify-center p-6" aria-busy="true">
      <Spinner className="size-6" />
    </div>
  );
}

export async function PrefetchHydrationBoundary({
  queries,
  children,
  fallback,
  queryClient,
}: PrefetchHydrationBoundaryProps) {
  const prefetchQueryClient = queryClient ?? makeQueryClient();

  await Promise.all(
    queries.map((query) => prefetchQueryClient.prefetchQuery(query)),
  );

  return (
    <HydrationBoundary state={dehydrate(prefetchQueryClient)}>
      <Suspense fallback={fallback ?? <DefaultLoadingFallback />}>
        {children}
      </Suspense>
    </HydrationBoundary>
  );
}
