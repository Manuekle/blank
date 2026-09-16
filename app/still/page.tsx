import type { Metadata } from "next";
import { EditorStill } from "@/components/landing/editor-still";

/* Only ever shown inside the landing hero's laptop frame. */
export const metadata: Metadata = {
  title: "Blank — Editor still",
  robots: { index: false, follow: false },
};

export default function EditorStillPage() {
  return <EditorStill />;
}
