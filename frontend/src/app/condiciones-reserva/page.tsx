"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CondicionesReservaPage() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/`)
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error("Error fetching settings:", err));
  }, []);

  if (!settings) return <div className="py-20 text-center text-stone-400">Cargando condiciones...</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 animate-in fade-in duration-700">
      <nav className="mb-12">
        <Link href="/" className="text-sm font-bold text-[#d4af37] hover:underline flex items-center gap-2">
          ← Volver a la web
        </Link>
      </nav>

      <h1 className="text-4xl md:text-5xl font-serif font-black text-stone-800 mb-12 tracking-tight">Condiciones de Reserva</h1>

      <div className="prose prose-stone max-w-none space-y-8 text-stone-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-stone-800 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 pb-2">1. Política de Fianzas (Stripe)</h2>
          <p>
            Para garantizar su cita, {settings.clinic_name} requiere el pago de una fianza mediante la plataforma segura <strong>Stripe</strong>. El importe de la fianza se descontará del precio total del tratamiento el día de su visita.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-800 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 pb-2">2. Cancelaciones y Cambios</h2>
          <p>
            Entendemos que pueden surgir imprevistos. Sin embargo, para mantener la calidad de nuestro servicio y respetar el tiempo de nuestros profesionales, aplicamos la siguiente política:
          </p>
          <ul className="mt-4 list-disc pl-5 space-y-2">
             <li><strong>Más de {settings.cancellation_margin_hours || 24} horas de antelación:</strong> Puede reprogramar o cancelar su cita recuperando íntegramente su fianza o manteniéndola para la nueva fecha.</li>
             <li><strong>Menos de {settings.cancellation_margin_hours || 24} horas de antelación o No-Presentado:</strong> La fianza se perderá en concepto de gastos de gestión y bloqueo de agenda.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-800 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 pb-2">3. Puntualidad</h2>
          <p>
            Le rogamos puntualidad para garantizar que pueda disfrutar de la duración completa de su tratamiento. En caso de retraso superior a 15 minutos, la clínica se reserva el derecho de cancelar la cita para no perjudicar al siguiente cliente, considerándose como "No-Presentado".
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-800 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 pb-2">4. Seguridad en los Pagos</h2>
          <p>
            {settings.clinic_name} no almacena sus datos bancarios. Todas las transacciones se realizan a través de <strong>Stripe</strong>, cumpliendo con los estándares de seguridad PCI-DSS de nivel 1.
          </p>
        </section>

        <section className="bg-stone-50 p-8 rounded-3xl border border-stone-100">
          <p className="text-sm italic opacity-80">
            Al realizar una reserva en nuestro sistema, usted acepta expresamente estas condiciones. Si tiene cualquier duda, puede contactarnos en {settings.clinic_email} o al teléfono {settings.clinic_phone}.
          </p>
        </section>
      </div>
    </div>
  );
}
