import 'server-only';

/** Keystone federation IdP IDs (Keystone domain names), from env. */
export function getIdentityProviders(): string[] {
  const raw = process.env.KEYSTONE_FEDERATION_IDENTITY_PROVIDERS;
  if (!raw) {
    return [];
  }
  return raw.split(',').map((idp) => idp.trim()).filter(Boolean);
}

export function assertIdentityProvidersConfigured(): string[] {
  const idProviders = getIdentityProviders();
  if (idProviders.length === 0) {
    throw new Error('No Identity Providers configured');
  }
  return idProviders;
}
