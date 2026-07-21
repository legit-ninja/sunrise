import { Skeleton } from "@/components/ui/skeleton";

export function ProjectStatsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading quota summary">
      <Skeleton className="mb-6 h-7 w-40" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[260px] w-[240px] rounded-xl" />
        ))}
      </div>
    </div>
  );
}
