"use client"
import React from 'react';
import { Check, Calendar, Clock, Sparkles, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Step4Success({
  selectedDate,
  selectedTime,
  selectedService,
  formData
}: {
  selectedDate: Date;
  selectedTime: string;
  selectedService: any;
  formData: { name: string; email: string };
}) {
  return (
    <div className="w-full flex flex-col flex-grow bg-[#F7F7F5] items-center justify-center px-6 overflow-y-auto py-12 md:py-24">
      {/* Círculo de Éxito Animado */}
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 100 }}
        className="w-20 h-20 md:w-28 md:h-28 bg-stone-900 rounded-full flex items-center justify-center mb-8 md:mb-12 shadow-2xl relative"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-[#d4af37]/20 scale-150"
        />
        <Check size={40} className="text-[#d4af37] md:scale-125" />
      </motion.div>

      {/* Título Editorial */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-10 md:mb-14"
      >
        <h1 className="text-3xl md:text-5xl font-serif text-stone-800 tracking-tight mb-2 md:mb-4">¡Petición enviada!</h1>
        <div className="flex items-center justify-center gap-2 md:gap-3 text-[10px] md:text-sm font-black uppercase tracking-[0.2em] text-[#d4af37]">
          <Sparkles size={12} className="md:scale-125" />
          <span>Tu momento está cerca</span>
        </div>
      </motion.div>

      {/* Tarjeta Bento de Confirmación */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-sm md:max-w-xl bg-white rounded-3xl md:rounded-[2rem] border border-stone-100 shadow-xl overflow-hidden mb-8 md:mb-12"
      >
        <div className="p-6 md:p-8 md:px-10 border-b border-stone-50">
          <p className="text-[10px] md:text-xs font-black uppercase text-stone-400 tracking-widest mb-4 md:mb-6">Resumen de tu cita</p>
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-stone-50 rounded-xl md:rounded-2xl flex items-center justify-center text-stone-400">
                <Calendar size={18} className="md:scale-125" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs uppercase font-bold text-stone-400">Fecha</p>
                <p className="text-sm md:text-lg font-bold text-stone-800">
                  {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-stone-50 rounded-xl md:rounded-2xl flex items-center justify-center text-stone-400">
                <Clock size={18} className="md:scale-125" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs uppercase font-bold text-stone-400">Hora</p>
                <p className="text-sm md:text-lg font-bold text-stone-800">{selectedTime}h</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-stone-50/50 p-6 md:p-8 md:px-10 flex items-center justify-between">
           <div className="flex flex-col">
             <p className="text-[10px] md:text-xs font-black uppercase text-stone-400 tracking-widest mb-0.5">Tratamiento</p>
             <p className="text-xs md:text-base font-serif font-bold text-stone-700 italic">{selectedService?.name}</p>
           </div>
           <div className="text-right">
             <p className="text-lg md:text-2xl font-serif font-bold text-stone-900">{selectedService?.price}€</p>
           </div>
        </div>
      </motion.div>

      {/* Nota de Correo Estilizada */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center max-w-xs md:max-w-md mb-10 md:mb-14 px-4"
      >
        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 md:px-6 md:py-3 rounded-full border border-stone-100 shadow-sm mb-4">
          <Mail size={14} className="text-[#d4af37] md:scale-125" />
          <span className="text-[10px] md:text-xs font-bold text-stone-800">{formData.email}</span>
        </div>
        <p className="text-xs md:text-sm text-stone-500 leading-relaxed">
          Te hemos enviado un enlace de confirmación. Por favor, confírmalo en los próximos <span className="text-stone-800 font-bold">30 minutos</span> para asegurar tu hueco.
        </p>
      </motion.div>

      {/* Botón Final */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-xs md:max-w-md"
      >
        <Link 
          href="/" 
          className="group w-full bg-stone-900 text-[#d4af37] py-4 md:py-5 rounded-2xl md:rounded-3xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <span>Volver al Inicio</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform md:scale-125" />
        </Link>
      </motion.div>
    </div>
  );
}
