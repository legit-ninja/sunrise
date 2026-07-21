# Sunrise

## Getting Started

1. Create a client inside Keycloak which will be used for authenticating
   the user using Sunrise.

2. Make a copy of the file `.env.dist` and rename the copy to `.env.local` in the root of the project and update the
   variables (refer to the values as examples):

3. Start the development server

   ```bash
   pnpm dev -p 9990
   ```

4. Navigate to the following URL. You will be redirected to login with Keycloak:

   [http://localhost:9990](http://localhost:9990)

## Image builds (mock API)

On-demand image builds call an external Image Build API (not OpenStack Glance).
For local UI work, run the mock sibling service and point Sunrise at it:

```bash
# terminal A — mock API (http://localhost:8090)
cd ../image-build-api && pnpm install && pnpm dev

# terminal B — Sunrise
# Ensure IMAGE_BUILD_API=http://localhost:8090 in .env.local (see .env.dist)
pnpm dev -p 9990
```

Then open **Compute → Image Builds**. See [`image-build-api/README.md`](../image-build-api/README.md) for fixtures and status progression.

## OpenStack API coverage

Services in the header grid are driven by the Keystone catalog for the selected region (see `lib/openstack/nav-services.ts`). Coverage status (implemented vs Preview/stub) is tracked in [`docs/openstack-api-coverage.md`](docs/openstack-api-coverage.md).
