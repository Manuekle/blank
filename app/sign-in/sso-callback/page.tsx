import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

/**
 * GitHub always returns here. Clerk finishes the sign-in, or creates the
 * account for someone new, and only then opens the editor, so the session
 * is active before the editor loads.
 */
export default function SSOCallbackPage() {
  return (
    <main id="main" className="lb-auth-main">
      <p className="lb-auth-status" role="status">
        Signing you in…
      </p>

      <AuthenticateWithRedirectCallback
        signInUrl="/sign-in"
        signUpUrl="/sign-in"
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
      />
    </main>
  );
}
