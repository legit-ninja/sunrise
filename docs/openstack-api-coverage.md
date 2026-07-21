# OpenStack API coverage (Sunrise)

Inventory of Keystone catalog types vs Sunrise console surfaces. Nav visibility
is driven by [`lib/openstack/nav-services.ts`](../lib/openstack/nav-services.ts)
(registry + per-region catalog match). Unknown catalog types stay hidden.

Status legend:

| Status | Meaning |
|--------|---------|
| `full` | List/detail and core lifecycle via OpenStack APIs |
| `partial` | Some resources/actions; gaps remain |
| `stub` | Overview / Preview only; no real API CRUD yet |
| `missing` | Not implemented (removed from sidebar until built) |

## Services menu (catalog → nav)

| Catalog match (`type` / `name`) | Sunrise route | Nav status | Coverage |
|---------------------------------|---------------|------------|----------|
| `compute`, `image`, `volumev3`/`volumev2`, `network` (any) | `/compute/instances` | available | See Compute group below |
| `container-infra` / `magnum` | `/kubernetes` | available | Magnum: partial–full for clusters/templates |
| `object-store`, `object-storage-s3` / `s3`, `swift`, `radosgw` | `/object-storage` | available | RGW S3 via STS: partial |
| `orchestration` / `heat` | `/orchestration` | preview | stub |
| `dns` / `designate` | `/dns` | preview | stub |
| `share` / `manila` | `/file-system` | preview | stub |
| `load-balancer` / `octavia` | `/services/load-balancer` | preview | stub (placeholder page) |
| `identity` and other infra types | — | hidden | Auth/session only |

## Resource / API matrix

| Area | Route(s) | Hooks / actions | Status |
|------|----------|-----------------|--------|
| Nova instances | `/compute/instances`, detail, console | `useServers`, `nova-actions`, `console-actions` | partial |
| Flavors | `/compute/instance-flavors` | Nova via openstack() | partial |
| Glance images | `/compute/images` | `useImages` | partial |
| Image builds | `/compute/image-builds` | `useImageBuildJobs` (external `IMAGE_BUILD_API`, **not** Keystone) | partial (mock/prod API) |
| Cinder volumes | `/compute/volumes` | `useVolumes` | partial |
| Cinder snapshots | `/compute/snapshots` | volume hooks | partial |
| Neutron networks | `/compute/networks` | `useNetworks` | partial |
| Key pairs | `/compute/key-pairs` | Nova | partial |
| Security groups | — | — | missing (sidebar link removed) |
| Magnum clusters | `/kubernetes/clusters` | `useMagnum` | partial |
| Magnum templates | `/kubernetes/templates` | `useMagnum` | partial |
| Octavia (under K8s sidebar) | — | — | missing (use Services → Load Balancing preview) |
| Object storage buckets/objects | `/object-storage/buckets` | `useBuckets`, `useObjects`, S3 STS | partial |
| Heat stacks/templates | `/orchestration` | — | stub |
| Designate zones/records | `/dns` | — | stub |
| Manila shares | `/file-system` | — | stub |
| Project quotas UI | home `ProjectStats` | `lib/openstack/quotas` (Nova/Cinder limits, Neutron quota details, Magnum/Glance when present) | partial |
| Keystone IAM CRUD | — | — | missing (login/federation only) |
| Barbican | — | — | missing |

## Demoted sidebar links (404 avoided)

| Former link | Disposition |
|-------------|-------------|
| `/compute/security-groups` | Removed from compute sidebar until implemented |
| `/kubernetes/load-balancers` | Removed; Octavia via `/services/load-balancer` Preview when in catalog |
| `/orchestration/stacks`, `templates`, `resource-types` | Removed; overview only |
| `/dns/zones`, `record-sets`, `zone-transfers` | Removed; overview only |
| `/file-system/shares`, `share-networks`, `security-services` | Removed; overview only |

## How to extend

1. Add or update an entry in `SERVICE_NAV_REGISTRY`.
2. Implement routes/hooks; set `status: 'available'` when past stub.
3. Update this matrix.
4. Re-add sidebar children only when pages exist.
