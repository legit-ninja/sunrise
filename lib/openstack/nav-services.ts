import 'server-only';

import { getSession } from '@/lib/session';
import {
  catalogHasServiceInRegion,
  fetchAuthCatalog,
} from '@/lib/openstack/catalog';
import type {
  NavServiceIcon,
  NavServiceItem,
  NavServiceStatus,
} from '@/lib/openstack/nav-types';

export type { NavServiceIcon, NavServiceItem, NavServiceStatus };

type NavRegistryEntry = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: NavServiceIcon;
  catalogTypes: string[];
  catalogNames?: string[];
  status: NavServiceStatus;
};

/**
 * Product-oriented nav registry. Visibility is decided only here + catalog match —
 * not in ServicesMenu. Unknown Keystone types are hidden.
 */
export const SERVICE_NAV_REGISTRY: NavRegistryEntry[] = [
  {
    id: 'compute',
    title: 'Compute',
    description: 'Virtual machines, networks, and storage volumes.',
    href: '/compute/instances',
    icon: 'Server',
    catalogTypes: ['compute', 'image', 'volumev3', 'volumev2', 'network'],
    status: 'available',
  },
  {
    id: 'kubernetes',
    title: 'Kubernetes',
    description: 'Deploy and manage orchestration clusters.',
    href: '/kubernetes',
    icon: 'Container',
    catalogTypes: ['container-infra'],
    catalogNames: ['magnum'],
    status: 'available',
  },
  {
    id: 'object-storage',
    title: 'Object storage',
    description: 'S3-compatible storage for files and objects.',
    href: '/object-storage',
    icon: 'Database',
    catalogTypes: ['object-store', 'object-storage-s3'],
    catalogNames: ['s3', 'swift', 'radosgw'],
    status: 'available',
  },
  {
    id: 'orchestration',
    title: 'Orchestration',
    description: 'Template-based infrastructure deployment.',
    href: '/orchestration',
    icon: 'Layers',
    catalogTypes: ['orchestration'],
    catalogNames: ['heat'],
    status: 'preview',
  },
  {
    id: 'dns',
    title: 'DNS',
    description: 'Manage DNS zones and domain records.',
    href: '/dns',
    icon: 'Globe',
    catalogTypes: ['dns'],
    catalogNames: ['designate'],
    status: 'preview',
  },
  {
    id: 'file-system',
    title: 'File system',
    description: 'Shared file system storage and shares.',
    href: '/file-system',
    icon: 'FolderTree',
    catalogTypes: ['share'],
    catalogNames: ['manila'],
    status: 'preview',
  },
  {
    id: 'load-balancer',
    title: 'Load balancing',
    description: 'Load balancers, listeners, and pools.',
    href: '/services/load-balancer',
    icon: 'Network',
    catalogTypes: ['load-balancer'],
    catalogNames: ['octavia'],
    status: 'preview',
  },
];

/**
 * Services available in the active region per Keystone catalog, filtered
 * through SERVICE_NAV_REGISTRY (unknown types stay hidden).
 */
export async function getNavServices(regionId: string): Promise<NavServiceItem[]> {
  if (!regionId) {
    return [];
  }

  const session = await getSession();
  const token =
    session.keystoneProjectToken ?? session.keystone_unscoped_token;
  if (!token) {
    return [];
  }

  const catalog = await fetchAuthCatalog(token);
  if (!catalog) {
    return [];
  }

  return SERVICE_NAV_REGISTRY.filter((entry) =>
    catalogHasServiceInRegion(
      catalog,
      regionId,
      entry.catalogTypes,
      entry.catalogNames ?? []
    )
  ).map(({ id, title, description, href, icon, status }) => ({
    id,
    title,
    description,
    href,
    icon,
    status,
  }));
}
