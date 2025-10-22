import { session, TokenData } from "@/lib/session";

export type Project = {
  id: string;
  name: string;
  domain_id: string;
  description: string;
  enabled: boolean;
  parent_id: string;
  is_domain: boolean;
  tags: [];
  options: {};
  links: {
    self: string;
  };
};

export type Endpoint = {
  id: string;
  interface: string;
  region_id: string;
  url: string;
  region: string;
};

export type QuotaUsage = {
  used: number;
  limit: number;
  reserved?: number;
};

export type ComputeQuotas = {
  instances: QuotaUsage;
  cores: QuotaUsage;
  ram: QuotaUsage;
};

export type VolumeQuotas = {
  volumes: QuotaUsage;
  gigabytes: QuotaUsage;
  snapshots: QuotaUsage;
};

export type NetworkQuotas = {
  networks: QuotaUsage;
  subnets: QuotaUsage;
  ports: QuotaUsage;
  routers: QuotaUsage;
  floatingips: QuotaUsage;
  security_groups: QuotaUsage;
  security_group_rules: QuotaUsage;
};

export async function listUserProjects(token?: string): Promise<Project[]> {
  if (!token) {
    const token = await session().get("token");
  }
  const response = await fetch(`${process.env.KEYSTONE_API}/v3/auth/projects`, {
    headers: {
      "X-Auth-Token": token,
    } as HeadersInit,
  });

  const json = await response.json();
  json.projects.sort((a: Project, b: Project) => { return a.name.localeCompare(b.name); });

  return json.projects;
}

export async function fetchProjectScopedToken(
  token: string,
  projects: { id: string }[],
  selectedProject: Project,
): Promise<{ token: string; data: TokenData }> {
  const response = await fetch(`${process.env.KEYSTONE_API}/v3/auth/tokens`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    } as HeadersInit,
    body: JSON.stringify({
      auth: {
        identity: {
          methods: ["token"],
          token: {
            id: token,
          },
        },
        scope: {
          project: {
            id: selectedProject.id,
          },
        },
      },
    }),
  });

  const scopedToken = response.headers.get("X-Subject-Token");
  const data = await response.json();

  return { token: scopedToken as string, data: data.token };
}

export async function getComputeQuotas(projectId?: string): Promise<ComputeQuotas> {
  const token = await session().get("projectToken");
  const novaEndpoint = await getServiceEndpoint("compute", "public");

  if (!novaEndpoint) {
    throw new Error("Nova endpoint not found");
  }

  const project = projectId || (await session().get("selectedProject"))?.id;
  if (!project) {
    throw new Error("No project selected");
  }

  const response = await fetch(`${novaEndpoint.url}/os-quota-sets/${project}`, {
    headers: {
      "X-Auth-Token": token,
    } as HeadersInit,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch compute quotas: ${response.statusText}`);
  }

  const data = await response.json();
  const quotaSet = data.quota_set;

  return {
    instances: {
      used: quotaSet.instances?.in_use || 0,
      limit: quotaSet.instances?.limit || 0,
      reserved: quotaSet.instances?.reserved || 0,
    },
    cores: {
      used: quotaSet.cores?.in_use || 0,
      limit: quotaSet.cores?.limit || 0,
      reserved: quotaSet.cores?.reserved || 0,
    },
    ram: {
      used: Math.round((quotaSet.ram?.in_use || 0) / 1024), // Convert MB to GB
      limit: Math.round((quotaSet.ram?.limit || 0) / 1024), // Convert MB to GB
      reserved: Math.round((quotaSet.ram?.reserved || 0) / 1024), // Convert MB to GB
    },
  };
}

export async function getVolumeQuotas(projectId?: string): Promise<VolumeQuotas> {
  const token = await session().get("projectToken");
  const cinderEndpoint = await getServiceEndpoint("volumev3", "public");

  if (!cinderEndpoint) {
    throw new Error("Cinder endpoint not found");
  }

  const project = projectId || (await session().get("selectedProject"))?.id;
  if (!project) {
    throw new Error("No project selected");
  }

  const response = await fetch(`${cinderEndpoint.url}/os-quota-sets/${project}`, {
    headers: {
      "X-Auth-Token": token,
    } as HeadersInit,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch volume quotas: ${response.statusText}`);
  }

  const data = await response.json();
  const quotaSet = data.quota_set;

  return {
    volumes: {
      used: quotaSet.volumes?.in_use || 0,
      limit: quotaSet.volumes?.limit || 0,
      reserved: quotaSet.volumes?.reserved || 0,
    },
    gigabytes: {
      used: quotaSet.gigabytes?.in_use || 0,
      limit: quotaSet.gigabytes?.limit || 0,
      reserved: quotaSet.gigabytes?.reserved || 0,
    },
    snapshots: {
      used: quotaSet.snapshots?.in_use || 0,
      limit: quotaSet.snapshots?.limit || 0,
      reserved: quotaSet.snapshots?.reserved || 0,
    },
  };
}

export async function getNetworkQuotas(projectId?: string): Promise<NetworkQuotas> {
  const token = await session().get("projectToken");
  const neutronEndpoint = await getServiceEndpoint("network", "public");

  if (!neutronEndpoint) {
    throw new Error("Neutron endpoint not found");
  }

  const project = projectId || (await session().get("selectedProject"))?.id;
  if (!project) {
    throw new Error("No project selected");
  }

  const response = await fetch(`${neutronEndpoint.url}/v2.0/quotas/${project}`, {
    headers: {
      "X-Auth-Token": token,
    } as HeadersInit,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch network quotas: ${response.statusText}`);
  }

  const data = await response.json();
  const quota = data.quota;

  return {
    networks: {
      used: quota.networks?.used || 0,
      limit: quota.networks?.limit || 0,
    },
    subnets: {
      used: quota.subnets?.used || 0,
      limit: quota.subnets?.limit || 0,
    },
    ports: {
      used: quota.ports?.used || 0,
      limit: quota.ports?.limit || 0,
    },
    routers: {
      used: quota.routers?.used || 0,
      limit: quota.routers?.limit || 0,
    },
    floatingips: {
      used: quota.floatingips?.used || 0,
      limit: quota.floatingips?.limit || 0,
    },
    security_groups: {
      used: quota.security_groups?.used || 0,
      limit: quota.security_groups?.limit || 0,
    },
    security_group_rules: {
      used: quota.security_group_rules?.used || 0,
      limit: quota.security_group_rules?.limit || 0,
    },
  };
}

export async function getServiceEndpoint(
  service: string,
  serviceInterface: string,
): Promise<Endpoint> {
  const projectData = await session().get("projectData");
  const catalog = projectData.catalog;
  //console.log("getServiceEndpoint: " + catalog);
  const endpoints = catalog.find(
    (item: { name: string }) => item.name == service,
  );
  const endpoint = endpoints.endpoints.find(
    (endpoint: { interface: string }) => endpoint.interface == serviceInterface,
  );

  return endpoint;
}

export async function getServiceEndpoints(services: string[], serviceInterface: string): Promise<Endpoint[]> {
  const projectData = await session().get("projectData");
  const catalog = projectData.catalog;
  //console.log("getServiceEndpoints: " + catalog);
  const endpoints = catalog
    .filter((item: { name: string }) => services.includes(item.name))
    .map((item: { endpoints: Endpoint[] }) => item.endpoints)
    .flat() // Flatten the array of arrays into a single array
    .filter((endpoint: { interface: string }) => endpoint.interface === serviceInterface);
  return endpoints;
}
