"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

function isRootDomain(): boolean {
  if (typeof window === 'undefined') return true;
  const hostname = window.location.hostname.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  
  if (searchParams.has('tenant') || searchParams.has('tenant_id')) return false;
  if (hostname === 'probookia.com' || hostname === 'www.probookia.com') return true;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
  if (hostname.endsWith('.probookia.com') && hostname !== 'www.probookia.com') return false;
  if (hostname.endsWith('.localhost')) return false;
  return false;
}

export default function CondicionesReservaPage() {
  const [isRoot, setIsRoot] = useState<boolean>(true);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const rootStatus = isRootDomain();
    setIsRoot(rootStatus);

    if (!rootStatus) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/`)
        .then(res => res.json())
        .then(data => {
          setSettings(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching settings:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="py-24 text-center text-stone-400 font-sans">Cargando condiciones de reserva...</div>;
  }

  // VISTA A: DOMINIO CORPORATIVO PROBOOKIA (probookia.com)
  if (isRoot) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 animate-in fade-in duration-700 font-sans">
        <nav className="mb-12">
          <Link href="/marketing" className="text-sm font-bold text-[#d4af37] hover:underline flex items-center gap-2">
            ← Volver a ProBookia
          </Link>
        </nav>

        <header className="mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37] bg-[#d4af37]/10 px-3 py-1 rounded-full border border-[#d4af37]/20">
            Aviso de Reserva
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-stone-900 dark:text-stone-100 mt-4 tracking-tight">
            Condiciones de Reserva
          </h1>
          <p className="text-sm text-stone-500 mt-2">
            Política aplicable a las citas y reservas gestionadas a través de la plataforma.
          </p>
        </header>

        <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-6">
          <p className="text-stone-700 dark:text-stone-300">
            Las <strong>Condiciones de Reserva y Cancelación</strong> regulan la relación entre cada centro o clínica cliente y sus respectivos usuarios finales al concertar una cita en su portal web personalizado.
          </p>
          <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-sm text-amber-900 dark:text-amber-200">
            Si eres un profesional o centro interesado en conocer el acuerdo de licencia del software, niveles de servicio y condiciones de la plataforma SaaS, consulta nuestros:
          </div>
          <div>
            <Link 
              href="/terminos" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#d4af37] text-stone-950 font-bold text-sm hover:opacity-90 transition-all shadow-sm"
            >
              <span>Ver Términos del Servicio (B2B SaaS)</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // VISTA B: DOMINIO DE CADA CENTRO / TENANT
  const clinicName = settings?.clinic_name || 'Nuestro Centro';
  const legalName = settings?.legal_name || clinicName;
  const cancellationHours = settings?.cancellation_margin_hours || 24;
  const clinicEmail = settings?.clinic_email || 'nuestro email de contacto';
  const clinicPhone = settings?.whatsapp_number || settings?.clinic_phone || 'nuestro teléfono habitual';

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 animate-in fade-in duration-700 font-sans">
      <nav className="mb-12">
        <Link href="/" className="text-sm font-bold text-[#d4af37] hover:underline flex items-center gap-2">
          ← Volver a la web
        </Link>
      </nav>

      <h1 className="text-4xl md:text-5xl font-serif font-black text-stone-900 dark:text-stone-100 mb-12 tracking-tight">
        Condiciones de Reserva
      </h1>

      <div className="prose prose-stone dark:prose-invert max-w-none space-y-8 text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
        <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
            1. Política de Fianzas y Garantía de Reserva
          </h2>
          <p>
            Para garantizar la reserva de cabina y la disponibilidad de nuestros profesionales, <strong>{legalName}</strong> puede requerir el abono de una fianza o depósito previo a través de la pasarela de pagos segura <strong>Stripe</strong>. El importe abonado se descontará íntegramente del coste total del tratamiento el día de su realización en el centro.
          </p>
        </section>

        <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
            2. Cancelaciones, Modificaciones y Plazos
          </h2>
          <p>
            Entendemos que pueden surgir imprevistos. Para mantener la excelencia operativa y el respeto a la agenda de nuestros especialistas y demás clientes, se aplica la siguiente política:
          </p>
          <ul className="mt-4 list-disc pl-5 space-y-2 text-sm">
            <li>
              <strong>Con más de {cancellationHours} horas de antelación:</strong> Puede reprogramar la fecha de su cita o cancelarla sin penalización, recuperando el importe de su fianza o manteniéndolo como saldo a su favor para la nueva fecha elegida.
            </li>
            <li>
              <strong>Con menos de {cancellationHours} horas de antelación o No-Presentación (No-Show):</strong> La fianza abonada se retendrá en concepto de indemnización por bloqueo de agenda, costes operativos y preparación de cabina no recuperable.
            </li>
          </ul>
        </section>

        <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
            3. Excepción al Derecho de Desistimiento
          </h2>
          <p>
            De conformidad con el <strong>artículo 103, apartado l) del Real Decreto Legislativo 1/2007 (Ley General para la Defensa de los Consumidores y Usuarios)</strong>, el derecho de desistimiento de 14 días no es aplicable a los servicios con una fecha o periodo de ejecución específicos (como citas de estética, bienestar o salud concertadas). Por consiguiente, transcurrido el plazo de preaviso de {cancellationHours} horas, no procederá la devolución del depósito de reserva.
          </p>
        </section>

        <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
            4. Puntualidad y Tolerancia
          </h2>
          <p>
            Le rogamos acudir con 5-10 minutos de antelación. En caso de retraso superior a 15 minutos sin preaviso, el centro se reserva el derecho de adaptar la duración del tratamiento o cancelar la cita para no perjudicar a los clientes siguientes, computándose a efectos de depósito como no-presentación.
          </p>
        </section>

        <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
            5. Seguridad en los Pagos
          </h2>
          <p>
            <strong>{clinicName}</strong> no almacena ni tiene acceso a sus datos bancarios ni números de tarjeta. Todas las transacciones se procesan mediante <strong>Stripe Connect</strong> bajo certificación bancaria PCI-DSS Nivel 1 y autenticación reforzada SCA (3D Secure).
          </p>
        </section>

        <section className="bg-stone-50 dark:bg-stone-900/50 p-8 rounded-3xl border border-stone-200 dark:border-stone-800">
          <p className="text-xs italic text-stone-500 dark:text-stone-400">
            Al formalizar una reserva, el usuario declara haber leído y aceptado estas condiciones. Para consultas urgentes puede contactarnos en <strong>{clinicEmail}</strong> o al teléfono/WhatsApp <strong>{clinicPhone}</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
