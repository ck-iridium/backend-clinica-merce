"use client";

import { useLanguage } from "@/app/contexts/LanguageContext";
import { AllergiesManager } from "./AllergiesManager";

interface SectorMetadataInputsProps {
  sector: string;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

export function SectorMetadataInputs({
  sector,
  value,
  onChange,
  disabled = false
}: SectorMetadataInputsProps) {
  const { t } = useLanguage();

  const updateMeta = (field: string, val: any) => {
    onChange({
      ...value,
      [field]: val
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sector === 'clinical' && (
        <>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.clinical.allergies') || 'Alergias'}
            </label>
            <AllergiesManager
              value={value.allergies || ''}
              onChange={val => updateMeta('allergies', val)}
              suggestions={[
                'dashboard.clients.allergies.sug.latex',
                'dashboard.clients.allergies.sug.penicillin',
                'dashboard.clients.allergies.sug.ibuprofen',
                'dashboard.clients.allergies.sug.aspirin',
                'dashboard.clients.allergies.sug.anesthetics',
                'dashboard.clients.allergies.sug.nickel'
              ]}
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.clinical.medications_label') || 'Medicación Actual'}
            </label>
            <input 
              id="clinical-medications-input"
              type="text" 
              value={value.medications || ''} 
              onChange={e => updateMeta('medications', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder={t('dashboard.clients.clinical.medications_placeholder') || "Medicamentos diarios..."} 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.clinical.injury_history_label') || 'Historial de Lesiones'}
            </label>
            <input 
              id="clinical-injury-history-input"
              type="text" 
              value={value.injury_history || ''} 
              onChange={e => updateMeta('injury_history', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder={t('dashboard.clients.clinical.injury_history_placeholder') || "Lesiones previas, operaciones..."} 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.clinical.notes_label') || 'Notas Clínicas'}
            </label>
            <textarea 
              id="clinical-notes-textarea"
              value={value.clinical_notes || ''} 
              onChange={e => updateMeta('clinical_notes', e.target.value)} 
              rows={3} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder={t('dashboard.clients.clinical.notes_placeholder') || "Detalles de salud del paciente..."} 
              disabled={disabled}
            />
          </div>
        </>
      )}
      
      {sector === 'beauty' && (
        <>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.beauty.skin_type_label') || 'Tipo de Piel'}
            </label>
            <input 
              id="beauty-skin-type-input"
              type="text" 
              value={value.skin_type || ''} 
              onChange={e => updateMeta('skin_type', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder={t('dashboard.clients.beauty.skin_type_placeholder') || "Piel seca, grasa, mixta, sensible..."} 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.beauty.sensitivities_label') || 'Sensibilidad a Cosméticos'}
            </label>
            <AllergiesManager
              value={value.cosmetic_sensitivities || ''}
              onChange={val => updateMeta('cosmetic_sensitivities', val)}
              suggestions={[
                'dashboard.clients.allergies.sug.latex',
                'dashboard.clients.allergies.sug.nickel',
                'dashboard.clients.allergies.sug.parabens',
                'dashboard.clients.allergies.sug.ammonia',
                'dashboard.clients.allergies.sug.fragrances',
                'dashboard.clients.allergies.sug.salicylic_acid',
                'dashboard.clients.allergies.sug.essential_oils'
              ]}
              disabled={disabled}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.beauty.aesthetic_notes_label') || 'Observaciones Estéticas / Tratamientos de Interés'}
            </label>
            <textarea 
              id="beauty-aesthetic-notes-textarea"
              value={value.aesthetic_notes || ''} 
              onChange={e => updateMeta('aesthetic_notes', e.target.value)} 
              rows={3} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder={t('dashboard.clients.beauty.aesthetic_notes_placeholder') || "Tratamientos corporales/faciales recomendados, objetivos..."} 
              disabled={disabled}
            />
          </div>
        </>
      )}
      
      {sector === 'barber' && (
        <>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.barber.hair_type_label') || 'Tipo de Cabello / Cuero Cabelludo'}
            </label>
            <input 
              id="barber-hair-type-input"
              type="text" 
              value={value.hair_type || ''} 
              onChange={e => updateMeta('hair_type', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder={t('dashboard.clients.barber.hair_type_placeholder') || "Cabello fino, seco, graso, caspa..."} 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.barber.chemical_sensitivities_label') || 'Sensibilidad a Tintes / Químicos'}
            </label>
            <AllergiesManager
              value={value.chemical_sensitivities || ''}
              onChange={val => updateMeta('chemical_sensitivities', val)}
              suggestions={[
                'dashboard.clients.allergies.sug.ammonia',
                'dashboard.clients.allergies.sug.ppd',
                'dashboard.clients.allergies.sug.nickel',
                'dashboard.clients.allergies.sug.latex',
                'dashboard.clients.allergies.sug.fragrances',
                'dashboard.clients.allergies.sug.parabens'
              ]}
              disabled={disabled}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.barber.color_formulas_label') || 'Fórmulas de Color / Tinte'}
            </label>
            <textarea 
              id="barber-color-formulas-textarea"
              value={value.color_formulas || ''} 
              onChange={e => updateMeta('color_formulas', e.target.value)} 
              rows={3} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder={t('dashboard.clients.barber.color_formulas_placeholder') || "Fórmulas de tinte, mezclas y decoloración..."} 
              disabled={disabled}
            />
          </div>
        </>
      )}
      
      {sector === 'veterinary' && (
        <>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.vet.pet_name_label') || 'Nombre de la Mascota'}
            </label>
            <input 
              id="vet-pet-name-input"
              type="text" 
              value={value.pet_name || ''} 
              onChange={e => updateMeta('pet_name', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder={t('dashboard.clients.vet.pet_name_placeholder') || "Toby, Luna..."} 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.vet.species_breed_label') || 'Especie y Raza'}
            </label>
            <input 
              id="vet-pet-species-input"
              type="text" 
              value={value.pet_species || ''} 
              onChange={e => updateMeta('pet_species', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder={t('dashboard.clients.vet.species_breed_placeholder') || "Perro (Golden Retriever)..."} 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.vet.age_label') || 'Edad de la Mascota'}
            </label>
            <input 
              id="vet-pet-age-input"
              type="text" 
              value={value.pet_age || ''} 
              onChange={e => updateMeta('pet_age', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder={t('dashboard.clients.vet.age_placeholder') || "3 años..."} 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.vet.temperament_label') || 'Carácter / Comportamiento'}
            </label>
            <input 
              id="vet-pet-temperament-input"
              type="text" 
              value={value.temperament || ''} 
              onChange={e => updateMeta('temperament', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder={t('dashboard.clients.vet.temperament_placeholder') || "Cariñoso, asustadizo..."} 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.vet.vaccinations_label') || 'Historial de Vacunación'}
            </label>
            <input 
              id="vet-vaccination-record-input"
              type="text" 
              value={value.vaccination_record || ''} 
              onChange={e => updateMeta('vaccination_record', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder={t('dashboard.clients.vet.vaccinations_placeholder') || "Rabia al día, desparasitado..."} 
              disabled={disabled}
            />
          </div>
        </>
      )}
      
      {sector === 'automotive' && (
        <>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.auto.license_plate_label') || 'Matrícula'}
            </label>
            <input 
              id="auto-license-plate-input"
              type="text" 
              value={value.license_plate || ''} 
              onChange={e => updateMeta('license_plate', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder={t('dashboard.clients.auto.license_plate_placeholder') || "1234XYZ..."} 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.auto.brand_label') || 'Marca'}
            </label>
            <input 
              id="auto-brand-input"
              type="text" 
              value={value.brand || ''} 
              onChange={e => updateMeta('brand', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder={t('dashboard.clients.auto.brand_placeholder') || "Toyota, Seat..."} 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.auto.model_label') || 'Modelo'}
            </label>
            <input 
              id="auto-model-input"
              type="text" 
              value={value.model || ''} 
              onChange={e => updateMeta('model', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder={t('dashboard.clients.auto.model_placeholder') || "Auris, Leon..."} 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.auto.year_label') || 'Año del Vehículo'}
            </label>
            <input 
              id="auto-year-input"
              type="number" 
              value={value.year || ''} 
              onChange={e => updateMeta('year', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder={t('dashboard.clients.auto.year_placeholder') || "2018..."} 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.auto.mileage_label') || 'Kilometraje Actual'}
            </label>
            <input 
              id="auto-mileage-input"
              type="number" 
              value={value.mileage || ''} 
              onChange={e => updateMeta('mileage', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder={t('dashboard.clients.auto.mileage_placeholder') || "85000..."} 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.auto.vin_label') || 'Número de Bastidor (VIN)'}
            </label>
            <input 
              id="auto-vin-input"
              type="text" 
              value={value.vin || ''} 
              onChange={e => updateMeta('vin', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder={t('dashboard.clients.auto.vin_placeholder') || "VIN de 17 caracteres..."} 
              disabled={disabled}
            />
          </div>
        </>
      )}
      
      {sector === 'home_services' && (
        <>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.home.sq_meters_label') || 'Metros Cuadrados Vivienda'}
            </label>
            <input 
              id="home-sq-meters-input"
              type="number" 
              value={value.sq_meters || ''} 
              onChange={e => updateMeta('sq_meters', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder={t('dashboard.clients.home.sq_meters_placeholder') || "90..."} 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.home.property_type_label') || 'Tipo de Propiedad'}
            </label>
            <input 
              id="home-property-type-input"
              type="text" 
              value={value.property_type || ''} 
              onChange={e => updateMeta('property_type', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder={t('dashboard.clients.home.property_type_placeholder') || "Piso, Ático, Chalet..."} 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.home.access_codes_label') || 'Códigos de Acceso (Urbanización / Portal)'}
            </label>
            <input 
              id="home-access-codes-input"
              type="text" 
              value={value.access_codes || ''} 
              onChange={e => updateMeta('access_codes', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder={t('dashboard.clients.home.access_codes_placeholder') || "Portal #1234, piso 2B..."} 
              disabled={disabled}
            />
          </div>
          <div className="flex items-center gap-3 md:col-span-2 pt-2">
            <input 
              type="checkbox" 
              id="dangerous_pets" 
              checked={value.dangerous_pets || false} 
              onChange={e => updateMeta('dangerous_pets', e.target.checked)} 
              className="rounded text-stone-900 focus:ring-stone-900 h-4 w-4 border-stone-300 cursor-pointer disabled:opacity-50" 
              disabled={disabled}
            />
            <label htmlFor="dangerous_pets" className="text-xs font-bold text-stone-600 cursor-pointer">
              {t('dashboard.clients.home.dangerous_pets_label') || 'Presencia de mascotas / Perros sueltos'}
            </label>
          </div>
        </>
      )}
      
      {sector === 'professional' && (
        <>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.prof.company_sector_label') || 'Sector de la Empresa'}
            </label>
            <input 
              id="prof-company-sector-input"
              type="text" 
              value={value.company_sector || ''} 
              onChange={e => updateMeta('company_sector', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder={t('dashboard.clients.prof.company_sector_placeholder') || "Finanzas, Legal, Tecnología..."} 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.prof.website_label') || 'Sitio Web'}
            </label>
            <input 
              id="prof-website-url-input"
              type="url" 
              value={value.website_url || ''} 
              onChange={e => updateMeta('website_url', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder={t('dashboard.clients.prof.website_placeholder') || "https://..."} 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('dashboard.clients.prof.cloud_folder_label') || 'Enlace a Carpeta Cloud (Drive / Dropbox)'}
            </label>
            <input 
              id="prof-cloud-folder-url-input"
              type="url" 
              value={value.cloud_folder_url || ''} 
              onChange={e => updateMeta('cloud_folder_url', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder={t('dashboard.clients.prof.cloud_folder_placeholder') || "https://drive.google.com/..."} 
              disabled={disabled}
            />
          </div>
        </>
      )}
      
      {sector === 'general' && (
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            {t('dashboard.clients.general.notes_label') || 'Notas Internas / Observaciones'}
          </label>
          <textarea 
            id="general-internal-notes-textarea"
            value={value.internal_notes || ''} 
            onChange={e => updateMeta('internal_notes', e.target.value)} 
            rows={4} 
            className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
            placeholder={t('dashboard.clients.general.notes_placeholder') || "Notas libres sobre el cliente..."} 
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}
