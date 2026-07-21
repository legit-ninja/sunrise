"use client";
import React, { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login } from "@/app/(main)/auth/login/action";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SignInButton() {
  const { pending } = useFormStatus();

  return (
    <Button aria-disabled={pending} disabled={pending} type="submit" className="w-full">
      {pending ? "Signing in..." : "Sign in"}
    </Button>
  );
}

export default function Login({
  identityProviders,
}: {
  identityProviders: string[];
}) {
  const [state, action] = useActionState(login, undefined);
  const providerHint = identityProviders.join(", ");
  const fieldError = state?.errors?.idProvider;

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="mx-auto w-full max-w-lg overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
        {/* Brand chrome stays dark so the white logo remains readable in both themes */}
        <div className="bg-zinc-950 px-4 py-4">
          <Image
            src="/img/logo.png"
            alt="Sunrise"
            width={1225}
            height={189}
            priority
            className="h-auto w-full max-w-sm"
          />
        </div>
        <div className="px-6 py-10 sm:px-12">
          <form action={action} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="id_provider" className="sr-only">
                Identity provider ID
              </label>
              {identityProviders.length > 1 ? (
                <select
                  id="id_provider"
                  name="id_provider"
                  required
                  defaultValue={identityProviders[0]}
                  aria-invalid={Boolean(fieldError)}
                  aria-describedby={fieldError ? "id_provider-error" : undefined}
                  className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-11 w-full rounded-md border px-3 text-center text-lg shadow-xs outline-none focus-visible:ring-[3px]"
                >
                  {identityProviders.map((idp) => (
                    <option key={idp} value={idp}>
                      {idp}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id="id_provider"
                  name="id_provider"
                  type="text"
                  required
                  defaultValue={identityProviders[0] ?? ""}
                  aria-invalid={Boolean(fieldError)}
                  aria-describedby={fieldError ? "id_provider-error" : undefined}
                  className="h-11 text-center text-lg"
                  placeholder={
                    providerHint || "Identity provider ID (Keystone domain)"
                  }
                />
              )}
              {fieldError ? (
                <p
                  id="id_provider-error"
                  role="alert"
                  className="rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive"
                >
                  {fieldError}
                </p>
              ) : null}
            </div>
            <SignInButton />
          </form>
        </div>
      </div>
    </div>
  );
}
