import { getSession } from "@/lib/session";
import { ImageBuildsClient } from "./ImageBuildsClient";
import { BuildImageActions } from "./BuildImageActions";
import {
  imageBuildJobsQueryOptions,
  imageBuildTemplatesQueryOptions,
} from "@/hooks/queries/useImageBuildJobs";
import { DataTableHydrationBoundary } from "@/components/DataTable/HydrationBoundary";

export default async function Page() {
  const session = await getSession();

  return (
    <DataTableHydrationBoundary
      resourceName="image build"
      actions={
        <BuildImageActions
          regionId={session.regionId}
          projectId={session.projectId}
        />
      }
      queries={[
        imageBuildJobsQueryOptions(session.regionId, session.projectId),
        imageBuildTemplatesQueryOptions(),
      ]}
    >
      <ImageBuildsClient
        regionId={session.regionId}
        projectId={session.projectId}
      />
    </DataTableHydrationBoundary>
  );
}
