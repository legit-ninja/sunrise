import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getIdentityProviders } from '@/lib/identity-providers';
import {
  buildAuthorizeUrl,
  generatePkce,
  generateState,
  isSunriseOidcEnabled,
} from '@/lib/oidc/sunrise';

const idProviders = getIdentityProviders();

export async function GET(request: Request) {
  if (!isSunriseOidcEnabled()) {
    return new NextResponse(
      'Sunrise OIDC login is not configured. Use Keystone WebSSO or set KEYCLOAK_ISSUER, KEYCLOAK_SERVER_CLIENT_ID, and KEYCLOAK_SERVER_CLIENT_SECRET.',
      { status: 503 },
    );
  }
  const url = new URL(request.url);
  const idp = url.searchParams.get('idp');
  if (!idp || !idProviders.includes(idp)) {
    return new NextResponse('Invalid identity provider', { status: 400 });
  }

  const { verifier, challenge } = generatePkce();
  const state = generateState();

  const session = await getSession();
  session.oidcVerifier = verifier;
  session.oidcState = state;
  session.oidcIdProvider = idp;
  await session.save();

  const authorizeUrl = await buildAuthorizeUrl({ challenge, state });
  return NextResponse.redirect(authorizeUrl);
}
