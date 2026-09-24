"use client";

import React from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Globe, 
  ExternalLink 
} from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Location } from './types';

interface LocationCardProps {
  location: Location;
  publicUrl: string;
  onToggleStatus: (location: Location) => void;
  onEdit: (location: Location) => void;
  onDelete: (location: Location) => void;
}

export default function LocationCard({
  location,
  publicUrl,
  onToggleStatus,
  onEdit,
  onDelete,
}: LocationCardProps) {
  const { t } = useLanguage();

  return (
    <div
      className={`bg-white border transition-all duration-300 rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg relative overflow-hidden ${
        location.is_active ? 'border-stone-200/60 shadow-sm' : 'border-stone-100 opacity-60'
      }`}
    >
      {/* Detalle sutil de lujo en la cabecera de la tarjeta activa */}
      {location.is_active && (
        <div className="absolute top-0 right-0 w-24 h-1 bg-gradient-to-r from-stone-900 via-[#d4af37] to-stone-900" />
      )}

      <div className="space-y-4">
        {/* Nombre y Badge de Estado */}
        <div className="space-y-1">
          <h3 className="font-serif text-2xl font-light text-stone-800 tracking-tight leading-tight">
            {location.name}
          </h3>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              location.is_active
                ? 'bg-[#d4af37]/10 text-[#bf9b30] border border-[#d4af37]/15'
                : 'bg-stone-100 text-stone-400 border border-stone-200/40'
            }`}
          >
            {location.is_active
              ? t('dashboard.locations.active_badge')
              : t('dashboard.locations.inactive_badge')}
          </span>
        </div>

        {/* Datos de contacto y dirección física */}
        <div className="space-y-2.5 pt-2 text-stone-500 font-medium text-sm">
          <div className="flex items-start gap-2.5">
            <MapPin size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
            <span>{location.address}</span>
          </div>

          {location.phone && (
            <div className="flex items-center gap-2.5">
              <Phone size={16} className="text-[#d4af37] shrink-0" />
              <span>{location.phone}</span>
            </div>
          )}

          {location.email && (
            <div className="flex items-center gap-2.5">
              <Mail size={16} className="text-[#d4af37] shrink-0" />
              <span className="truncate max-w-[200px]">{location.email}</span>
            </div>
          )}

          {/* Ficha pública SEO optimizada */}
          {location.slug && (
            <div className="pt-1">
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#b08e23] hover:text-stone-900 font-semibold bg-[#d4af37]/10 hover:bg-[#d4af37]/20 px-3 py-1.5 rounded-lg transition-colors"
                title={t('dashboard.locations.public_seo_tooltip') || "Ver ficha web pública optimizada para Google"}
              >
                <Globe size={13} />
                <span>{t('dashboard.locations.public_seo_page') || "Ver página SEO pública"}</span>
                <ExternalLink size={12} className="opacity-70" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Barra de Acciones Inferior */}
      <div className="flex items-center justify-between border-t border-stone-100 mt-6 pt-4 gap-2">
        <button
          id={`locations-toggle-status-btn-${location.id}`}
          onClick={() => onToggleStatus(location)}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all duration-300 flex items-center gap-1.5 ${
            location.is_active
              ? 'border-stone-200 text-stone-500 hover:bg-stone-50'
              : 'border-[#d4af37]/30 text-[#bf9b30] hover:bg-[#d4af37]/5'
          }`}
        >
          {location.is_active ? (
            <>
              <X size={12} />
              {t('dashboard.locations.deactivate_btn')}
            </>
          ) : (
            <>
              <Check size={12} />
              {t('dashboard.locations.activate_btn')}
            </>
          )}
        </button>

        <div className="flex items-center gap-1.5">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-stone-400 hover:text-[#d4af37] hover:bg-stone-50 rounded-xl transition-all"
            title={t('dashboard.locations.open_public_page') || "Abrir página pública"}
          >
            <ExternalLink size={16} />
          </a>
          <button
            id={`locations-edit-btn-${location.id}`}
            onClick={() => onEdit(location)}
            className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-50 rounded-xl transition-all"
            title={t('dashboard.locations.edit_btn')}
          >
            <Edit2 size={16} />
          </button>
          <button
            id={`locations-delete-btn-${location.id}`}
            onClick={() => onDelete(location)}
            className="p-2 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
            title={t('dashboard.locations.delete_btn')}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
