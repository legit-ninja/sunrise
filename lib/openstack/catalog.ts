import { redirect } from 'next/navigation';

export type CatalogEndpoint = {
  interface?: string;
  region?: string;
  region_id?: string;
  url?: string;
};

export type CatalogService = {
  type?: string;
  name?: string;
  endpoints?: CatalogEndpoint[];
};

/**
 * Fetch the Keystone auth catalog for a token.
 * On 401, redirects to logout (expired session).
 */
export async function fetchAuthCatalog(
  token: string
): Promise<CatalogService[] | null> {
  let catalogResponse: Response;
  try {
    catalogResponse = await fetch(`${process.env.KEYSTONE_API}/v3/auth/catalog`, {
      headers: {
        'X-Auth-Token': token,
      },
      cache: 'no-store',
    });
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
    const catalogData = await catalogResponse.json();
    return (catalogData.catalog ?? []) as CatalogService[];
  } catch (error) {
    console.error('[catalog] failed to parse service catalog', { error });
    return null;
  }
}

function endpointMatchesRegion(
  ep: CatalogEndpoint,
  regionId: string
): boolean {
  return (
    ep.interface === 'public' &&
    (ep.region === regionId || ep.region_id === regionId)
  );
}

/**
 * Get service endpoint URL from OpenStack service catalog
 * Fetches from Keystone and returns the direct OpenStack endpoint URL
 */
export async function getServiceEndpoint(
  regionId: string,
  serviceType: string,
  serviceName: string,
  token: string
): Promise<string | null> {
  const catalog = await fetchAuthCatalog(token);
  if (!catalog) {
    return null;
  }

  const serviceEntry = catalog.find(
    (item) => item.type === serviceType || item.name === serviceName
  );

  if (!serviceEntry) {
    console.error('[catalog] service not found', {
      serviceName,
      serviceType,
    });
    console.error(
      '[catalog] available services:',
      catalog.map((s) => ({ type: s.type, name: s.name }))
    );
    return null;
  }

  const endpointEntry = (serviceEntry.endpoints ?? []).find((ep) =>
    endpointMatchesRegion(ep, regionId)
  );

  if (!endpointEntry?.url) {
    console.error('[catalog] public endpoint not found', {
      regionId,
      serviceName,
      serviceType,
    });
    console.error(
      '[catalog] endpoints for service:',
      (serviceEntry.endpoints ?? []).map((ep) => ({
        interface: ep.interface,
        region: ep.region,
        region_id: ep.region_id,
        url: ep.url,
      }))
    );
    return null;
  }

  return endpointEntry.url;
}

/** True if catalog has a public endpoint in region matching type or name. */
export function catalogHasServiceInRegion(
  catalog: CatalogService[],
  regionId: string,
  types: string[],
  names: string[] = []
): boolean {
  const typeSet = new Set(types.map((t) => t.toLowerCase()));
  const nameSet = new Set(names.map((n) => n.toLowerCase()));

  return catalog.some((item) => {
    const type = item.type?.toLowerCase() ?? '';
    const name = item.name?.toLowerCase() ?? '';
    const matches =
      typeSet.has(type) || nameSet.has(name) || typeSet.has(name);
    if (!matches) return false;
    return (item.endpoints ?? []).some((ep) =>
      endpointMatchesRegion(ep, regionId)
    );
  });
}
