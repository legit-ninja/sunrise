/**
 * TanStack Query options for Image Build API
 */

import { queryOptions } from "@tanstack/react-query";
import {
  getImageBuildJob,
  listImageBuildJobs,
  listImageBuildTemplates,
} from "@/lib/image-build/actions";
import { isInFlightJobStatus } from "@/lib/image-build/types";

export const IMAGE_BUILD_JOB_REFETCH_INTERVAL_MS = 4000;

export function imageBuildTemplatesQueryOptions() {
  return queryOptions({
    queryKey: ["image-build", "templates"],
    queryFn: async () => {
      const result = await listImageBuildTemplates();
      if (!result.ok) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}

export function imageBuildJobsQueryOptions(
  regionId: string | undefined,
  projectId: string | undefined,
) {
  return queryOptions({
    queryKey: [regionId, projectId, "image-build", "jobs"],
    queryFn: async () => {
      const result = await listImageBuildJobs();
      if (!result.ok) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!regionId && !!projectId,
    refetchInterval: (query) => {
      const jobs = query.state.data;
      if (!jobs?.length) return false;
      return jobs.some((job) => isInFlightJobStatus(job.status))
        ? IMAGE_BUILD_JOB_REFETCH_INTERVAL_MS
        : false;
    },
  });
}

export function imageBuildJobQueryOptions(
  regionId: string | undefined,
  projectId: string | undefined,
  id: string,
) {
  return queryOptions({
    queryKey: [regionId, projectId, "image-build", "job", id],
    queryFn: async () => {
      const result = await getImageBuildJob(id);
      if (!result.ok) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!id && !!regionId && !!projectId,
    refetchInterval: (query) => {
      const job = query.state.data;
      if (!job) return false;
      return isInFlightJobStatus(job.status)
        ? IMAGE_BUILD_JOB_REFETCH_INTERVAL_MS
        : false;
    },
  });
}
