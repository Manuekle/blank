import type { Metadata } from "next";
import Link from "next/link";
import { ClerkProvider } from "@clerk/nextjs";
import { Logo } from "@/components/icons/logo";
import "../landing/landing.css";
import "./sign-in.css";

export const metadata: Metadata = {
  title: "Sign in — Blank",
};

/* Clerk loads here rather than in the root layout, so the landing and the editor stay free of its script until they need a session. */
export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider signInUrl="/sign-in">
      <div className="lb-page lb-auth">
        <header className="lb-auth-top">
          <Link href="/landing" className="lb-nav-word" aria-label="Blank home">
            <Logo size={18} />
            blank
          </Link>
        </header>

        {children}
      </div>
    </ClerkProvider>
  );
}
