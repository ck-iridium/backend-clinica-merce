import { FeedbackProvider } from "@/app/contexts/FeedbackContext";
import { LanguageProvider } from "@/app/contexts/LanguageContext";
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
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
    </LanguageProvider>
  );
}
