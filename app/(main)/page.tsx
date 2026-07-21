import { Suspense } from "react";
import ProjectStats from "@/components/ProjectStats";
import { ProjectStatsSkeleton } from "@/components/ProjectStatsSkeleton";
import { PageShell } from "@/components/PageShell";

export default function Page() {
  return (
    <PageShell>
      <div className="mx-auto w-full max-w-screen-xl">
        <h1 className="mb-6 border-b-2 pb-2 text-3xl font-bold">Overview</h1>
        <Suspense fallback={<ProjectStatsSkeleton />}>
          <ProjectStats />
        </Suspense>
      </div>
    </PageShell>
  );
}
