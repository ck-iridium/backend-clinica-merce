"use client";
import { useState } from 'react';

export interface PickerTarget {
  type: 'form' | 'category' | 'hero_slide';
  id?: string;
  field: string;
  slideIndex?: number;
}

export interface AIImageTarget {
  type: 'hero_slide' | 'about' | 'category';
  categoryId?: string;
}

interface UseCmsMediaModalsProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  setCategories: React.Dispatch<React.SetStateAction<any[]>>;
  handleCategoryChange: (id: string, field: string, value: any) => void;
}

export function useCmsMediaModals({
  formData,
  setFormData,
  setCategories,
  handleCategoryChange
}: UseCmsMediaModalsProps) {
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);
  const [showAIImageModal, setShowAIImageModal] = useState(false);
  const [aiImageTarget, setAiImageTarget] = useState<AIImageTarget | null>(null);

  const handleImageSelected = (url: string) => {
    if (!pickerTarget) return;

    if (pickerTarget.type === 'hero_slide') {
      const slideIndex = pickerTarget.slideIndex ?? 0;
      setFormData((prev: any) => {
        const currentSlides = (Array.isArray(prev.hero_slides) && prev.hero_slides.length > 0)
          ? [...prev.hero_slides]
          : [{ ...prev, id: 'slide-1' }];

        const safeIdx = Math.min(Math.max(0, slideIndex), currentSlides.length - 1);
        currentSlides[safeIdx] = {
          ...currentSlides[safeIdx],
          [pickerTarget.field]: url
        };

        const next = {
          ...prev,
          hero_slides: currentSlides
        };

        if (safeIdx === 0) {
          next[pickerTarget.field] = url;
        }

        return next;
      });
    } else if (pickerTarget.type === 'form') {
      setFormData((prev: any) => {
        const next = { ...prev, [pickerTarget.field]: url };

        // Si es un campo multimedia del Hero, sincronizar también con la diapositiva activa
        if (pickerTarget.field === 'hero_image_url' || pickerTarget.field === 'hero_video_url') {
          const currentSlides = (Array.isArray(prev.hero_slides) && prev.hero_slides.length > 0)
            ? [...prev.hero_slides]
            : [{ ...prev, id: 'slide-1' }];

          const activeIdx = Math.min(
            Math.max(0, prev._activeSlideIndex ?? 0),
            currentSlides.length - 1
          );

          currentSlides[activeIdx] = {
            ...currentSlides[activeIdx],
            [pickerTarget.field]: url
          };

          next.hero_slides = currentSlides;

          if (activeIdx === 0) {
            next[pickerTarget.field] = url;
          }
        }

        return next;
      });
    } else if (pickerTarget.type === 'category' && pickerTarget.id) {
      setCategories(prev => prev.map(cat => 
        cat.id === pickerTarget.id ? { ...cat, [pickerTarget.field]: url } : cat
      ));
    }
    setPickerTarget(null);
  };

  const handleAIImageGenerated = (url: string) => {
    if (!aiImageTarget) return;
    if (aiImageTarget.type === 'hero_slide') {
      setFormData((prev: any) => {
        const currentSlides = (Array.isArray(prev.hero_slides) && prev.hero_slides.length > 0)
          ? [...prev.hero_slides]
          : [{ ...prev, id: 'slide-1' }];
        const activeIdx = Math.min(Math.max(0, prev._activeSlideIndex ?? 0), currentSlides.length - 1);
        currentSlides[activeIdx] = {
          ...currentSlides[activeIdx],
          hero_image_url: url
        };
        const next = { ...prev, hero_slides: currentSlides };
        if (activeIdx === 0) {
          next.hero_image_url = url;
        }
        return next;
      });
    } else if (aiImageTarget.type === 'about') {
      setFormData((prev: any) => ({ ...prev, about_image_url: url }));
    } else if (aiImageTarget.type === 'category' && aiImageTarget.categoryId) {
      handleCategoryChange(aiImageTarget.categoryId, 'image_url', url);
    }
    setShowAIImageModal(false);
    setAiImageTarget(null);
  };

  return {
    pickerTarget,
    setPickerTarget,
    showAIImageModal,
    setShowAIImageModal,
    aiImageTarget,
    setAiImageTarget,
    handleImageSelected,
    handleAIImageGenerated
  };
}
