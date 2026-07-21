/**
 * Types for the Image Build API (mock / future production service).
 * Contract: image-build-api openapi.yaml
 */

export type JobStatus =
  | "queued"
  | "building"
  | "uploading"
  | "succeeded"
  | "failed"
  | "cancelled";

export type StageStatus =
  | "pending"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

export type StageName = "queued" | "build" | "upload" | "verify";

export type Stage = {
  name: StageName;
  status: StageStatus;
};

export type JobResult = {
  glance_image_id: string | null;
  glance_image_name: string | null;
  error_message: string | null;
};

export type Template = {
  id: string;
  name: string;
  description: string;
  workflow: string;
  visibility_default: "private" | "public";
  roles: string[];
  parameters_schema: Record<string, unknown>;
};

export type Job = {
  id: string;
  status: JobStatus;
  progress: number;
  template_id: string;
  project_id: string;
  region_id: string;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  parameters?: Record<string, unknown>;
  stages: Stage[];
  result: JobResult;
};

export type JobCreateRequest = {
  template_id: string;
  project_id: string;
  region_id: string;
  parameters?: Record<string, unknown>;
  target?: {
    visibility?: "private" | "public";
    promote_to_public?: boolean;
  };
};

export type TemplateListResponse = {
  templates: Template[];
};

export type JobListResponse = {
  jobs: Job[];
};

export const IN_FLIGHT_JOB_STATUSES: JobStatus[] = [
  "queued",
  "building",
  "uploading",
];

export function isInFlightJobStatus(status: JobStatus): boolean {
  return IN_FLIGHT_JOB_STATUSES.includes(status);
}

export function isTerminalJobStatus(status: JobStatus): boolean {
  return status === "succeeded" || status === "failed" || status === "cancelled";
}
