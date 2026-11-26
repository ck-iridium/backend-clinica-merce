"use client";
import React, { useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import CmsHub from './components/CmsHub';
import HomeEditorView from './components/HomeEditorView';
import NavigationEditorView from './components/NavigationEditorView';
import { useCmsHome } from './hooks/useCmsHome';

export default function CMSPage() {
  const [activeMode, setActiveMode] = useState<'HUB' | 'HOME_EDITOR' | 'NAVIGATION_EDITOR'>('HUB');
  const cmsHome = useCmsHome();

  if (cmsHome.loading) {
    return (
      <div className="p-8">
        <Skeleton className="h-20 w-full mb-8 rounded-3xl" />
        <Skeleton className="h-[600px] w-full rounded-3xl" />
      </div>
    );
  }

  if (activeMode === 'HUB') {
    return <CmsHub onSelectMode={setActiveMode} />;
  }

  if (activeMode === 'HOME_EDITOR') {
    return (
      <HomeEditorView 
        cmsHome={cmsHome} 
        onBack={() => setActiveMode('HUB')} 
      />
    );
  }

  if (activeMode === 'NAVIGATION_EDITOR') {
    return (
      <NavigationEditorView
        onBack={() => setActiveMode('HUB')}
        categories={cmsHome.categories}
        services={cmsHome.services}
        settings={cmsHome.settings}
        siteContent={cmsHome.formData}
        onSiteContentUpdated={cmsHome.setFormData}
      />
    );
  }

  return null;
}
