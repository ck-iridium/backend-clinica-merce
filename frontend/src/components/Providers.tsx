import { FeedbackProvider } from "@/app/contexts/FeedbackContext";
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FeedbackProvider>
      <Toaster 
        position="top-right" 
        richColors 
        expand={false}
        toastOptions={{
          style: {
            borderRadius: '1.5rem',
            padding: '1rem',
          },
        }}
      />
      {children}
    </FeedbackProvider>
  );
}
