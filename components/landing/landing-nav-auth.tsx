"use client";

import Link from "next/link";
import { ClerkProvider, UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

/*
 * Clerk lives here, in the nav, so the landing keeps its bundle until this
 * mounts; pages without it still render unchanged.
 */
function NavAuthItems() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;

  return isSignedIn ? (
    <UserButton
      appearance={{
        elements: {
          rootBox: "lb-nav-user",
          avatarBox: "lb-nav-user-avatar",
        },
      }}
    />
  ) : (
    <Link href="/sign-in">
      <Button size="sm" variant="outline">
        Sign in
      </Button>
    </Link>
  );
}

export function LandingNavAuth() {
  return (
    <ClerkProvider signInUrl="/sign-in">
      <NavAuthItems />
    </ClerkProvider>
  );
}
