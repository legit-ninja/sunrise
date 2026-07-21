'use server';

import { openstack } from '@/lib/openstack/actions';
import { getSession } from '@/lib/session';

async function resolveRegionId(regionId?: string): Promise<string> {
  if (regionId) return regionId;
  const session = await getSession();
  if (!session.regionId) {
    throw new Error('No region available for Cinder request');
  }
  return session.regionId;
}

export async function deleteVolumeAction(
  id: string,
  regionId?: string
): Promise<void> {
  const resolvedRegion = await resolveRegionId(regionId);
  const result = await openstack({
    regionId: resolvedRegion,
    serviceType: 'volumev3',
    serviceName: 'cinder',
    path: `/volumes/${id}`,
    method: 'DELETE',
  });

  // openstack returns null on empty success bodies; treat non-throw as ok
  // unless we need to detect failure — openstack already logs API errors and returns null
  void result;
}
