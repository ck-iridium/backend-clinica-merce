"use client"

import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface ServicePreview {
  name: string;
  duration: number;
  price: number;
  desc: string;
}

const SECTOR_PREVIEWS: Record<string, ServicePreview[]> = {
  "Clínica Dental y Odontología": [
    { name: "Revisión Odontológica & Diagnóstico Digital", duration: 30, price: 30.00, desc: "Examen clínico integral, revisión periodontal con cámara intraoral y plan de tratamiento." },
    { name: "Limpieza Dental por Ultrasonidos & Profilaxis", duration: 45, price: 55.00, desc: "Eliminación de sarro bacteriano, pulido coronario con pasta fluorada y asesoramiento." },
    { name: "Blanqueamiento Dental LED en Clínica", duration: 60, price: 180.00, desc: "Aclarado de hasta 4 tonos con gel fotoactivado para devolver el brillo natural." },
    { name: "Estudio de Ortodoncia Invisible / Férula", duration: 45, price: 95.00, desc: "Escaneo 3D para alineación dental o férula personalizada contra el bruxismo." }
  ],
  "dental": [
    { name: "Revisión Odontológica & Diagnóstico Digital", duration: 30, price: 30.00, desc: "Examen clínico integral, revisión periodontal con cámara intraoral y plan de tratamiento." },
    { name: "Limpieza Dental por Ultrasonidos & Profilaxis", duration: 45, price: 55.00, desc: "Eliminación de sarro bacteriano, pulido coronario con pasta fluorada y asesoramiento." },
    { name: "Blanqueamiento Dental LED en Clínica", duration: 60, price: 180.00, desc: "Aclarado de hasta 4 tonos con gel fotoactivado para devolver el brillo natural." }
  ],
  "Medicina Estética": [
    { name: "Valoración Médica Inicial & Diagnóstico", duration: 45, price: 60.00, desc: "Evaluación clínica exhaustiva y diseño de un plan de tratamiento individualizado." },
    { name: "Tratamiento Facial Médico de Precisión", duration: 40, price: 120.00, desc: "Protocolo médico regenerativo para restaurar densidad y luminosidad." },
    { name: "Toxina Botulínica & Microinyecciones", duration: 30, price: 150.00, desc: "Atenuación elegante de arrugas y líneas de expresión con técnica micro-invasiva." }
  ],
  "Estética y Bienestar": [
    { name: "Higiene Facial Profunda Signature & Glow", duration: 60, price: 65.00, desc: "Limpieza celular, exfoliación ultrasónica y velo de ácido hialurónico puro." },
    { name: "Masaje Sensorial Holístico con Aceites", duration: 55, price: 70.00, desc: "Terapia corporal envolvente con maniobras rítmicas y botánicos templados." },
    { name: "Tratamiento Corporal Reafirmante & Drenante", duration: 50, price: 80.00, desc: "Estimulación tisular y remodelación localizada para tonificar la piel." }
  ],
  "Clínicas de Salud": [
    { name: "Valoración Médica & Diagnóstico Integral", duration: 45, price: 60.00, desc: "Revisión clínica completa y prescripción de protocolo especializado." },
    { name: "Sesión de Fisioterapia y Terapia Manual", duration: 50, price: 55.00, desc: "Tratamiento de dolencias musculares y articulares con biomecánica avanzada." },
    { name: "Consulta de Nutrición Clínica y Bioimpedancia", duration: 45, price: 50.00, desc: "Estudio corporal completo y pauta alimentaria estratégica personalizada." }
  ],
  "Salones y Barberías": [
    { name: "Corte de Cabello Signature & Asesoramiento", duration: 35, price: 28.00, desc: "Corte adaptado a fisonomía craneal, lavado con masaje y styling." },
    { name: "Ritual de Afeitado Tradicional a Navaja", duration: 30, price: 24.00, desc: "Afeitado clásico con toalla caliente aromática y bálsamo hidratante." },
    { name: "Tratamiento de Hidratación Capilar Profunda", duration: 40, price: 35.00, desc: "Nutrición con mascarilla reconstructora y secador profesional." }
  ],
  "Veterinaria y Cuidados": [
    { name: "Chequeo Clínico Integral & Medicina Preventiva", duration: 30, price: 38.00, desc: "Exploración física completa sin estrés con informe de salud para el tutor." },
    { name: "Plan de Vacunación & Desparasitación Anual", duration: 25, price: 45.00, desc: "Inmunizaciones esenciales y antiparasitario adaptado a su edad y peso." },
    { name: "Revisión Dental Preventiva y Salud Bucal", duration: 30, price: 35.00, desc: "Diagnóstico de sarro y encías para prevenir patologías periodontales." }
  ],
  "Automoción y Mecánica": [
    { name: "Tratamiento Detailing & Protección Cerámica", duration: 90, price: 140.00, desc: "Descontaminado de pintura, pulido fino y sellador cerámico de larga duración." },
    { name: "Diagnosis Electrónica Computarizada", duration: 40, price: 45.00, desc: "Escaneo de centralitas y detección precoz de anomalías con máquina oficial." },
    { name: "Revisión Preventiva Oficial & Puesta a Punto", duration: 60, price: 85.00, desc: "Inspección de 40 puntos críticos: frenos, suspensión, fluidos y niveles." }
  ],
  "Servicios a Domicilio": [
    { name: "Diagnóstico Técnico & Reparación Especializada", duration: 60, price: 60.00, desc: "Visita diagnóstica en tu vivienda y presupuesto in situ de resolución." },
    { name: "Mantenimiento Preventivo de Instalaciones", duration: 50, price: 55.00, desc: "Revisión completa de rendimiento energético y limpieza técnica preventiva." },
    { name: "Instalación Certificada de Equipamiento", duration: 75, price: 85.00, desc: "Montaje profesional con pruebas de carga y garantía de servicio por escrito." }
  ],
  "Consultoría y Asesoría": [
    { name: "Sesión Estratégica de Diagnóstico & Auditoría", duration: 50, price: 90.00, desc: "Análisis exhaustivo del estado actual y hoja de ruta de prioridades de negocio." },
    { name: "Consultoría de Planificación Fiscal y Patrimonial", duration: 60, price: 120.00, desc: "Estructuración tributaria eficiente para optimizar cargas impositivas." },
    { name: "Asesoramiento Legal Corporativo y Contractual", duration: 45, price: 95.00, desc: "Revisión preventiva de contratos comerciales y blindaje legal societario." }
  ],
  "General / Otros Servicios": [
    { name: "Consulta Inicial & Conceptualización Personalizada", duration: 35, price: 40.00, desc: "Puesta en común, definición de objetivos y propuesta adaptada a tus necesidades." },
    { name: "Sesión Especializada Signature", duration: 60, price: 75.00, desc: "Servicio insignia con dedicación exclusiva y aplicación de protocolos de autor." },
    { name: "Protocolo de Acabado y Perfeccionamiento", duration: 45, price: 55.00, desc: "Detalle meticuloso y tratamiento final para una durabilidad impecable." }
  ]
};

