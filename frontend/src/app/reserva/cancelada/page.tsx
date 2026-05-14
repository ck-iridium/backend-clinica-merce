"use client";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function ReservaCancelada() {
  return (
    <div className="min-h-screen bg-[#fcf8f8] flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl text-center max-w-md w-full animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-3xl font-serif font-bold text-stone-800 mb-4">Pago Cancelado</h1>
        <p className="text-stone-500 mb-8 leading-relaxed">
          El proceso de pago ha sido cancelado o no se pudo completar. Tu cita ha sido anulada y el horario vuelve a estar disponible.
        </p>
        <Link 
          href="/reservar" 
          className="block w-full py-4 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-2xl transition-colors shadow-sm"
        >
          Intentar Reservar de Nuevo
        </Link>
      </div>
    </div>
  );
}
