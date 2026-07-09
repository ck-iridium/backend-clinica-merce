"use client";

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
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Alergias</label>
            <input 
              id="clinical-allergies-input"
              type="text" 
              value={value.allergies || ''} 
              onChange={e => updateMeta('allergies', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder="Látex, penicilina..." 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Medicación Actual</label>
            <input 
              id="clinical-medications-input"
              type="text" 
              value={value.medications || ''} 
              onChange={e => updateMeta('medications', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder="Medicamentos diarios..." 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Historial de Lesiones</label>
            <input 
              id="clinical-injury-history-input"
              type="text" 
              value={value.injury_history || ''} 
              onChange={e => updateMeta('injury_history', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder="Lesiones previas, operaciones..." 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Notas Clínicas</label>
            <textarea 
              id="clinical-notes-textarea"
              value={value.clinical_notes || ''} 
              onChange={e => updateMeta('clinical_notes', e.target.value)} 
              rows={3} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder="Detalles de salud del paciente..." 
              disabled={disabled}
            />
          </div>
        </>
      )}
      
      {sector === 'beauty' && (
        <>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Tipo de Piel</label>
            <input 
              id="beauty-skin-type-input"
              type="text" 
              value={value.skin_type || ''} 
              onChange={e => updateMeta('skin_type', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder="Piel seca, grasa, mixta, sensible..." 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Sensibilidad a Cosméticos</label>
            <input 
              id="beauty-cosmetic-sensitivities-input"
              type="text" 
              value={value.cosmetic_sensitivities || ''} 
              onChange={e => updateMeta('cosmetic_sensitivities', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder="Alergia a conservantes, perfumes..." 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Observaciones Estéticas / Tratamientos de Interés</label>
            <textarea 
              id="beauty-aesthetic-notes-textarea"
              value={value.aesthetic_notes || ''} 
              onChange={e => updateMeta('aesthetic_notes', e.target.value)} 
              rows={3} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder="Tratamientos corporales/faciales recomendados, objetivos..." 
              disabled={disabled}
            />
          </div>
        </>
      )}
      
      {sector === 'barber' && (
        <>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Tipo de Cabello / Cuero Cabelludo</label>
            <input 
              id="barber-hair-type-input"
              type="text" 
              value={value.hair_type || ''} 
              onChange={e => updateMeta('hair_type', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder="Cabello fino, seco, graso, caspa..." 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Sensibilidad a Tintes / Químicos</label>
            <input 
              id="barber-chemical-sensitivities-input"
              type="text" 
              value={value.chemical_sensitivities || ''} 
              onChange={e => updateMeta('chemical_sensitivities', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder="Sensible al amoníaco, tinturas..." 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Fórmulas de Color / Tinte</label>
            <textarea 
              id="barber-color-formulas-textarea"
              value={value.color_formulas || ''} 
              onChange={e => updateMeta('color_formulas', e.target.value)} 
              rows={3} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder="Fórmulas de tinte, mezclas y decoloración..." 
              disabled={disabled}
            />
          </div>
        </>
      )}
      
      {sector === 'veterinary' && (
        <>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Nombre de la Mascota</label>
            <input 
              id="vet-pet-name-input"
              type="text" 
              value={value.pet_name || ''} 
              onChange={e => updateMeta('pet_name', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder="Toby, Luna..." 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Especie y Raza</label>
            <input 
              id="vet-pet-species-input"
              type="text" 
              value={value.pet_species || ''} 
              onChange={e => updateMeta('pet_species', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder="Perro (Golden Retriever)..." 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Edad de la Mascota</label>
            <input 
              id="vet-pet-age-input"
              type="text" 
              value={value.pet_age || ''} 
              onChange={e => updateMeta('pet_age', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder="3 años..." 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Carácter / Comportamiento</label>
            <input 
              id="vet-pet-temperament-input"
              type="text" 
              value={value.temperament || ''} 
              onChange={e => updateMeta('temperament', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder="Cariñoso, asustadizo..." 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Historial de Vacunación</label>
            <input 
              id="vet-vaccination-record-input"
              type="text" 
              value={value.vaccination_record || ''} 
              onChange={e => updateMeta('vaccination_record', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder="Rabia al día, desparasitado..." 
              disabled={disabled}
            />
          </div>
        </>
      )}
      
      {sector === 'automotive' && (
        <>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Matrícula</label>
            <input 
              id="auto-license-plate-input"
              type="text" 
              value={value.license_plate || ''} 
              onChange={e => updateMeta('license_plate', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder="1234XYZ..." 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Marca</label>
            <input 
              id="auto-brand-input"
              type="text" 
              value={value.brand || ''} 
              onChange={e => updateMeta('brand', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder="Toyota, Seat..." 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Modelo</label>
            <input 
              id="auto-model-input"
              type="text" 
              value={value.model || ''} 
              onChange={e => updateMeta('model', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder="Auris, Leon..." 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Año del Vehículo</label>
            <input 
              id="auto-year-input"
              type="number" 
              value={value.year || ''} 
              onChange={e => updateMeta('year', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder="2018..." 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Kilometraje Actual</label>
            <input 
              id="auto-mileage-input"
              type="number" 
              value={value.mileage || ''} 
              onChange={e => updateMeta('mileage', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder="85000..." 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Número de Bastidor (VIN)</label>
            <input 
              id="auto-vin-input"
              type="text" 
              value={value.vin || ''} 
              onChange={e => updateMeta('vin', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder="VIN de 17 caracteres..." 
              disabled={disabled}
            />
          </div>
        </>
      )}
      
      {sector === 'home_services' && (
        <>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Metros Cuadrados Vivienda</label>
            <input 
              id="home-sq-meters-input"
              type="number" 
              value={value.sq_meters || ''} 
              onChange={e => updateMeta('sq_meters', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder="90..." 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Tipo de Propiedad</label>
            <input 
              id="home-property-type-input"
              type="text" 
              value={value.property_type || ''} 
              onChange={e => updateMeta('property_type', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder="Piso, Ático, Chalet..." 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Códigos de Acceso (Urbanización / Portal)</label>
            <input 
              id="home-access-codes-input"
              type="text" 
              value={value.access_codes || ''} 
              onChange={e => updateMeta('access_codes', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder="Portal #1234, piso 2B..." 
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
            <label htmlFor="dangerous_pets" className="text-xs font-bold text-stone-600 cursor-pointer">Presencia de mascotas / Perros sueltos</label>
          </div>
        </>
      )}
      
      {sector === 'professional' && (
        <>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Sector de la Empresa</label>
            <input 
              id="prof-company-sector-input"
              type="text" 
              value={value.company_sector || ''} 
              onChange={e => updateMeta('company_sector', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder="Finanzas, Legal, Tecnología..." 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Sitio Web</label>
            <input 
              id="prof-website-url-input"
              type="url" 
              value={value.website_url || ''} 
              onChange={e => updateMeta('website_url', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder="https://..." 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Enlace a Carpeta Cloud (Drive / Dropbox)</label>
            <input 
              id="prof-cloud-folder-url-input"
              type="url" 
              value={value.cloud_folder_url || ''} 
              onChange={e => updateMeta('cloud_folder_url', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
              placeholder="https://drive.google.com/..." 
              disabled={disabled}
            />
          </div>
        </>
      )}
      
      {sector === 'general' && (
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Notas Internas / Observaciones</label>
          <textarea 
            id="general-internal-notes-textarea"
            value={value.internal_notes || ''} 
            onChange={e => updateMeta('internal_notes', e.target.value)} 
            rows={4} 
            className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:opacity-70" 
            placeholder="Notas libres sobre el cliente..." 
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}
