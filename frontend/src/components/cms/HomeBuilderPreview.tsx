"use client";
import React, { useMemo } from 'react';
import { getFontVar } from '@/lib/fonts';
import {
  PreviewHeroSection,
  PreviewFeaturedSection,
  PreviewCategoriesCatalogSection,
  PreviewAboutSection,
  PreviewCategorySection,
  PreviewCtaSection
} from './preview';

interface PreviewProps {
  formData: any;
  categories: any[];
  services: any[];
  sections?: any[];
  viewportDevice?: 'desktop' | 'tablet' | 'mobile';
  settings?: any;
}

// Orquestador maestro de la vista previa en vivo del CMS
const HomeBuilderPreview = React.memo(function HomeBuilderPreview({
  formData,
  categories = [],
  services = [],
  sections = [],
  viewportDevice = 'desktop',
  settings
}: PreviewProps) {
  const previewHeadingFont = settings?.branding_font_headings || 'Playfair';
  const previewBodyFont = settings?.branding_font_body || 'Inter';
  const headingFontVal = getFontVar(previewHeadingFont, "var(--font-playfair-base), 'Playfair', serif");
  const bodyFontVal = getFontVar(previewBodyFont, 'var(--font-inter-base), sans-serif');

  // Secciones estáticas base de la portada
  const baseSections = useMemo(() => [
    { id: 'hero', type: 'hero' },
    { id: 'featured', type: 'featured' },
    { id: 'categories_catalog', type: 'categories_catalog' },
    { id: 'about', type: 'about' },
    { id: 'cta', type: 'cta' },
  ], []);

  const hideIndividualSections = Boolean(formData?.categories_catalog_config?.hide_individual_sections);

  const activeCategories = useMemo(() => {
    return categories
      .filter((c: any) => c.is_active !== false)
      .sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0));
  }, [categories]);

  // Secciones dinámicas por cada categoría activa
  const catSections = useMemo(() => {
    return hideIndividualSections
      ? []
      : (activeCategories.length > 0 ? activeCategories : categories).map((c: any) => ({
          id: c.id,
          type: 'category',
          data: c
        }));
  }, [hideIndividualSections, activeCategories, categories]);

  // Ordenamiento dinámico reactivo sincronizado con formData o el estado del gestor de secciones
  const dynamicOrderedSections = useMemo(() => {
    const allAvailable = [...baseSections, ...catSections];
    let ordered: any[] = [];

    if (Array.isArray(sections) && sections.length > 0) {
      sections.forEach((sec: any) => {
        const found = allAvailable.find(s => s.id === sec.id);
        if (found) ordered.push(found);
      });
      allAvailable.forEach(s => {
        if (!ordered.find(o => o.id === s.id)) ordered.push(s);
      });
    } else if (formData?.home_sections_order) {
      try {
        const savedOrder = JSON.parse(formData.home_sections_order);
        savedOrder.forEach((id: string) => {
          const found = allAvailable.find(s => s.id === id);
          if (found) ordered.push(found);
        });
        allAvailable.forEach(s => {
          if (!ordered.find(o => o.id === s.id)) ordered.push(s);
        });
      } catch {
        ordered = [...baseSections.slice(0, 3), ...catSections, baseSections[3], baseSections[4]];
      }
    } else {
      ordered = [...baseSections.slice(0, 3), ...catSections, baseSections[3], baseSections[4]];
    }

    const hero = ordered.find(s => s.type === 'hero') || baseSections[0];
    const middle = ordered.filter(s => s.type !== 'hero' && s.type !== 'seo');
    return [hero, ...middle];
  }, [sections, formData?.home_sections_order, baseSections, catSections]);

  return (
    <div 
      className="w-full h-full flex flex-col overflow-y-auto bg-stone-50 select-none custom-scrollbar"
      style={{
        ['--font-heading' as any]: headingFontVal,
        ['--font-playfair' as any]: headingFontVal,
        ['--font-cormorant' as any]: headingFontVal,
        ['--font-inter' as any]: bodyFontVal,
      }}
    >
      {dynamicOrderedSections.map((section: any, index: number) => {
        if (section.type === 'hero') {
          return (
            <PreviewHeroSection
              key="hero"
              formData={formData}
              viewportDevice={viewportDevice}
              settings={settings}
            />
          );
        }

        if (section.type === 'featured') {
          return (
            <PreviewFeaturedSection
              key="featured"
              config={formData?.featured_services_config}
              services={services}
              viewportDevice={viewportDevice}
              translations={formData?.translations}
            />
          );
        }

        if (section.type === 'categories_catalog') {
          return (
            <PreviewCategoriesCatalogSection
              key="categories_catalog"
              config={formData?.categories_catalog_config}
              categories={activeCategories.length > 0 ? activeCategories : categories}
              services={services}
              viewportDevice={viewportDevice}
              translations={formData?.translations}
            />
          );
        }

        if (section.type === 'about') {
          return (
            <PreviewAboutSection
              key="about"
              formData={formData}
              viewportDevice={viewportDevice}
            />
          );
        }

        if (section.type === 'category') {
          return (
            <PreviewCategorySection
              key={`cat-${section.id}`}
              category={section.data}
              index={index}
              services={services}
            />
          );
        }

        if (section.type === 'cta') {
          return (
            <PreviewCtaSection
              key="cta"
              formData={formData}
            />
          );
        }

        return null;
      })}

      {/* Indicador de final de página */}
      <div className="h-32 bg-stone-900 w-full shrink-0 flex items-center justify-center">
        <div className="w-1/3 h-2 bg-stone-800 rounded-full"></div>
      </div>
    </div>
  );
});

HomeBuilderPreview.displayName = 'HomeBuilderPreview';
export default HomeBuilderPreview;
