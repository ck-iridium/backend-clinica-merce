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
    <div className="w-full flex flex-col flex-grow bg-[#F7F7F5] items-center justify-center px-6 overflow-y-auto py-12">
      {/* Círculo de Éxito Animado */}
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 100 }}
        className="w-20 h-20 bg-stone-900 rounded-full flex items-center justify-center mb-8 shadow-2xl relative"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-[#d4af37]/20 scale-150"
        />
        <Check size={40} className="text-[#d4af37]" />
      </motion.div>

      {/* Título Editorial */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl font-serif text-stone-800 tracking-tight mb-2">¡Petición enviada!</h1>
        <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#d4af37]">
          <Sparkles size={12} />
          <span>Tu momento está cerca</span>
        </div>
      </motion.div>

      {/* Tarjeta Bento de Confirmación */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-sm bg-white rounded-3xl border border-stone-100 shadow-xl overflow-hidden mb-8"
      >
        <div className="p-6 border-b border-stone-50">
          <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-4">Resumen de tu cita</p>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-stone-400">Fecha</p>
                <p className="text-sm font-bold text-stone-800">
                  {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-stone-400">Hora</p>
                <p className="text-sm font-bold text-stone-800">{selectedTime}h</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-stone-50/50 p-6 flex items-center justify-between">
           <div className="flex flex-col">
             <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-0.5">Tratamiento</p>
             <p className="text-xs font-serif font-bold text-stone-700 italic">{selectedService?.name}</p>
           </div>
           <div className="text-right">
             <p className="text-lg font-serif font-bold text-stone-900">{selectedService?.price}€</p>
           </div>
        </div>
      </motion.div>

      {/* Nota de Correo Estilizada */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center max-w-xs mb-10"
      >
        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-stone-100 shadow-sm mb-4">
          <Mail size={14} className="text-[#d4af37]" />
          <span className="text-[10px] font-bold text-stone-800">{formData.email}</span>
        </div>
        <p className="text-xs text-stone-500 leading-relaxed">
          Te hemos enviado un enlace de confirmación. Por favor, confírmalo en los próximos <span className="text-stone-800 font-bold">30 minutos</span> para asegurar tu hueco.
        </p>
      </motion.div>

      {/* Botón Final */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-xs"
      >
        <Link 
          href="/" 
          className="group w-full bg-stone-900 text-[#d4af37] py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <span>Volver al Inicio</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </div>
  );
}
