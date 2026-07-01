import Login from "@/components/Auth/Login";
import { getKeystoneSessionState } from "@/lib/keystone/session";
import { getIdentityProviders } from "@/lib/identity-providers";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

function SessionUnavailable({ reason }: { reason: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-md border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="text-xl font-semibold">Session unavailable</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sunrise could not validate the Keystone session. Sign in again to
          continue.
        </p>
        <p className="mt-3 break-words text-xs text-muted-foreground">
          {reason}
        </p>
        <a
          className="mt-5 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          href="/auth/logout"
        >
          Sign in again
        </a>
      </div>
    </main>
  );
}

export default async function Provider({ children }: any) {
  const session = await getSession();
  const identityProviders = getIdentityProviders();
  if (!session.keystone_unscoped_token) {
    return <Login identityProviders={identityProviders} />;
  }

  const sessionState = await getKeystoneSessionState(session);
  if (sessionState.status === "missing") {
    return <Login identityProviders={identityProviders} />;
  }

  if (sessionState.status === "invalid") {
    redirect("/auth/logout?reason=expired");
  }

  if (sessionState.status === "unknown") {
    return <SessionUnavailable reason={sessionState.reason} />;
  }

  return <>{children}</>;
}
