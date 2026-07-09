"use client";

import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";

interface SectorMetadataDisplayProps {
  sector: string;
  value: any;
}

export function SectorMetadataDisplay({
  sector,
  value = {}
}: SectorMetadataDisplayProps) {
  const { t } = useLanguage();

  const renderAllergyPills = (allergiesStr: string, emptyFallback: string) => {
    const list = allergiesStr
      ? allergiesStr.split(',').map(t => t.trim()).filter(t => t.length > 0)
      : [];

    if (list.length === 0) {
      return (
        <p className="p-2.5 bg-green-50/20 border border-green-100 rounded-xl text-green-700 font-semibold flex items-center gap-1.5 animate-in fade-in">
          <span className="text-xs">✓</span> {emptyFallback}
        </p>
      );
    }

    return (
      <div className="flex flex-wrap gap-2 animate-in fade-in py-1">
        {list.map((item, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-250/70 rounded-full text-xs font-semibold shadow-sm"
          >
            <span className="text-xs">⚠️</span>
            <span>{item}</span>
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 text-xs font-medium text-stone-600">
      {sector === 'clinical' && (
        <>
          <div className="space-y-1">
            <span className="block text-[9px] uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.clinical.allergies') || 'Alergias'}
            </span>
            {renderAllergyPills(value.allergies || '', t('dashboard.clients.clinical.no_allergies') || 'Sin allergies conocidas')}
          </div>
          <div className="space-y-1">
            <span className="block text-[9px] uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.clinical.medications') || 'Medicación'}
            </span>
            <p className="p-2 bg-stone-50 border border-stone-100 rounded-lg text-stone-700">
              {value.medications || t('dashboard.clients.clinical.no_medications') || 'No toma medicación'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="block text-[9px] uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.clinical.injury_history') || 'Historial de Lesiones'}
            </span>
            <p className="p-2 bg-stone-50 border border-stone-100 rounded-lg text-stone-700">
              {value.injury_history || t('dashboard.clients.clinical.no_injories') || 'Sin historial registrado'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="block text-[9px] uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.clinical.notes') || 'Notas Clínicas'}
            </span>
            <p className="p-3 bg-stone-50 border border-stone-100 rounded-lg text-stone-700 leading-relaxed whitespace-pre-wrap">
              {value.clinical_notes || t('dashboard.clients.clinical.no_notes') || 'Sin anotaciones clínicas'}
            </p>
          </div>
        </>
      )}

      {sector === 'beauty' && (
        <>
          <div className="space-y-1">
            <span className="block text-[9px] uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.beauty.skin_type') || 'Tipo de Piel'}
            </span>
            <p className="p-2.5 bg-stone-50 border border-stone-100 rounded-lg text-stone-700 font-semibold">
              {value.skin_type || t('dashboard.clients.not_specified') || 'No especificado'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="block text-[9px] uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.beauty.sensitivities') || 'Sensibilidad a Cosméticos'}
            </span>
            {renderAllergyPills(value.cosmetic_sensitivities || '', t('dashboard.clients.beauty.no_sensitivities') || 'Sin sensibilidades registradas')}
          </div>
          <div className="space-y-1">
            <span className="block text-[9px] uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.beauty.aesthetic_notes') || 'Observaciones Estéticas / Tratamientos de Interés'}
            </span>
            <p className="p-3 bg-stone-50 border border-stone-100 rounded-lg text-stone-700 leading-relaxed whitespace-pre-wrap">
              {value.aesthetic_notes || t('dashboard.clients.beauty.no_aesthetic_notes') || 'Sin observaciones registradas'}
            </p>
          </div>
        </>
      )}

      {sector === 'barber' && (
        <>
          <div className="space-y-1">
            <span className="block text-[9px] uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.barber.hair_type') || 'Tipo de Cabello / Cuero Cabelludo'}
            </span>
            <p className="p-2.5 bg-stone-50 border border-stone-100 rounded-lg text-stone-700 font-semibold">
              {value.hair_type || t('dashboard.clients.not_specified') || 'No especificado'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="block text-[9px] uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.barber.chemical_sensitivities') || 'Sensibilidad a Tintes / Químicos'}
            </span>
            {renderAllergyPills(value.chemical_sensitivities || '', t('dashboard.clients.barber.no_sensitivities') || 'Sin sensibilidades registradas')}
          </div>
          <div className="space-y-1">
            <span className="block text-[9px] uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.barber.color_formulas') || 'Fórmulas de Tinte / Mezclas'}
            </span>
            <p className="p-3 bg-stone-50 border border-stone-100 rounded-lg text-stone-700 leading-relaxed whitespace-pre-wrap">
              {value.color_formulas || t('dashboard.clients.barber.no_formulas') || 'Sin fórmulas registradas'}
            </p>
          </div>
        </>
      )}

      {sector === 'veterinary' && (
        <>
          <div className="p-3 bg-stone-50 border border-stone-150 rounded-xl space-y-2">
            <div className="flex justify-between border-b border-stone-200 pb-1.5">
              <span className="text-[9px] text-stone-400 uppercase">
                {t('dashboard.clients.vet.pet_name') || 'Nombre Mascota'}
              </span>
              <strong className="text-stone-800 font-mono">{value.pet_name || t('dashboard.clients.vet.not_assigned') || 'No asignada'}</strong>
            </div>
            <div className="flex justify-between border-b border-stone-200 pb-1.5">
              <span className="text-[9px] text-stone-400 uppercase">
                {t('dashboard.clients.vet.species_breed') || 'Especie / Raza'}
              </span>
              <span className="text-stone-700">{value.pet_species || '-'} {value.pet_breed ? `(${value.pet_breed})` : ''}</span>
            </div>
            <div className="flex justify-between border-b border-stone-200 pb-1.5">
              <span className="text-[9px] text-stone-400 uppercase">
                {t('dashboard.clients.vet.age') || 'Edad'}
              </span>
              <span className="text-stone-700">{value.pet_age || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-stone-200 pb-1.5">
              <span className="text-[9px] text-stone-400 uppercase">
                {t('dashboard.clients.vet.temperament') || 'Temperamento'}
              </span>
              <span className="text-stone-700">{value.temperament || '-'}</span>
            </div>
            <div className="space-y-1 pt-1">
              <span className="block text-[9px] text-stone-400 uppercase">
                {t('dashboard.clients.vet.vaccinations') || 'Vacunación'}
              </span>
              <p className="p-2 bg-white border border-stone-200 rounded text-stone-750">
                {value.vaccination_record || t('dashboard.clients.vet.no_record') || 'Sin registro'}
              </p>
            </div>
          </div>
        </>
      )}

      {sector === 'automotive' && (
        <>
          <div className="p-3.5 bg-stone-900 text-white rounded-xl space-y-2.5 font-mono shadow-sm">
            <div className="flex justify-between border-b border-stone-850 pb-1.5">
              <span className="text-[8px] text-stone-500 uppercase">
                {t('dashboard.clients.auto.license_plate') || 'Matrícula'}
              </span>
              <strong className="text-[#D4AF37] font-bold text-sm">{value.license_plate || t('dashboard.clients.auto.no_license') || 'SIN MATRÍCULA'}</strong>
            </div>
            <div className="flex justify-between border-b border-stone-850 pb-1.5">
              <span className="text-[8px] text-stone-500 uppercase">
                {t('dashboard.clients.auto.vehicle') || 'Vehículo'}
              </span>
              <span className="text-stone-300">{value.brand || '-'} {value.model || ''}</span>
            </div>
            <div className="flex justify-between border-b border-stone-850 pb-1.5">
              <span className="text-[8px] text-stone-500 uppercase">
                {t('dashboard.clients.auto.year') || 'Año'}
              </span>
              <span className="text-stone-300">{value.year || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-stone-850 pb-1.5">
              <span className="text-[8px] text-stone-500 uppercase">
                {t('dashboard.clients.auto.mileage') || 'Kilómetros'}
              </span>
              <span className="text-stone-300">{value.mileage ? `${value.mileage.toLocaleString()} km` : '-'}</span>
            </div>
            <div className="flex justify-between pb-0.5">
              <span className="text-[8px] text-stone-500 uppercase">
                {t('dashboard.clients.auto.vin') || 'VIN (Bastidor)'}
              </span>
              <span className="text-stone-400 text-[10px]">{value.vin || '-'}</span>
            </div>
          </div>
        </>
      )}

      {sector === 'home_services' && (
        <>
          <div className="p-3 bg-stone-50 border border-stone-150 rounded-xl space-y-2">
            <div className="flex justify-between border-b border-stone-250 pb-1.5">
              <span className="text-[9px] text-stone-400 uppercase">
                {t('dashboard.clients.home.property_type') || 'Tipo Vivienda'}
              </span>
              <strong className="text-stone-800">{value.property_type || t('dashboard.clients.home.not_indicated') || 'No indicado'}</strong>
            </div>
            <div className="flex justify-between border-b border-stone-250 pb-1.5">
              <span className="text-[9px] text-stone-400 uppercase">
                {t('dashboard.clients.home.size') || 'Tamaño'}
              </span>
              <span className="text-stone-750">{value.sq_meters ? `${value.sq_meters} m²` : '-'}</span>
            </div>
            <div className="space-y-1 border-b border-stone-250 pb-1.5">
              <span className="block text-[9px] text-stone-400 uppercase mb-0.5">
                {t('dashboard.clients.home.access_codes') || 'Claves / Códigos de Acceso'}
              </span>
              <p className="p-1.5 bg-white border border-stone-200 rounded text-stone-750 font-mono text-[10px] truncate">
                {value.access_codes || t('dashboard.clients.home.none') || 'Ninguno'}
              </p>
            </div>
            <div className="flex justify-between items-center pt-0.5">
              <span className="text-[9px] text-stone-400 uppercase">
                {t('dashboard.clients.home.dangerous_pets') || 'Mascotas Peligrosas'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${value.dangerous_pets ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-600'}`}>
                {value.dangerous_pets ? (t('dashboard.clients.yes') || 'SÍ') : (t('dashboard.clients.no') || 'NO')}
              </span>
            </div>
          </div>
        </>
      )}

      {sector === 'professional' && (
        <>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-stone-50 border border-stone-150 rounded-xl space-y-1.5">
              <span className="block text-[8px] uppercase tracking-wider text-stone-400">
                {t('dashboard.clients.prof.company_sector') || 'Sector Empresa'}
              </span>
              <strong className="text-stone-750 block">{value.company_sector || t('dashboard.clients.not_specified') || 'No especificado'}</strong>
            </div>
            
            {value.website_url && (
              <a id="prof-website-link" href={value.website_url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 bg-white border border-stone-200 hover:border-stone-400 rounded-lg transition-colors group">
                <span className="text-[10px] font-bold text-stone-500">
                  {t('dashboard.clients.prof.website') || 'Página Web'}
                </span>
                <ChevronRight size={14} className="text-stone-400 group-hover:translate-x-0.5 transition-transform" />
              </a>
            )}
            {value.cloud_folder_url && (
              <a id="prof-cloud-folder-link" href={value.cloud_folder_url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 bg-white border border-stone-200 hover:border-stone-400 rounded-lg transition-colors group">
                <span className="text-[10px] font-bold text-[#D4AF37]">
                  {t('dashboard.clients.prof.cloud_folder') || 'Carpeta Drive/Dropbox'}
                </span>
                <ChevronRight size={14} className="text-stone-400 group-hover:translate-x-0.5 transition-transform" />
              </a>
            )}
          </div>
        </>
      )}

      {sector === 'general' && (
        <p className="p-4 bg-stone-50 border border-stone-100 rounded-lg text-stone-700 leading-relaxed whitespace-pre-wrap shadow-inner min-h-[120px] font-mono text-[11px]">
          {value.internal_notes || t('dashboard.clients.general.no_notes') || 'Sin observaciones redactadas.'}
        </p>
      )}
    </div>
  );
}
