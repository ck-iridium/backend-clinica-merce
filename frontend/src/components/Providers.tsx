"use client"
import { FeedbackProvider } from "@/app/contexts/FeedbackContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FeedbackProvider>
      {children}
    </FeedbackProvider>
  );
}
