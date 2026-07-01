import { redirect } from 'next/navigation';

import type { CatalogEndpoint, CatalogService, ServiceCatalog } from '@/types/openstack/catalog';

function endpointMatchesRegion(endpoint: CatalogEndpoint, regionId: string): boolean {
  return (
    endpoint.region === regionId ||
    endpoint.region_id === regionId
  );
}

export function serviceHasPublicEndpointInRegion(
  service: CatalogService,
  regionId: string,
): boolean {
  return service.endpoints.some(
    (endpoint) =>
      endpoint.interface === 'public' && endpointMatchesRegion(endpoint, regionId),
  );
}

async function fetchCatalogResponse(token: string): Promise<Response> {
  return fetch(`${process.env.KEYSTONE_API}/v3/auth/catalog`, {
    headers: {
      'X-Auth-Token': token,
    },
    cache: 'no-store',
  });
}

export async function fetchServiceCatalog(
  token: string,
): Promise<CatalogService[] | null> {
  let catalogResponse: Response;
  try {
    catalogResponse = await fetchCatalogResponse(token);
  } catch (error) {
    console.error('[catalog] failed to fetch service catalog', { error });
    return null;
  }

  if (!catalogResponse.ok) {
    if (catalogResponse.status === 401) {
      redirect('/auth/logout?reason=expired');
    }
    return null;
  }

  try {
    const catalogData = (await catalogResponse.json()) as ServiceCatalog;
    return catalogData.catalog ?? [];
  } catch (error) {
    console.error('[catalog] failed to parse service catalog', { error });
    return null;
  }
}

/**
 * Get service endpoint URL from OpenStack service catalog.
 */
export async function getServiceEndpoint(
  regionId: string,
  serviceType: string,
  serviceName: string,
  token: string,
): Promise<string | null> {
  const catalog = await fetchServiceCatalog(token);
  if (!catalog) {
    return null;
  }

  const serviceEntry = catalog.find(
    (item) => item.type === serviceType || item.name === serviceName,
  );

  if (!serviceEntry) {
    console.error('[catalog] service not found', { serviceName, serviceType });
    return null;
  }

  const endpointEntry = serviceEntry.endpoints.find(
    (endpoint) =>
      endpoint.interface === 'public' && endpointMatchesRegion(endpoint, regionId),
  );

  if (!endpointEntry) {
    console.error('[catalog] public endpoint not found', {
      regionId,
      serviceName,
      serviceType,
    });
    return null;
  }

  return endpointEntry.url;
}
