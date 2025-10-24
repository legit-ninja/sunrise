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
  key_pairs?: QuotaUsage;
  server_groups?: QuotaUsage;
  server_group_members?: QuotaUsage;
};

export type VolumeQuotas = {
  volumes: QuotaUsage;
  gigabytes: QuotaUsage;
  snapshots: QuotaUsage;
  backups?: QuotaUsage;
  backup_gigabytes?: QuotaUsage;
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

  console.log("Compute quota API response:", data);
  console.log("Quota set:", quotaSet);

  return {
    instances: {
      used: parseInt(quotaSet.instances?.in_use) || 0,
      limit: parseInt(quotaSet.instances?.limit) || -1,
      reserved: parseInt(quotaSet.instances?.reserved) || 0,
    },
    cores: {
      used: parseInt(quotaSet.cores?.in_use) || 0,
      limit: parseInt(quotaSet.cores?.limit) || -1,
      reserved: parseInt(quotaSet.cores?.reserved) || 0,
    },
    ram: {
      used: Math.round((parseInt(quotaSet.ram?.in_use) || 0) / 1024), // Convert MB to GB
      limit: Math.round((parseInt(quotaSet.ram?.limit) || 0) / 1024), // Convert MB to GB
      reserved: Math.round((parseInt(quotaSet.ram?.reserved) || 0) / 1024), // Convert MB to GB
    },
    key_pairs: {
      used: parseInt(quotaSet.key_pairs?.in_use) || 0,
      limit: parseInt(quotaSet.key_pairs?.limit) || -1,
      reserved: parseInt(quotaSet.key_pairs?.reserved) || 0,
    },
    server_groups: {
      used: parseInt(quotaSet.server_groups?.in_use) || 0,
      limit: parseInt(quotaSet.server_groups?.limit) || -1,
      reserved: parseInt(quotaSet.server_groups?.reserved) || 0,
    },
    server_group_members: {
      used: parseInt(quotaSet.server_group_members?.in_use) || 0,
      limit: parseInt(quotaSet.server_group_members?.limit) || -1,
      reserved: parseInt(quotaSet.server_group_members?.reserved) || 0,
    },
  };
}

export async function getVolumeQuotas(projectId?: string): Promise<VolumeQuotas> {
  const token = await session().get("projectToken");
  let cinderEndpoint;
  try {
    cinderEndpoint = await getServiceEndpoint("volumev3", "public");
  } catch {
    cinderEndpoint = await getServiceEndpoint("volume", "public");
  }

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
      used: parseInt(quotaSet.volumes?.in_use) || 0,
      limit: parseInt(quotaSet.volumes?.limit) || -1,
      reserved: parseInt(quotaSet.volumes?.reserved) || 0,
    },
    gigabytes: {
      used: parseInt(quotaSet.gigabytes?.in_use) || 0,
      limit: parseInt(quotaSet.gigabytes?.limit) || -1,
      reserved: parseInt(quotaSet.gigabytes?.reserved) || 0,
    },
    snapshots: {
      used: parseInt(quotaSet.snapshots?.in_use) || 0,
      limit: parseInt(quotaSet.snapshots?.limit) || -1,
      reserved: parseInt(quotaSet.snapshots?.reserved) || 0,
    },
    backups: {
      used: parseInt(quotaSet.backups?.in_use) || 0,
      limit: parseInt(quotaSet.backups?.limit) || -1,
      reserved: parseInt(quotaSet.backups?.reserved) || 0,
    },
    backup_gigabytes: {
      used: parseInt(quotaSet.backup_gigabytes?.in_use) || 0,
      limit: parseInt(quotaSet.backup_gigabytes?.limit) || -1,
      reserved: parseInt(quotaSet.backup_gigabytes?.reserved) || 0,
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
      used: parseInt(quota.networks?.used) || 0,
      limit: parseInt(quota.networks?.limit) || -1,
    },
    subnets: {
      used: parseInt(quota.subnets?.used) || 0,
      limit: parseInt(quota.subnets?.limit) || -1,
    },
    ports: {
      used: parseInt(quota.ports?.used) || 0,
      limit: parseInt(quota.ports?.limit) || -1,
    },
    routers: {
      used: parseInt(quota.routers?.used) || 0,
      limit: parseInt(quota.routers?.limit) || -1,
    },
    floatingips: {
      used: parseInt(quota.floatingips?.used) || 0,
      limit: parseInt(quota.floatingips?.limit) || -1,
    },
    security_groups: {
      used: parseInt(quota.security_groups?.used) || 0,
      limit: parseInt(quota.security_groups?.limit) || -1,
    },
    security_group_rules: {
      used: parseInt(quota.security_group_rules?.used) || 0,
      limit: parseInt(quota.security_group_rules?.limit) || -1,
    },
  };
}

export async function getServiceEndpoint(
  service: string,
  serviceInterface: string,
): Promise<Endpoint> {
  const projectData = await session().get("projectData");

  if (!projectData || !projectData.catalog) {
    throw new Error("No project data or catalog found");
  }

  const catalog = projectData.catalog;

  const serviceEntry = catalog.find(
    (item: { type: string }) => item.type == service,
  );

  if (!serviceEntry) {
    throw new Error(`Service ${service} not found in catalog`);
  }

  const endpoint = serviceEntry.endpoints.find(
    (endpoint: { interface: string }) => endpoint.interface == serviceInterface,
  );

  if (!endpoint) {
    throw new Error(`Endpoint with interface ${serviceInterface} not found for service ${service}`);
  }

  return endpoint;
}

export async function getServiceEndpoints(services: string[], serviceInterface: string): Promise<Endpoint[]> {
  const projectData = await session().get("projectData");
  const catalog = projectData.catalog;
  //console.log("getServiceEndpoints: " + catalog);
  const endpoints = catalog
    .filter((item: { type: string }) => services.includes(item.type))
    .map((item: { endpoints: Endpoint[] }) => item.endpoints)
    .flat() // Flatten the array of arrays into a single array
    .filter((endpoint: { interface: string }) => endpoint.interface === serviceInterface);
  return endpoints;
}
