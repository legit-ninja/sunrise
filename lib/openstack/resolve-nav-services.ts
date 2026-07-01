import { serviceHasPublicEndpointInRegion } from '@/lib/openstack/catalog';
import {
  CATALOG_TYPES_COVERED_BY_REGISTRY,
  NAV_EXCLUDED_CATALOG_TYPES,
  NAV_SERVICE_REGISTRY,
  type NavServiceDefinition,
} from '@/lib/openstack/service-registry';
import type { CatalogService } from '@/types/openstack/catalog';
import type { NavServiceItem } from '@/types/openstack/nav';

function registryEntryEnabled(
  entry: NavServiceDefinition,
  catalog: CatalogService[],
  regionId: string,
): boolean {
  return catalog.some((service) => {
    if (!entry.catalogTypes.includes(service.type)) {
      return false;
    }
    if (
      entry.catalogNames &&
      !entry.catalogNames.includes(service.name)
    ) {
      return false;
    }
    return serviceHasPublicEndpointInRegion(service, regionId);
  });
}

function titleCase(value: string): string {
  return value
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function genericNavItem(
  service: CatalogService,
  regionId: string,
): NavServiceItem | null {
  if (
    NAV_EXCLUDED_CATALOG_TYPES.has(service.type) ||
    CATALOG_TYPES_COVERED_BY_REGISTRY.has(service.type)
  ) {
    return null;
  }
  if (!serviceHasPublicEndpointInRegion(service, regionId)) {
    return null;
  }

  const slug = encodeURIComponent(service.type);
  return {
    id: `catalog-${service.type}-${service.name}`,
    title: titleCase(service.name || service.type),
    description: `OpenStack ${service.type} service (${service.name}).`,
    href: `/services/${slug}`,
    icon: 'box',
    placeholder: true,
    catalogType: service.type,
    catalogName: service.name,
  };
}

export function resolveNavServices(
  catalog: CatalogService[],
  regionId: string,
): NavServiceItem[] {
  const items: NavServiceItem[] = [];

  for (const entry of NAV_SERVICE_REGISTRY) {
    if (!registryEntryEnabled(entry, catalog, regionId)) {
      continue;
    }
    items.push({
      id: entry.id,
      title: entry.title,
      description: entry.description,
      href: entry.href,
      icon: entry.icon,
      placeholder: entry.placeholder,
    });
  }

  const seenHrefs = new Set(items.map((item) => item.href));

  for (const service of catalog) {
    const generic = genericNavItem(service, regionId);
    if (!generic || seenHrefs.has(generic.href)) {
      continue;
    }
    items.push(generic);
    seenHrefs.add(generic.href);
  }

  return items.sort((a, b) => a.title.localeCompare(b.title));
}
