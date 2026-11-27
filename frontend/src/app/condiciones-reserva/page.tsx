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

      <h1 className="text-4xl md:text-5xl font-serif font-black text-stone-800 dark:text-stone-100 mb-12 tracking-tight">Condiciones de Reserva</h1>

      <div className="prose prose-stone dark:prose-invert max-w-none space-y-8 text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
        <section>
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">1. Política de Fianzas y Garantía de Reserva</h2>
          <p>
            Para garantizar la reserva de cabina y el tiempo de nuestros profesionales, <strong>{settings.legal_name || settings.clinic_name}</strong> puede requerir el pago de un depósito o fianza previa a través de la pasarela de pagos segura <strong>Stripe</strong>. El importe abonado se descontará íntegramente del importe total del tratamiento el día de su realización en el centro.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">2. Cancelaciones, Modificaciones y Plazos</h2>
          <p>
            Entendemos que pueden surgir imprevistos. Para mantener la excelencia operativa y el respeto a la agenda de nuestros especialistas y demás clientes, se aplica la siguiente política:
          </p>
          <ul className="mt-4 list-disc pl-5 space-y-2">
             <li><strong>Con más de {settings.cancellation_margin_hours || 24} horas de antelación:</strong> Puede reprogramar la fecha de su cita o cancelarla sin penalización, recuperando el importe de su fianza o manteniéndolo como saldo a su favor para la nueva fecha elegida.</li>
             <li><strong>Con menos de {settings.cancellation_margin_hours || 24} horas de antelación o No-Presentación (No-Show):</strong> La fianza abonada se retendrá en concepto de indemnización por bloqueo de agenda, costes operativos y preparación de cabina no recuperable.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">3. Excepción al Derecho de Desistimiento</h2>
          <p>
            De conformidad con lo dispuesto en el <strong>artículo 103, apartado l) del Real Decreto Legislativo 1/2007 (Ley General para la Defensa de los Consumidores y Usuarios)</strong>, el derecho de desistimiento de 14 días naturales no será aplicable a los contratos de servicios que prevén una fecha o un periodo de ejecución específicos (como servicios de salud, estética, bienestar o citas concertadas). Por consiguiente, transcurrido el margen de preaviso de {settings.cancellation_margin_hours || 24} horas antes de la cita, no procederá la devolución del depósito de reserva.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">4. Puntualidad y Tolerancia</h2>
          <p>
            Le rogamos llegar con 5-10 minutos de antelación a su cita para garantizar la duración completa de su tratamiento. En caso de retraso superior a 15 minutos por parte del cliente, el centro se reserva el derecho de adaptar la duración del servicio o cancelar la cita para no perjudicar a los clientes posteriores, considerándose a efectos de fianza como no-presentación.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">5. Seguridad en los Pagos y Encriptación</h2>
          <p>
            <strong>{settings.clinic_name}</strong> no almacena ni tiene acceso a sus datos bancarios ni números de tarjeta. Todas las transacciones se procesan mediante <strong>Stripe Connect</strong> bajo certificación de seguridad bancaria PCI-DSS Nivel 1 y autenticación reforzada SCA (3D Secure).
          </p>
        </section>

        <section className="bg-stone-50 dark:bg-stone-900/50 p-8 rounded-3xl border border-stone-100 dark:border-stone-800">
          <p className="text-sm italic opacity-80 text-stone-600 dark:text-stone-400">
            Al formalizar una reserva en nuestra plataforma, el usuario declara haber leído, comprendido y aceptado expresamente estas Condiciones de Reserva. Si requiere cualquier consulta o modificación urgente, puede contactarnos en <strong>{settings.clinic_email || 'nuestro email de contacto'}</strong> o al teléfono/WhatsApp <strong>{settings.whatsapp_number || settings.clinic_phone || 'nuestro teléfono habitual'}</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
