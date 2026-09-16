import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  // Only the sign-in routes read the session so far. Widen this when
  // another page or API route starts calling auth().
  matcher: ["/sign-in", "/sign-in/(.*)", "/__clerk/:path*"],
};
