import 'server-only';

import { openstack } from '@/lib/openstack/actions';
import { getSession } from '@/lib/session';

export type QuotaItem = {
  label: string;
  used: number;
  limit: number;
  units: string;
};

export type QuotaGroup = {
  name: string;
  items: QuotaItem[];
};

type AbsoluteLimits = Record<string, number>;

type LimitsResponse = {
  limits?: {
    absolute?: AbsoluteLimits;
  };
};

type NeutronQuotaDetail = {
  limit?: number;
  in_use?: number;
  reserved?: number;
  used?: number;
};

type NeutronQuotaDetailsResponse = {
  quota?: Record<string, NeutronQuotaDetail | number>;
};

type MagnumQuotaResponse = {
  hard_limit?: number;
  project_id?: string;
  resource?: string;
  id?: string;
};

const NEUTRON_LABELS: Record<string, string> = {
  network: 'Networks',
  subnet: 'Subnets',
  port: 'Ports',
  router: 'Routers',
  floatingip: 'Floating IPs',
  security_group: 'Security groups',
  security_group_rule: 'Security group rules',
  subnetpool: 'Subnet pools',
  rbac_policy: 'RBAC policies',
};

const MAGNUM_LABELS: Record<string, string> = {
  Cluster: 'Clusters',
  cluster: 'Clusters',
  ClusterTemplate: 'Cluster templates',
  clustertemplate: 'Cluster templates',
};

function item(
  label: string,
  used: number | undefined,
  limit: number | undefined,
  units = ''
): QuotaItem | null {
  if (used === undefined || limit === undefined) {
    return null;
  }
  return { label, used, limit, units };
}

function ramToGb(mb: number): number {
  return Math.round((mb / 1024) * 10) / 10;
}

function sentenceLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/^./, (c) => c.toUpperCase());
}

function neutronLabel(key: string): string {
  return NEUTRON_LABELS[key] ?? sentenceLabel(key);
}

function fromAbsolute(
  abs: AbsoluteLimits,
  mappings: Array<{
    label: string;
    usedKey: string;
    limitKey: string;
    units?: string;
    transform?: (n: number) => number;
  }>
): QuotaItem[] {
  return mappings
    .map(({ label, usedKey, limitKey, units = '', transform }) => {
      const usedRaw = abs[usedKey];
      const limitRaw = abs[limitKey];
      if (usedRaw === undefined || limitRaw === undefined) {
        return null;
      }
      const used = transform ? transform(usedRaw) : usedRaw;
      const limit = transform ? transform(limitRaw) : limitRaw;
      return item(label, used, limit, units);
    })
    .filter(Boolean) as QuotaItem[];
}

function neutronDetailItems(
  quota: Record<string, NeutronQuotaDetail | number>
): QuotaItem[] {
  return Object.entries(quota)
    .map(([key, value]) => {
      if (typeof value === 'number') {
        // Limits-only response without usage — skip (no fake zeros)
        return null;
      }
      const limit = value.limit;
      const usedCount =
        value.in_use !== undefined
          ? value.in_use
          : value.used !== undefined
            ? value.used
            : undefined;
      if (usedCount === undefined || limit === undefined) {
        return null;
      }
      return item(neutronLabel(key), usedCount, limit);
    })
    .filter(Boolean) as QuotaItem[];
}

function magnumQuotaItems(
  payload: MagnumQuotaResponse | MagnumQuotaResponse[] | { quotas?: MagnumQuotaResponse[] } | null
): QuotaItem[] {
  if (!payload) return [];

  let list: MagnumQuotaResponse[] = [];
  if (Array.isArray(payload)) {
    list = payload;
  } else if ('quotas' in payload && Array.isArray(payload.quotas)) {
    list = payload.quotas;
  } else if ('resource' in payload && payload.resource) {
    list = [payload];
  }

  return list
    .map((row) => {
      if (row.hard_limit === undefined || !row.resource) {
        return null;
      }
      const used = (row as MagnumQuotaResponse & { in_use?: number }).in_use;
      if (used === undefined) {
        return null;
      }
      const label =
        MAGNUM_LABELS[row.resource] ?? sentenceLabel(row.resource);
      return item(label, used, row.hard_limit);
    })
    .filter(Boolean) as QuotaItem[];
}

/**
 * Magnum project quotas list often lacks usage. When that happens, derive
 * cluster count from the clusters list against the Cluster hard_limit.
 */
async function fetchMagnumQuotaGroup(
  regionId: string,
  projectId: string
): Promise<QuotaGroup | null> {
  const clusterQuotaPath = `/quotas/${projectId}/Cluster`;
  const templateQuotaPath = `/quotas/${projectId}/ClusterTemplate`;

  const [clusterQuota, templateQuota, clustersPayload] = await Promise.all([
    openstack<MagnumQuotaResponse>({
      regionId,
      serviceType: 'container-infra',
      serviceName: 'magnum',
      path: clusterQuotaPath,
      apiVersion: 'container-infra latest',
    }),
    openstack<MagnumQuotaResponse>({
      regionId,
      serviceType: 'container-infra',
      serviceName: 'magnum',
      path: templateQuotaPath,
      apiVersion: 'container-infra latest',
    }),
    openstack<{ clusters?: unknown[]; clustertemplates?: unknown[] }>({
      regionId,
      serviceType: 'container-infra',
      serviceName: 'magnum',
      path: '/clusters',
      apiVersion: 'container-infra latest',
    }),
  ]);

  const items: QuotaItem[] = [];
  const clusterUsed = clustersPayload?.clusters?.length;

  if (
    clusterQuota?.hard_limit !== undefined &&
    clusterUsed !== undefined
  ) {
    const clusterItem = item('Clusters', clusterUsed, clusterQuota.hard_limit);
    if (clusterItem) items.push(clusterItem);
  } else {
    const fromPayload = magnumQuotaItems(
      [clusterQuota, templateQuota].filter(Boolean) as MagnumQuotaResponse[]
    );
    items.push(...fromPayload);
  }

  // Template quota: limit only when usage is unavailable — omit (no fake zeros)
  // unless Magnum returns in_use on the quota object.
  if (templateQuota?.hard_limit !== undefined) {
    const templateUsed = (templateQuota as MagnumQuotaResponse & { in_use?: number })
      .in_use;
    if (templateUsed !== undefined) {
      const templateItem = item(
        'Cluster templates',
        templateUsed,
        templateQuota.hard_limit
      );
      if (templateItem) items.push(templateItem);
    }
  }

  if (!items.length) {
    return null;
  }

  return { name: 'Kubernetes', items };
}

