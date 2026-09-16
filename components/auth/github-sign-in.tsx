"use client";

import { useState } from "react";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { GitHubIcon } from "@/components/icons/github";
import { Button } from "@/components/ui/button";

const FALLBACK_ERROR = "GitHub sign-in could not start. Try again.";

export function GitHubSignIn() {
  const { isLoaded } = useAuth();
  const { signIn } = useSignIn();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    setPending(true);
    setError("");
    try {
      // Both outcomes go through the callback, which activates the session
      // before it opens the editor.
      const result = await signIn.sso({
        strategy: "oauth_github",
        redirectUrl: "/sign-in/sso-callback",
        redirectCallbackUrl: "/sign-in/sso-callback",
      });
      // Success leaves the page for GitHub, so only failures get here.
      if (result.error) {
        // The detail is for developers, e.g. GitHub not enabled in Clerk.
        console.error(result.error);
        // The response error type carries the API errors; the types expose only
        // the base ClerkError, so the shape is narrowed defensively here.
        const firstError = (
          result.error as { errors?: Array<{ meta?: { paramName?: string } }> }
        )?.errors?.[0];
        setError(
          firstError?.meta?.paramName === "strategy"
            ? "GitHub isn't connected yet. Enable the GitHub connection in your Clerk Dashboard, then try again."
            : (result.error.longMessage ?? FALLBACK_ERROR),
        );
        setPending(false);
      }
    } catch (caught) {
      console.error(caught);
      setError(FALLBACK_ERROR);
      setPending(false);
    }
  }

  return (
    <div className="lb-auth-actions">
      <Button
        variant="primary"
        size="lg"
        fullWidth
        leftIcon={<GitHubIcon size={16} />}
        loading={pending}
        disabled={!isLoaded}
        onClick={start}
      >
        Continue with GitHub
      </Button>

      {error && (
        <p className="lb-auth-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
