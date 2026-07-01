import type { NavServiceIcon } from '@/types/openstack/nav';

export type { NavServiceIcon };

export type NavServiceDefinition = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: NavServiceIcon;
  /** Enabled when any of these Keystone service types have a public endpoint in the region. */
  catalogTypes: string[];
  /** When set, at least one catalog entry must match both type and name. */
  catalogNames?: string[];
  placeholder?: boolean;
};

/**
 * Sunrise navigation tiles. Visibility is driven by the Keystone service catalog
 * (see getNavServices). Add entries here for every service that should have a
 * dedicated route; unmatched catalog services get a generic placeholder page.
 */
export const NAV_SERVICE_REGISTRY: NavServiceDefinition[] = [
  {
    id: 'compute',
    title: 'Compute',
    description: 'Virtual machines, networks, and storage volumes.',
    href: '/compute/instances',
    icon: 'server',
    catalogTypes: ['compute'],
  },
  {
    id: 'kubernetes',
    title: 'Kubernetes',
    description: 'Deploy and manage container orchestration clusters.',
    href: '/kubernetes',
    icon: 'container',
    catalogTypes: ['container-infra'],
  },
  {
    id: 'object-storage',
    title: 'Object Storage',
    description: 'S3-compatible storage for files and objects.',
    href: '/object-storage',
    icon: 'database',
    catalogTypes: ['object-storage-s3', 'object-store'],
  },
  {
    id: 'orchestration',
    title: 'Orchestration',
    description: 'Template-based infrastructure deployment with Heat.',
    href: '/orchestration',
    icon: 'layers',
    catalogTypes: ['orchestration'],
    placeholder: true,
  },
  {
    id: 'dns',
    title: 'DNS',
    description: 'Manage DNS zones and domain records.',
    href: '/dns',
    icon: 'globe',
    catalogTypes: ['dns'],
    placeholder: true,
  },
  {
    id: 'file-system',
    title: 'File System',
    description: 'Shared file system storage and shares.',
    href: '/file-system',
    icon: 'folder-tree',
    catalogTypes: ['sharev2', 'share'],
    placeholder: true,
  },
  {
    id: 'load-balancer',
    title: 'Load Balancers',
    description: 'Managed load balancing with Octavia.',
    href: '/services/load-balancer',
    icon: 'network',
    catalogTypes: ['load-balancer'],
    placeholder: true,
  },
  {
    id: 'key-manager',
    title: 'Key Manager',
    description: 'Secrets and key management with Barbican.',
    href: '/services/key-manager',
    icon: 'key',
    catalogTypes: ['key-manager'],
    placeholder: true,
  },
  {
    id: 'placement',
    title: 'Placement',
    description: 'Resource provider inventory and allocation.',
    href: '/services/placement',
    icon: 'cpu',
    catalogTypes: ['placement'],
    placeholder: true,
  },
  {
    id: 'database',
    title: 'Database',
    description: 'Database as a service.',
    href: '/services/database',
    icon: 'hard-drive',
    catalogTypes: ['database', 'database-instance'],
    placeholder: true,
  },
  {
    id: 'metric',
    title: 'Telemetry',
    description: 'Metrics and monitoring.',
    href: '/services/metric',
    icon: 'gauge',
    catalogTypes: ['metric'],
    placeholder: true,
  },
  {
    id: 'alarming',
    title: 'Alarming',
    description: 'Alarms and notifications.',
    href: '/services/alarming',
    icon: 'shield',
    catalogTypes: ['alarming'],
    placeholder: true,
  },
];

/** Catalog types that are consumed by other nav tiles and should not spawn generic entries. */
export const CATALOG_TYPES_COVERED_BY_REGISTRY = new Set(
  NAV_SERVICE_REGISTRY.flatMap((entry) => entry.catalogTypes),
);

export const NAV_EXCLUDED_CATALOG_TYPES = new Set(['identity', 'identityv3']);

export function getRegistryEntryForSlug(
  serviceSlug: string,
): NavServiceDefinition | undefined {
  const decoded = decodeURIComponent(serviceSlug);
  return NAV_SERVICE_REGISTRY.find(
    (entry) =>
      entry.id === decoded ||
      entry.catalogTypes.includes(decoded) ||
      entry.href === `/services/${decoded}`,
  );
}
