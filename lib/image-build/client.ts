import type {
  Job,
  JobCreateRequest,
  JobListResponse,
  Template,
  TemplateListResponse,
} from "./types";

export class ImageBuildApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ImageBuildApiError";
    this.status = status;
  }
}

function getBaseUrl(): string {
  const base = process.env.IMAGE_BUILD_API?.replace(/\/$/, "");
  if (!base) {
    throw new ImageBuildApiError(
      "IMAGE_BUILD_API is not configured. Set it to the mock or production Image Build API URL (e.g. http://localhost:8090).",
      500,
    );
  }
  return base;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | undefined>;
  headers?: Record<string, string>;
};

async function imageBuildFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const base = getBaseUrl();
  const url = new URL(`${base}${path}`);

  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...options.headers,
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ImageBuildApiError(
      `Image Build API unreachable: ${message}`,
      503,
    );
  }

  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`;
    try {
      const data = (await response.json()) as { error?: string };
      if (data.error) detail = data.error;
    } catch {
      // ignore parse errors
    }
    throw new ImageBuildApiError(detail, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function fetchTemplates(): Promise<Template[]> {
  const data = await imageBuildFetch<TemplateListResponse>("/v1/templates");
  return data.templates;
}

export async function fetchTemplate(id: string): Promise<Template> {
  return imageBuildFetch<Template>(`/v1/templates/${id}`);
}

export async function fetchJobs(filters: {
  projectId?: string;
  status?: string;
}): Promise<Job[]> {
  const data = await imageBuildFetch<JobListResponse>("/v1/jobs", {
    query: {
      project_id: filters.projectId,
      status: filters.status,
    },
  });
  return data.jobs;
}

export async function fetchJob(id: string): Promise<Job> {
  return imageBuildFetch<Job>(`/v1/jobs/${id}`);
}

export async function postJob(
  body: JobCreateRequest,
  meta?: { projectId?: string; userId?: string },
): Promise<Job> {
  const headers: Record<string, string> = {};
  if (meta?.projectId) headers["X-Project-Id"] = meta.projectId;
  if (meta?.userId) headers["X-User-Id"] = meta.userId;

  return imageBuildFetch<Job>("/v1/jobs", {
    method: "POST",
    body,
    headers,
  });
}

export async function postCancelJob(id: string): Promise<Job> {
  return imageBuildFetch<Job>(`/v1/jobs/${id}/cancel`, {
    method: "POST",
  });
}
