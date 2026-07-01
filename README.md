# Sunrise

## Getting Started

### Prerequisites

- **Node.js** >= 22.13 (required by `pnpm@11.1.3` and Next.js 16)
- **pnpm** via Corepack (`corepack enable`)

If you use the Nix devshell (`direnv allow` with `use flake` in `.envrc`), Node and pnpm are provided automatically.

Otherwise install Node 22 (e.g. [nvm](https://github.com/nvm-sh/nvm) with `.nvmrc`, or the [official binaries](https://nodejs.org/)) and ensure it is on your `PATH` before running pnpm.

1. Copy `.env.dist` to `.env.local` and set at minimum `KEYSTONE_API`, `DASHBOARD_URL`,
   `SESSION_SECRET`, and `KEYSTONE_FEDERATION_IDENTITY_PROVIDERS`. Next.js loads `.env.local`
   automatically — do **not** `source` it in your shell (some values are not valid bash syntax).

   Set `KEYSTONE_FEDERATION_IDENTITY_PROVIDERS` to your Keystone domain name(s). On dev1
   (`us-dev-1`), tenant domains such as `63781` are the federation IdP IDs.

   **Default login (no Keycloak client in Sunrise):** Sign-in redirects through Keystone WebSSO.
   Keystone handles Keycloak OIDC; Sunrise receives the token at `/auth/websso`. No `KEYCLOAK_*`
   variables are required.

   **Optional unified OIDC + S3:** Set `KEYCLOAK_ISSUER`, `KEYCLOAK_SERVER_CLIENT_ID`, and
   `KEYCLOAK_SERVER_CLIENT_SECRET` to use Sunrise as the OIDC relying party (required for S3 STS
   token exchange). Add `KEYCLOAK_S3_CLIENT_ID` when using object storage.

2. Start the development server

   ```bash
   pnpm dev -p 9990
   ```

   The dev script uses webpack instead of Turbopack to avoid `ENOSPC` / inotify watch-limit errors on Linux. If you prefer Turbopack and have raised system limits (`fs.inotify.max_user_watches`), run `pnpm exec next dev -p 9990` directly.

3. Navigate to the following URL. You will be redirected to login with Keycloak:

   [http://localhost:9990](http://localhost:9990)
