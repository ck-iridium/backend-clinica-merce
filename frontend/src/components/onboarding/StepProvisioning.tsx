"use client"

import React from 'react';

interface ServicePreview {
  name: string;
  duration: number;
  price: number;
  desc: string;
}

const SECTOR_PREVIEWS: Record<string, ServicePreview[]> = {
  "Medicina Estética": [
    { name: "Toxina Botulínica (Bótox)", duration: 30, price: 150.00, desc: "Atenuación elegante de arrugas y líneas de expresión mediante microinyecciones localizadas." },
    { name: "Relleno con Ácido Hialurónico", duration: 45, price: 290.00, desc: "Relleno e hidratación de labios o pómulos con acabado natural y armónico." },
    { name: "Peeling Químico de Alta Gama", duration: 40, price: 95.00, desc: "Renovación celular profunda para aportar luminosidad extrema y homogeneizar el tono." }
  ],
  "Estética y Bienestar": [
    { name: "Higiene Facial Ultrasónica", duration: 45, price: 65.00, desc: "Purificación celular profunda con exfoliación y mascarilla calmante." },
    { name: "Masaje Relajante Sensorial", duration: 50, price: 70.00, desc: "Terapia relajante corporal con aceites esenciales calientes para calma absoluta." },
    { name: "Tratamiento Reafirmante de Radiofrecuencia", duration: 45, price: 85.00, desc: "Estímulo de colágeno mediante calor intradérmico para atenuar la flacidez." }
  ],
  "Clínicas de Salud": [
    { name: "Consulta Nutricional y Bioimpedancia", duration: 45, price: 60.00, desc: "Estudio corporal completo y plan nutricional personalizado." },
    { name: "Sesión de Fisioterapia Personalizada", duration: 55, price: 50.00, desc: "Tratamiento manual de dolencias y estiramientos dirigidos." },
    { name: "Drenaje Linfático Manual", duration: 60, price: 75.00, desc: "Terapia suave orientada a estimular la reducción activa de retención de líquidos." }
  ],
  "Salones y Barberías": [
    { name: "Corte de Cabello Signature & Estilismo", duration: 40, price: 35.00, desc: "Diseño personalizado de corte adaptado a tus rasgos y peinado profesional." },
    { name: "Ritual de Afeitado a Navaja Tradicional", duration: 30, price: 25.00, desc: "Afeitado clásico con toallas calientes aromáticas y espuma de brocha." },
    { name: "Tratamiento de Hidratación Capilar Profunda", duration: 45, price: 45.00, desc: "Nutrición capilar intensiva con keratina para devolver el brillo." }
  ]
};

interface StepProvisioningProps {
  selectedSector: string;
  loadDemoData: boolean;
  setLoadDemoData: (val: boolean) => void;
}

export const StepProvisioning: React.FC<StepProvisioningProps> = ({
  selectedSector,
  loadDemoData,
  setLoadDemoData
}) => {
  const previews = SECTOR_PREVIEWS[selectedSector] || SECTOR_PREVIEWS["Estética y Bienestar"];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-4">
        <div className={`p-6 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
          loadDemoData 
            ? 'bg-[#FAF9F5] border-[#d4af37] shadow-sm' 
            : 'bg-stone-50/50 border-stone-200'
        }`}>
          <div className="pt-1 shrink-0">
            <input 
              type="checkbox" 
              id="demo-data"
              checked={loadDemoData}
              onChange={(e) => setLoadDemoData(e.target.checked)}
              className="h-5 w-5 border-stone-300 rounded text-[#d4af37] focus:ring-[#d4af37] cursor-pointer"
            />
          </div>
          <div>
            <label htmlFor="demo-data" className="font-bold text-stone-850 text-sm cursor-pointer block select-none mb-1">
              Generar catálogo inicial de {selectedSector}
            </label>
            <p className="text-xs text-stone-400 font-medium leading-relaxed">
              ProBookia configurará automáticamente **3 servicios premium** específicos para el sector de **{selectedSector}**, listos para que tu portal de reservas esté online y funcional desde el primer segundo.
            </p>
          </div>
        </div>

        {/* DYNAMIC SERVICE CATALOG PREVIEW (WOW FACTOR) */}
        {loadDemoData && (
          <div className="border border-stone-200/70 rounded-2xl p-5 space-y-3 bg-white shadow-sm transition-all duration-500 animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <span className="text-[9px] font-black tracking-widest text-[#d4af37] uppercase">
                Catálogo Inicial Previsualizado
              </span>
              <span className="text-[10px] font-bold text-stone-400 font-serif italic">
                Servicios sugeridos
              </span>
            </div>

            <div className="space-y-3">
              {previews.map((svc, idx) => (
                <div key={idx} className="flex justify-between items-start gap-4 p-2.5 rounded-xl hover:bg-stone-50 transition-colors border border-stone-50">
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-stone-800 flex items-center gap-2">
                      {svc.name}
                      <span className="text-[8px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded font-mono font-medium">{svc.duration} min</span>
                    </h4>
                    <p className="text-[9px] text-stone-400 mt-1 leading-relaxed max-w-[400px]">
                      {svc.desc}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-stone-900 font-mono shrink-0">{svc.price.toFixed(2)}€</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-[#FAF9F5]/40 border border-stone-200/50 rounded-2xl p-5 space-y-2 flex gap-3 text-stone-600">
          <span className="text-lg shrink-0">✨</span>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wide text-stone-700">Diseño "Quiet Luxury" Aplicado</h4>
            <p className="text-[10px] leading-relaxed text-stone-400 font-medium">
              Hemos inyectado una paleta tipográfica y estilística de lujo que coordina perfectamente con tu sector. Tu web de reservas tendrá fuentes de Serif elegantes y espaciados armoniosos que proyectan la máxima sofisticación frente a tus clientes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
