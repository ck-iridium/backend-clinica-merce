"use client";
import React, { useMemo } from 'react';
import HomeBuilderLayout from '@/components/cms/HomeBuilderLayout';
import HomeBuilderPreview from '@/components/cms/HomeBuilderPreview';
import MediaPickerModal from '@/components/MediaPickerModal';
import AIImageGeneratorModal from '@/components/cms/AIImageGeneratorModal';

import HeroTab from './HeroTab';
import FeaturedTab from './FeaturedTab';
import AboutTab from './AboutTab';
import CategoriesTab from './CategoriesTab';
import CtaTab from './CtaTab';
import OrderSectionsTab from './OrderSectionsTab';
import SeoTab from './SeoTab';

import { useCmsMediaModals } from '../hooks/useCmsMediaModals';

const TABS = ['HERO', 'DESTACADOS', 'SOBRE MÍ', 'CATEGORÍAS', 'CTA', 'ORDENAR', 'SEO'];

interface HomeEditorViewProps {
  cmsHome: any;
  onBack: () => void;
}

export default function HomeEditorView({ cmsHome, onBack }: HomeEditorViewProps) {
  const {
    saving,
    handleSave,
    activeTab,
    setActiveTab,
    viewportDevice,
    setViewportDevice,
    sections,
    setSections,
    selectedCategoryId,
    setSelectedCategoryId,
    formData,
    setFormData,
    categories,
    setCategories,
    services,
    settings,
    handleCategoryChange
  } = cmsHome;

  const {
    pickerTarget,
    setPickerTarget,
    showAIImageModal,
    setShowAIImageModal,
    aiImageTarget,
    setAiImageTarget,
    handleImageSelected,
    handleAIImageGenerated
  } = useCmsMediaModals({
    formData,
    setFormData,
    setCategories,
    handleCategoryChange
  });

  const memoizedPreview = useMemo(() => (
    <HomeBuilderPreview 
      formData={formData}
      categories={categories}
      services={services}
      sections={sections}
      viewportDevice={viewportDevice}
      settings={settings}
    />
  ), [formData, categories, services, sections, viewportDevice, settings]);

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'HERO':
        return (
          <HeroTab 
            formData={formData} 
            setFormData={setFormData} 
            setPickerTarget={setPickerTarget}
            categories={categories}
            services={services}
            activeDevice={viewportDevice}
            setActiveDevice={setViewportDevice}
            onOpenAIModal={() => {
              setAiImageTarget({ type: 'hero_slide' });
              setShowAIImageModal(true);
            }}
          />
        );
      case 'DESTACADOS':
        return (
          <FeaturedTab
            formData={formData}
            setFormData={setFormData}
            services={services}
            categories={categories}
          />
        );
      case 'SOBRE MÍ':
        return (
          <AboutTab 
            formData={formData} 
            setFormData={setFormData} 
            setPickerTarget={setPickerTarget} 
            onOpenAIModal={() => {
              setAiImageTarget({ type: 'about' });
              setShowAIImageModal(true);
            }}
          />
        );
      case 'CATEGORÍAS':
        return (
          <CategoriesTab 
            initialCategories={categories}
            setCategories={setCategories}
            selectedCategoryId={selectedCategoryId}
            setSelectedCategoryId={setSelectedCategoryId}
            setPickerTarget={setPickerTarget}
            handleCategoryChange={handleCategoryChange}
            formData={formData}
            setFormData={setFormData}
            onOpenAICategoryModal={(categoryId: string) => {
              setAiImageTarget({ type: 'category', categoryId });
              setShowAIImageModal(true);
            }}
          />
        );
      case 'CTA':
        return (
          <CtaTab 
            formData={formData} 
            setFormData={setFormData} 
          />
        );
      case 'ORDENAR':
        return (
          <OrderSectionsTab
            sections={sections}
            setSections={setSections}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 'SEO':
        return (
          <SeoTab 
            formData={formData} 
            setFormData={setFormData} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <HomeBuilderLayout 
        isSaving={saving}
        onSave={handleSave}
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        panel={renderActiveTabContent()}
        preview={memoizedPreview}
        onBack={onBack}
        viewportDevice={viewportDevice}
        onViewportDeviceChange={setViewportDevice}
      />
      
      {/* Selector de Medios */}
      {pickerTarget && (
        <MediaPickerModal
          onClose={() => setPickerTarget(null)}
          onImageSelected={handleImageSelected}
          mediaType={pickerTarget.field === 'hero_video_url' ? 'video' : 'image'}
        />
      )}

      {/* Generador de Imágenes IA */}
      {showAIImageModal && (
        <AIImageGeneratorModal
          open={showAIImageModal}
          onClose={() => {
            setShowAIImageModal(false);
            setAiImageTarget(null);
          }}
          onGenerate={handleAIImageGenerated}
          serviceName={
            aiImageTarget?.type === 'hero_slide'
              ? formData.hero_title || 'Portada Clínica'
              : aiImageTarget?.type === 'about'
              ? formData.about_title || 'Sobre la Clínica'
              : categories.find((c: any) => c.id === aiImageTarget?.categoryId)?.name || 'Categoría'
          }
          description={
            aiImageTarget?.type === 'hero_slide'
              ? formData.hero_subtitle || ''
              : aiImageTarget?.type === 'about'
              ? formData.about_text || ''
              : categories.find((c: any) => c.id === aiImageTarget?.categoryId)?.description || ''
          }
        />
      )}
    </div>
  );
}