async function fetchGlanceQuotaGroup(
  _regionId: string
): Promise<QuotaGroup | null> {
  // Glance project quotas are optional; /v2/info is not available on us-dev-1.
  // Skip without calling a known-missing endpoint (no fake zeros).
  return null;
}

/**
 * Fetch project quotas for Overview (Nova, Cinder, Neutron, Magnum, Glance).
 * Skips services that fail or return no usable used+limit pairs.
 */
export async function fetchProjectQuotaGroups(): Promise<{
  groups: QuotaGroup[];
  error?: string;
} | null> {
  const session = await getSession();
  const regionId = session.regionId;
  const projectId = session.projectId;

  if (!regionId || !projectId || !session.keystoneProjectToken) {
    return null;
  }

  const [nova, cinder, neutron, magnumGroup, glanceGroup] = await Promise.all([
    openstack<LimitsResponse>({
      regionId,
      serviceType: 'compute',
      serviceName: 'nova',
      path: '/limits',
      apiVersion: 'compute 2.79',
    }),
    openstack<LimitsResponse>({
      regionId,
      serviceType: 'volumev3',
      serviceName: 'cinder',
      path: '/limits',
    }),
    openstack<NeutronQuotaDetailsResponse>({
      regionId,
      serviceType: 'network',
      serviceName: 'neutron',
      path: `/v2.0/quotas/${projectId}/details`,
    }),
    fetchMagnumQuotaGroup(regionId, projectId),
    fetchGlanceQuotaGroup(regionId),
  ]);

  const groups: QuotaGroup[] = [];
  const novaAbs = nova?.limits?.absolute;
  const cinderAbs = cinder?.limits?.absolute;
  const neutronQuota = neutron?.quota;

  if (novaAbs) {
    const computeItems = fromAbsolute(novaAbs, [
      {
        label: 'Instances',
        usedKey: 'totalInstancesUsed',
        limitKey: 'maxTotalInstances',
      },
      {
        label: 'VCPUs',
        usedKey: 'totalCoresUsed',
        limitKey: 'maxTotalCores',
      },
      {
        label: 'RAM',
        usedKey: 'totalRAMUsed',
        limitKey: 'maxTotalRAMSize',
        units: 'GB',
        transform: ramToGb,
      },
      {
        label: 'Key pairs',
        usedKey: 'totalKeypairsUsed',
        limitKey: 'maxTotalKeypairs',
      },
      {
        label: 'Server groups',
        usedKey: 'totalServerGroupsUsed',
        limitKey: 'maxServerGroups',
      },
    ]);

    if (computeItems.length) {
      groups.push({ name: 'Compute', items: computeItems });
    }

    // Nova legacy network only when Neutron details unavailable
    if (!neutronQuota) {
      const networkItems = fromAbsolute(novaAbs, [
        {
          label: 'Floating IPs',
          usedKey: 'totalFloatingIpsUsed',
          limitKey: 'maxTotalFloatingIps',
        },
        {
          label: 'Security groups',
          usedKey: 'totalSecurityGroupsUsed',
          limitKey: 'maxSecurityGroups',
        },
        {
          label: 'Security group rules',
          usedKey: 'totalSecurityGroupRulesUsed',
          limitKey: 'maxSecurityGroupRules',
        },
      ]);
      if (networkItems.length) {
        groups.push({ name: 'Network', items: networkItems });
      }
    }
  }

  if (cinderAbs) {
    const volumeItems = fromAbsolute(cinderAbs, [
      {
        label: 'Volumes',
        usedKey: 'totalVolumesUsed',
        limitKey: 'maxTotalVolumes',
      },
      {
        label: 'Volume snapshots',
        usedKey: 'totalSnapshotsUsed',
        limitKey: 'maxTotalSnapshots',
      },
      {
        label: 'Volume storage',
        usedKey: 'totalGigabytesUsed',
        limitKey: 'maxTotalVolumeGigabytes',
        units: 'GB',
      },
      {
        label: 'Backups',
        usedKey: 'totalBackupsUsed',
        limitKey: 'maxTotalBackups',
      },
      {
        label: 'Backup storage',
        usedKey: 'totalBackupGigabytesUsed',
        limitKey: 'maxTotalBackupGigabytes',
        units: 'GB',
      },
    ]);

    if (volumeItems.length) {
      groups.push({ name: 'Volume', items: volumeItems });
    }
  }

  if (neutronQuota) {
    const networkItems = neutronDetailItems(neutronQuota);
    if (networkItems.length) {
      groups.push({ name: 'Network', items: networkItems });
    }
  }

  if (magnumGroup?.items.length) {
    groups.push(magnumGroup);
  }

  if (glanceGroup?.items.length) {
    groups.push(glanceGroup);
  }

  if (!groups.length) {
    return {
      groups: [],
      error:
        "Couldn't load quotas. Refresh the page or confirm APIs are available in this region.",
    };
  }

  return { groups };
}
