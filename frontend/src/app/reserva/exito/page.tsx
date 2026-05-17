"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, Calendar, Clock, Sparkles, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Componente Interno que usa useSearchParams
function ReservaExitoContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const fetchAppointment = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/session-appointment/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setAppointment(data);
        }
      } catch (err) {
        console.error("Error al recuperar detalles de la cita:", err);
      } finally {
        setLoading(false);
      }
    };

    // Dar un pequeño delay para asegurar que el webhook procese el pago antes de hacer fetch
    const timer = setTimeout(fetchAppointment, 1500);
    return () => clearTimeout(timer);
  }, [sessionId]);

  // Pantalla de Carga Premium (Sincronización)
  if (loading && sessionId) {
    return (
      <div className="w-full max-w-md bg-white p-8 md:p-12 rounded-[2rem] border border-stone-100 shadow-2xl text-center relative overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#d4af37]/30 via-[#d4af37] to-[#d4af37]/30"></div>
        <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6 relative">
          <Loader2 size={36} className="text-[#d4af37] animate-spin" />
        </div>
        <h2 className="text-xl md:text-2xl font-serif text-stone-800 font-semibold mb-2">Verificando Pago Seguro</h2>
        <p className="text-stone-400 text-xs md:text-sm leading-relaxed max-w-xs">
          Estamos sincronizando tu confirmación con nuestra agenda. Por favor, no cierres esta ventana.
        </p>
      </div>
    );
  }

  // Si tenemos los detalles de la cita (Redirección desde Stripe exitosa)
  if (appointment) {
    const formattedDate = new Date(appointment.date).toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });

    return (
      <div className="w-full max-w-xl flex flex-col items-center justify-center">
        {/* Círculo de Éxito Animado */}
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 100 }}
          className="w-20 h-20 md:w-28 md:h-28 bg-stone-900 rounded-full flex items-center justify-center mb-8 shadow-2xl relative"
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
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-5xl font-serif text-stone-800 tracking-tight mb-3">¡Reserva Confirmada!</h1>
          <div className="flex items-center justify-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-[#d4af37]">
            <Sparkles size={12} className="md:scale-110" />
            <span>Tu momento está asegurado</span>
          </div>
        </motion.div>

        {/* Tarjeta Bento de Confirmación */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full bg-white rounded-3xl md:rounded-[2rem] border border-stone-100 shadow-xl overflow-hidden mb-8"
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
                  <p className="text-sm md:text-lg font-bold text-stone-800">{formattedDate}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-stone-50 rounded-xl md:rounded-2xl flex items-center justify-center text-stone-400">
                  <Clock size={18} className="md:scale-125" />
                </div>
                <div>
                  <p className="text-[10px] md:text-xs uppercase font-bold text-stone-400">Hora</p>
                  <p className="text-sm md:text-lg font-bold text-stone-800">{appointment.time}h</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-stone-50/50 p-6 md:p-8 md:px-10 flex items-center justify-between">
             <div className="flex flex-col">
               <p className="text-[10px] md:text-xs font-black uppercase text-stone-400 tracking-widest mb-0.5">Tratamiento</p>
               <p className="text-xs md:text-base font-serif font-bold text-stone-700 italic">{appointment.service_name}</p>
             </div>
             <div className="text-right">
               <p className="text-lg md:text-2xl font-serif font-bold text-stone-900">{appointment.service_price}€</p>
             </div>
          </div>
        </motion.div>

        {/* Nota de Correo Estilizada */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center max-w-xs md:max-w-md mb-8 px-4"
        >
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-stone-100 shadow-sm mb-3">
            <Mail size={12} className="text-[#d4af37]" />
            <span className="text-[10px] md:text-xs font-bold text-stone-800">{appointment.client_email}</span>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">
            Hemos recibido el pago de tu fianza correctamente. Te hemos enviado un correo electrónico con los detalles y el justificante de la reserva.
          </p>
        </motion.div>

        {/* Botón Final */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-xs md:max-w-sm"
        >
          <Link 
            href="/" 
            className="group w-full bg-stone-900 hover:bg-[#d4af37] text-[#d4af37] hover:text-stone-900 py-4 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <span>Volver al Inicio</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    );
  }

  // Fallback de Éxito Genérico (si no hay detalles o falla la red, pero con estética de lujo)
  return (
    <div className="w-full max-w-md flex flex-col items-center justify-center">
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
        <Check size={36} className="text-[#d4af37]" />
      </motion.div>

      {/* Título Editorial */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6"
      >
        <h1 className="text-3xl md:text-4xl font-serif text-stone-800 tracking-tight mb-3">¡Reserva Confirmada!</h1>
        <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#d4af37] font-bold">
          <Sparkles size={11} />
          <span>Tu fianza se ha recibido correctamente</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center max-w-xs mb-8 px-2"
      >
        <p className="text-xs text-stone-500 leading-relaxed">
          Tu cita ha sido confirmada y bloqueada en nuestra agenda. Nos vemos pronto para ofrecerte una experiencia inolvidable.
        </p>
      </motion.div>

      {/* Botón Final */}
      <motion.div className="w-full max-w-xs">
        <Link 
          href="/" 
          className="group w-full bg-stone-900 hover:bg-[#d4af37] text-[#d4af37] hover:text-stone-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <span>Volver al Inicio</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </div>
  );
}

// Pantalla Completa de Éxito de la Reserva
export default function ReservaExito() {
  return (
    <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="w-full max-w-md bg-white p-8 md:p-12 rounded-[2rem] border border-stone-100 shadow-2xl text-center relative overflow-hidden flex flex-col items-center justify-center">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#d4af37]/30 via-[#d4af37] to-[#d4af37]/30"></div>
          <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6 relative">
            <Loader2 size={36} className="text-[#d4af37] animate-spin" />
          </div>
          <h2 className="text-xl md:text-2xl font-serif text-stone-800 font-semibold mb-2">Verificando Pago Seguro</h2>
          <p className="text-stone-400 text-xs md:text-sm leading-relaxed max-w-xs">
            Estamos sincronizando tu confirmación con nuestra agenda. Por favor, no cierres esta ventana.
          </p>
        </div>
      }>
        <ReservaExitoContent />
      </Suspense>
    </div>
  );
}
