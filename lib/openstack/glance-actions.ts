'use server';

import { openstack } from '@/lib/openstack/actions';
import { getSession } from '@/lib/session';

async function resolveRegionId(regionId?: string): Promise<string> {
  if (regionId) return regionId;
  const session = await getSession();
  if (!session.regionId) {
    throw new Error('No region available for Glance request');
  }
  return session.regionId;
}

export async function deleteImageAction(
  id: string,
  regionId?: string
): Promise<void> {
  const resolvedRegion = await resolveRegionId(regionId);
  await openstack({
    regionId: resolvedRegion,
    serviceType: 'image',
    serviceName: 'glance',
    path: `/v2/images/${id}`,
    method: 'DELETE',
  });
}
