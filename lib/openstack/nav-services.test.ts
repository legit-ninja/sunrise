import { describe, expect, it } from 'vitest';

import { serviceHasPublicEndpointInRegion } from '@/lib/openstack/catalog';
import { resolveNavServices } from '@/lib/openstack/resolve-nav-services';
import type { CatalogService } from '@/types/openstack/catalog';

const regionId = 'RegionOne';

function catalogService(
  type: string,
  name: string,
  endpoints: CatalogService['endpoints'] = [
    {
      id: '1',
      interface: 'public',
      region: regionId,
      url: `https://example.com/${type}`,
    },
  ],
): CatalogService {
  return { id: 'svc', type, name, endpoints };
}

describe('serviceHasPublicEndpointInRegion', () => {
  it('matches public endpoints by region name', () => {
    const service = catalogService('compute', 'nova');
    expect(serviceHasPublicEndpointInRegion(service, regionId)).toBe(true);
    expect(serviceHasPublicEndpointInRegion(service, 'other')).toBe(false);
  });

  it('matches public endpoints by region_id', () => {
    const service = catalogService('compute', 'nova', [
      {
        id: '1',
        interface: 'public',
        region: 'display-name',
        region_id: regionId,
        url: 'https://example.com/compute',
      },
    ]);
    expect(serviceHasPublicEndpointInRegion(service, regionId)).toBe(true);
  });
});

describe('resolveNavServices', () => {
  it('returns registry tiles enabled in the catalog', () => {
    const catalog = [
      catalogService('compute', 'nova'),
      catalogService('container-infra', 'magnum'),
      catalogService('identity', 'keystone'),
    ];

    const items = resolveNavServices(catalog, regionId);
    const titles = items.map((item) => item.title);

    expect(titles).toContain('Compute');
    expect(titles).toContain('Kubernetes');
    expect(titles).not.toContain('Keystone');
  });

  it('adds generic entries for unknown catalog services', () => {
    const catalog = [
      catalogService('compute', 'nova'),
      catalogService('workflow', 'mistral'),
    ];

    const items = resolveNavServices(catalog, regionId);
    const workflow = items.find((item) => item.catalogType === 'workflow');

    expect(workflow).toMatchObject({
      title: 'Mistral',
      href: '/services/workflow',
      placeholder: true,
    });
  });
});
