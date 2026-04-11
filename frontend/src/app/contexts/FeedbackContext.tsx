"use client"
import React, { createContext, useContext, useState, ReactNode } from 'react';
import FeedbackModal, { FeedbackConfig } from '@/components/FeedbackModal';

interface FeedbackContextProps {
  showFeedback: (config: FeedbackConfig) => void;
  hideFeedback: () => void;
}

const FeedbackContext = createContext<FeedbackContextProps | undefined>(undefined);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<FeedbackConfig | null>(null);

  const showFeedback = (newConfig: FeedbackConfig) => {
    setConfig(newConfig);
  };

  const hideFeedback = () => {
    setConfig(null);
  };

  return (
    <FeedbackContext.Provider value={{ showFeedback, hideFeedback }}>
      {children}
      {config && (
        <FeedbackModal 
          {...config} 
          onClose={() => {
            hideFeedback();
            if (config.type !== 'confirm' && config.onConfirm) {
               config.onConfirm();
            }
          }} 
          onConfirmHandler={() => {
            hideFeedback();
            if (config.onConfirm) {
               config.onConfirm();
            }
          }}
        />
      )}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}
