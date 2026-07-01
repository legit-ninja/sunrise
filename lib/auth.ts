import { z } from "zod";
import { redirect } from "next/navigation";
import { assertIdentityProvidersConfigured } from "@/lib/identity-providers";
import { buildKeystoneWebssoLoginUrl } from "@/lib/keystone/login";
import { isSunriseOidcEnabled } from "@/lib/oidc/sunrise";

const idProviders = assertIdentityProvidersConfigured();

export const LoginFormSchema = z.object({
  idProvider: z.string().trim().refine((value) => idProviders.includes(value), {
    message: `Invalid Identity Provider. Allowed: ${idProviders.join(", ")}`,
  }),
});

export type LoginFormState =
  | {
      errors?: {
        idProvider?: string[];
      };
      message?: string;
    }
  | undefined;

export const redirectToIdentityProvider = (idProvider: string) => {
  if (isSunriseOidcEnabled()) {
    redirect(
      (process.env.DASHBOARD_URL ?? '') +
        '/auth/oidc/login?idp=' +
        encodeURIComponent(idProvider),
    );
  }

  redirect(buildKeystoneWebssoLoginUrl(idProvider));
};
