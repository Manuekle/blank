import { ClerkProvider } from "@clerk/nextjs";
import { Editor } from "@/components/editor/editor";

export default function Home() {
  return (
    // Settings reads the signed-in account; the landing still loads without Clerk.
    <ClerkProvider signInUrl="/sign-in">
      <Editor />
    </ClerkProvider>
  );
}
