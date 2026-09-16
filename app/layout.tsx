import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { sfProDisplay, sfProRounded, sfProText } from "./fonts";
import "./globals.css";
import "./editor-theme.css";

export const metadata: Metadata = {
  title: "Blank — Component Editor",
  description:
    "Start with a primitive. Design it visually or write the code yourself.",
};

export const viewport: Viewport = {
  themeColor: "#0e0e0e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: browser extensions (e.g. ColorZilla
    // `cz-shortcut-listen`) mutate <html>/<body> attributes before
    // React hydrates. Ignoring those attrs avoids the mismatch error.
    (<html
      lang="en"
      suppressHydrationWarning
      className={`${sfProDisplay.variable} ${sfProText.variable} ${sfProRounded.variable}`}
    >
      <body suppressHydrationWarning>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>)
  );
}