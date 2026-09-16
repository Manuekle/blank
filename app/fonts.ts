import localFont from "next/font/local";

/*
 * SF Pro — organized by family under app/fonts/:
 *   sf-pro-display/  headings, brand, large sizes (18 files: 9 weights × normal/italic)
 *   sf-pro-text/     UI text, body, small sizes (18 files: 9 weights × normal/italic)
 *   sf-pro-rounded/  wordmark, friendly accents (9 files: 9 weights, normal only)
 *   sf-pro/          combined TTFs + license note, not loaded by default
 *
 * Only 400/500/600/700 (normal) are loaded to keep the bundle lean.
 * Add more weights/styles here if the inspector needs them.
 */

export const sfProDisplay = localFont({
  src: [
    {
      path: "./fonts/sf-pro-display/SF-Pro-Display-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/sf-pro-display/SF-Pro-Display-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/sf-pro-display/SF-Pro-Display-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/sf-pro-display/SF-Pro-Display-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-display",
  display: "swap",
});

export const sfProText = localFont({
  src: [
    {
      path: "./fonts/sf-pro-text/SF-Pro-Text-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/sf-pro-text/SF-Pro-Text-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/sf-pro-text/SF-Pro-Text-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/sf-pro-text/SF-Pro-Text-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-text",
  display: "swap",
});

export const sfProRounded = localFont({
  src: [
    {
      path: "./fonts/sf-pro-rounded/SF-Pro-Rounded-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/sf-pro-rounded/SF-Pro-Rounded-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/sf-pro-rounded/SF-Pro-Rounded-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/sf-pro-rounded/SF-Pro-Rounded-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-rounded",
  display: "swap",
});
