"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { requestPasswordReset, resetPasswordAction, type AuthState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(requestPasswordReset, {});
  return (
    <form action={formAction} className="space-y-5">
      <div>
        <Label htmlFor="email">Email address</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      {state.error && (
        <p role="alert" className="rounded-md bg-destructive/8 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <div className="space-y-2 rounded-md bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          <p>{state.success}</p>
          {state.resetUrl && (
            <p className="break-all text-xs">
              Development link:{" "}
              <Link className="underline" href={state.resetUrl}>
                {state.resetUrl}
              </Link>
            </p>
          )}
        </div>
      )}
      <Submit label="Send reset link" pendingLabel="Sending…" />
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/admin/login" className="font-medium text-primary hover:underline">
          Return to sign in
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState<AuthState, FormData>(resetPasswordAction, {});
  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      <div>
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={12}
          autoComplete="new-password"
          required
        />
        <p className="mt-1.5 text-xs text-muted-foreground">At least 12 characters.</p>
      </div>
      <div>
        <Label htmlFor="confirm">Confirm password</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          minLength={12}
          autoComplete="new-password"
          required
        />
      </div>
      {state.error && (
        <p role="alert" className="rounded-md bg-destructive/8 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <div className="rounded-md bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          {state.success}{" "}
          <Link href="/admin/login" className="underline">
            Sign in
          </Link>
        </div>
      )}
      <Submit label="Update password" pendingLabel="Updating…" />
    </form>
  );
}
