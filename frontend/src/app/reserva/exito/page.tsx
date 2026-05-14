"use client";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function ReservaExito() {
  return (
    <div className="min-h-screen bg-[#fcf8f8] flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl text-center max-w-md w-full animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-3xl font-serif font-bold text-stone-800 mb-4">¡Reserva Confirmada!</h1>
        <p className="text-stone-500 mb-8 leading-relaxed">
          Hemos recibido tu pago correctamente. Tu cita ha sido confirmada y bloqueada en nuestra agenda. Nos vemos pronto.
        </p>
        <Link 
          href="/" 
          className="block w-full py-4 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-2xl transition-colors shadow-sm"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
