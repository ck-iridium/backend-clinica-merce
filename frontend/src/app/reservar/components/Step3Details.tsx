"use client"
import React from 'react';
import { User, Mail, Phone, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Step3Details({
  formData,
  setFormData,
  selectedDate,
  selectedTime,
  selectedService,
  privacyAccepted,
  setPrivacyAccepted
}: {
  formData: { name: string; email: string; phone: string };
  setFormData: (d: any) => void;
  selectedDate: Date;
  selectedTime: string;
  selectedService: any;
  privacyAccepted: boolean;
  setPrivacyAccepted: (v: boolean) => void;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full flex flex-col flex-grow bg-[#F7F7F5]"
    >
      {/* Header Equilibrado */}
      <div className="shrink-0 px-6 pt-4 pb-2 z-30 bg-[#F7F7F5]">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-stone-800 tracking-tight">Tus datos</h1>
        <p className="text-[11px] md:text-xs lg:text-sm text-stone-500 mt-1 uppercase tracking-[0.15em] font-medium truncate">
          Finaliza tu reserva para <span className="text-[#d4af37] font-bold">{selectedService?.name}</span>
        </p>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar px-6 pt-3 pb-6 space-y-5">
        {/* Card de Resumen con fuentes legibles */}
        <div className="bg-white rounded-2xl p-4 md:p-6 md:px-8 border border-stone-100 shadow-sm flex items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#d4af37]/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
          
          <div className="relative z-10">
            <p className="text-[10px] md:text-xs font-black uppercase text-[#d4af37] tracking-[0.2em] mb-0.5">Cita para el</p>
            <p className="text-base md:text-xl font-serif text-stone-800 leading-tight">
              {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
            </p>
            <p className="text-xs md:text-sm font-bold text-stone-400 mt-0.5">A las {selectedTime}h</p>
          </div>

          <div className="text-right relative z-10">
            <p className="text-[10px] md:text-xs font-black uppercase text-stone-300 tracking-widest mb-0.5">Total</p>
            <p className="text-2xl md:text-3xl font-serif text-stone-900 font-bold">{selectedService?.price}€</p>
          </div>
        </div>

        {/* Formulario Compacto pero legible */}
        <div className="space-y-4">
          <div className="space-y-3.5 md:space-y-5">
            <div className="group">
              <label className="block text-[10px] md:text-xs font-black uppercase tracking-[0.12em] text-stone-400 mb-1.5 ml-1 group-focus-within:text-[#d4af37] transition-colors">
                Nombre Completo
              </label>
              <div className="relative">
                <div className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-[#d4af37] transition-colors">
                  <User size={18} className="md:scale-125" />
                </div>
                <input 
                  required 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  className="w-full bg-white border border-stone-100 rounded-xl md:rounded-2xl py-3.5 md:py-4.5 pl-12 md:pl-16 pr-4 text-sm md:text-base font-bold text-stone-800 placeholder:text-stone-200 focus:ring-2 focus:ring-[#d4af37]/10 focus:border-[#d4af37] transition-all shadow-sm outline-none" 
                  placeholder="Ej: María García" 
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] md:text-xs font-black uppercase tracking-[0.12em] text-stone-400 mb-1.5 ml-1 group-focus-within:text-[#d4af37] transition-colors">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-[#d4af37] transition-colors">
                  <Mail size={18} className="md:scale-125" />
                </div>
                <input 
                  required 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({ ...formData, email: e.target.value })} 
                  className="w-full bg-white border border-stone-100 rounded-xl md:rounded-2xl py-3.5 md:py-4.5 pl-12 md:pl-16 pr-4 text-sm md:text-base font-bold text-stone-800 placeholder:text-stone-200 focus:ring-2 focus:ring-[#d4af37]/10 focus:border-[#d4af37] transition-all shadow-sm outline-none" 
                  placeholder="tu@email.com" 
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] md:text-xs font-black uppercase tracking-[0.12em] text-stone-400 mb-1.5 ml-1 group-focus-within:text-[#d4af37] transition-colors">
                Teléfono
              </label>
              <div className="relative">
                <div className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-[#d4af37] transition-colors">
                  <Phone size={18} className="md:scale-125" />
                </div>
                <input 
                  required 
                  type="tel" 
                  value={formData.phone} 
                  onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                  className="w-full bg-white border border-stone-100 rounded-xl md:rounded-2xl py-3.5 md:py-4.5 pl-12 md:pl-16 pr-4 text-sm md:text-base font-bold text-stone-800 placeholder:text-stone-200 focus:ring-2 focus:ring-[#d4af37]/10 focus:border-[#d4af37] transition-all shadow-sm outline-none" 
                  placeholder="600 000 000" 
                />
              </div>
            </div>
          </div>

          {/* Privacy & Trust Equilibrado */}
          <div className="pt-2 px-1">
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className="relative shrink-0">
                <input 
                  type="checkbox" 
                  checked={privacyAccepted} 
                  onChange={e => setPrivacyAccepted(e.target.checked)} 
                  className="peer sr-only" 
                />
                <div className="w-6 h-6 md:w-8 md:h-8 border-2 border-stone-200 rounded-lg md:rounded-xl bg-white transition-all flex items-center justify-center text-white overflow-hidden relative shadow-sm">
                  <AnimatePresence>
                    {privacyAccepted && (
                      <motion.div 
                        initial={{ scale: 0, rotate: -15 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 15 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="absolute inset-0 bg-[#d4af37] flex items-center justify-center"
                      >
                        <motion.svg
                          className="w-3.5 h-3.5 md:w-5 md:h-5 text-stone-900 stroke-current"
                          viewBox="0 0 24 24"
                          fill="none"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <motion.path
                            d="M20 6L9 17l-5-5"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.2, ease: "easeOut", delay: 0.05 }}
                          />
                        </motion.svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] md:text-sm font-bold text-stone-600 group-hover:text-stone-900 transition-colors">
                  Acepto la{' '}
                  <a 
                    href="/privacidad" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="underline text-[#d4af37] hover:text-[#b4902a] transition-colors"
                  >
                    política de privacidad
                  </a>
                </span>
                <span className="text-[9px] md:text-xs text-stone-400 uppercase tracking-widest mt-0.5 font-medium">Tus datos están seguros y cifrados</span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