interface StepProvisioningProps {
  selectedSector: string;
  clinicName?: string;
  loadDemoData: boolean;
  setLoadDemoData: (val: boolean) => void;
}

export const StepProvisioning: React.FC<StepProvisioningProps> = ({
  selectedSector,
  clinicName = '',
  loadDemoData,
  setLoadDemoData
}) => {
  // Detección inteligente: si el nombre del negocio tiene "dent", orientar a Dental
  const isDentalName = clinicName && /dentist|dental|odontolog|dientes/i.test(clinicName);
  
  let resolvedSector = selectedSector;
  if (isDentalName && (selectedSector === 'Clínicas de Salud' || selectedSector === 'General / Otros Servicios')) {
    resolvedSector = "Clínica Dental y Odontología";
  }

  const previews = SECTOR_PREVIEWS[resolvedSector] || SECTOR_PREVIEWS[selectedSector] || SECTOR_PREVIEWS["Estética y Bienestar"];
  const displaySectorName = resolvedSector || selectedSector;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
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
              Generar catálogo inicial de {displaySectorName}
            </label>
            <p className="text-xs text-stone-400 font-medium leading-relaxed">
              ProBookia configurará automáticamente servicios premium específicos para el sector de <strong className="text-stone-700">{displaySectorName}</strong>, con fotografías y precios reales para que tu portal de reservas esté online y funcional desde el primer segundo.
            </p>
          </div>
        </div>

        {/* DYNAMIC SERVICE CATALOG PREVIEW (WOW FACTOR) */}
        {loadDemoData && (
          <div className="border border-stone-200/70 rounded-2xl p-5 space-y-3 bg-white shadow-sm transition-all duration-500 animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <span className="text-[9px] font-black tracking-widest text-[#d4af37] uppercase">
                Catálogo Inicial Previsualizado ({displaySectorName})
              </span>
              <span className="text-[10px] font-bold text-stone-400 font-serif italic">
                {previews.length} servicios sugeridos con fotos
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

        {/* TRUST BADGE QUIET LUXURY */}
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-stone-50 border border-stone-200/50">
          <Sparkles className="w-4 h-4 text-[#d4af37] shrink-0" />
          <p className="text-[10px] text-stone-500 leading-normal">
            <strong>Diseño "Quiet Luxury" aplicado:</strong> Hemos inyectado una paleta tipográfica y estilo visual acordes con tu sector. Tu web de reservas tendrá fotos de alta gama y copywriting persuasivo con tu nombre desde el primer clic. Podrás editarlo o borrarlo todo en cualquier momento.
          </p>
        </div>
      </div>
    </div>
  );
};
