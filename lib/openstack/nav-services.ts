import 'server-only';

import { fetchServiceCatalog } from '@/lib/openstack/catalog';
import { resolveNavServices } from '@/lib/openstack/resolve-nav-services';
import type { CatalogService } from '@/types/openstack/catalog';
import type { NavServiceItem } from '@/types/openstack/nav';

export type { NavServiceItem };

/**
 * Navigation services enabled for the active region, derived from the Keystone catalog.
 */
export async function getNavServices(
  regionId: string,
  token: string,
  catalogOverride?: CatalogService[],
): Promise<NavServiceItem[]> {
  const catalog = catalogOverride ?? (await fetchServiceCatalog(token));
  if (!catalog) {
    return [];
  }

  return resolveNavServices(catalog, regionId);
}
