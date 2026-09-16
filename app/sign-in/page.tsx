import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { GitHubSignIn } from "@/components/auth/github-sign-in";

export default async function SignInPage() {
  const { userId } = await auth();
  if (userId) redirect("/");

  return (
    <main id="main" className="lb-auth-main">
      <section className="lb-auth-card" aria-labelledby="lb-auth-title">
        <h1 id="lb-auth-title" className="lb-h lb-auth-title">
          Sign in to Blank
        </h1>
        <p className="lb-sub lb-auth-sub">
          Use your GitHub account. New here? The same button creates your account.
        </p>

        <GitHubSignIn />

        {/* Placeholder Clerk's Smart CAPTCHA mounts onto when bot protection challenges the flow. */}
        <div id="clerk-captcha" data-cl-theme="dark" data-cl-size="flexible" />

        <p className="lb-auth-note">Blank only asks GitHub for your profile and email address.</p>
      </section>
    </main>
  );
}
