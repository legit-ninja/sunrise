"use server";

import { getSession } from "@/lib/session";
import {
  fetchJob,
  fetchJobs,
  fetchTemplates,
  ImageBuildApiError,
  postCancelJob,
  postJob,
} from "./client";
import type { Job, JobCreateRequest, Template } from "./types";

export type ImageBuildActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

function toErrorResult(error: unknown): ImageBuildActionResult<never> {
  if (error instanceof ImageBuildApiError) {
    return { ok: false, error: error.message, status: error.status };
  }
  return {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
  };
}

async function requireProjectContext(): Promise<
  | { ok: true; projectId: string; regionId: string }
  | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session.projectId) {
    return { ok: false, error: "No project selected in session" };
  }
  if (!session.regionId) {
    return { ok: false, error: "No region available in session" };
  }
  return {
    ok: true,
    projectId: session.projectId,
    regionId: session.regionId,
  };
}

export async function listImageBuildTemplates(): Promise<
  ImageBuildActionResult<Template[]>
> {
  try {
    return { ok: true, data: await fetchTemplates() };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function listImageBuildJobs(): Promise<
  ImageBuildActionResult<Job[]>
> {
  const ctx = await requireProjectContext();
  if (!ctx.ok) {
    return { ok: false, error: ctx.error };
  }

  try {
    return {
      ok: true,
      data: await fetchJobs({ projectId: ctx.projectId }),
    };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function getImageBuildJob(
  id: string,
): Promise<ImageBuildActionResult<Job>> {
  try {
    return { ok: true, data: await fetchJob(id) };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function createImageBuildJob(input: {
  templateId: string;
  parameters?: Record<string, unknown>;
}): Promise<ImageBuildActionResult<Job>> {
  const ctx = await requireProjectContext();
  if (!ctx.ok) {
    return { ok: false, error: ctx.error };
  }

  const body: JobCreateRequest = {
    template_id: input.templateId,
    project_id: ctx.projectId,
    region_id: ctx.regionId,
    parameters: input.parameters,
  };

  try {
    return {
      ok: true,
      data: await postJob(body, { projectId: ctx.projectId }),
    };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function cancelImageBuildJob(
  id: string,
): Promise<ImageBuildActionResult<Job>> {
  try {
    return { ok: true, data: await postCancelJob(id) };
  } catch (error) {
    return toErrorResult(error);
  }
}
