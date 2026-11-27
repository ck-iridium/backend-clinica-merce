"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PrivacidadPage() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/`)
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error("Error fetching settings:", err));
  }, []);

  if (!settings) return <div className="py-20 text-center text-stone-400">Cargando política de privacidad...</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 animate-in fade-in duration-700">
      <nav className="mb-12">
        <Link href="/" className="text-sm font-bold text-[#d4af37] hover:underline flex items-center gap-2">
          ← Volver a la web
        </Link>
      </nav>

      <h1 className="text-4xl md:text-5xl font-black text-stone-800 dark:text-stone-100 mb-12 tracking-tight">Política de Privacidad</h1>

      <div className="prose prose-stone dark:prose-invert max-w-none space-y-8 text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
        <section>
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">1. Responsable del Tratamiento</h2>
          <p>
            <strong>{settings.legal_name || settings.clinic_name}</strong>, con CIF/NIF <strong>{settings.clinic_nif || 'Registrado en el centro'}</strong> y domicilio en <strong>{settings.clinic_address || 'Dirección registrada del centro'}</strong>, como Responsable del Tratamiento, le informa que, de conformidad con lo dispuesto en el Reglamento (UE) 2016/679 (RGPD) y en la Ley Orgánica 3/2018 (LOPDGDD), tratará sus datos personales con absoluta confidencialidad y bajo las medidas de seguridad técnicas y organizativas adecuadas.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">2. Finalidad del Tratamiento</h2>
          <p>
            Sus datos personales serán tratados exclusivamente para las siguientes finalidades legítimas:
          </p>
          <ul className="mt-4 list-disc pl-5 space-y-1.5">
             <li>Gestión operativa, confirmación y recordatorio de citas y reservas en el centro.</li>
             <li>Prestación del servicio de estética, bienestar o salud solicitado y seguimiento de historial o expediente.</li>
             <li>Formalización de consentimientos informados y firma digital previa a tratamientos que lo requieran.</li>
             <li>Emisión de facturas oficiales, cobros en TPV y cumplimiento de obligaciones fiscales y contables obligatorias.</li>
             <li>Atención personalizada de consultas a través de nuestro Asistente Virtual o canales de contacto directo (teléfono y WhatsApp).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">3. Legitimación del Tratamiento</h2>
          <p>
            Las bases jurídicas que legitiman el tratamiento son:
          </p>
          <ul className="mt-4 list-disc pl-5 space-y-1.5">
             <li><strong>Ejecución contractual o precontractual (Art. 6.1.b RGPD):</strong> Gestión de su reserva, atención presencial y cobro del servicio.</li>
             <li><strong>Consentimiento explícito (Art. 6.1.a y Art. 9.2.a RGPD):</strong> Para la recogida de alertas médicas y firma de consentimientos informados específicos.</li>
             <li><strong>Obligación legal (Art. 6.1.c RGPD):</strong> Facturación oficial, conservación de registros contables y tributarios (Ley General Tributaria).</li>
             <li><strong>Interés legítimo (Art. 6.1.f RGPD):</strong> Garantizar la seguridad de las instalaciones y prevención de ausencias injustificadas mediante política de depósitos.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">4. Destinatarios y Encargados del Tratamiento</h2>
          <p>
            Sus datos no serán cedidos a terceros, salvo obligación legal expresa. Para la prestación técnica de este servicio web y de gestión de citas, el centro utiliza los servicios de proveedores tecnológicos que actúan como <strong>Encargados del Tratamiento</strong> bajo estricto contrato de confidencialidad conforme al artículo 28 del RGPD:
          </p>
          <ul className="mt-4 list-disc pl-5 space-y-1.5">
            <li><strong>ProBookia SaaS:</strong> Proveedor de la plataforma de software, infraestructura y base de datos con servidores alojados en la Unión Europea.</li>
            <li><strong>Stripe Payments Europe, Ltd.:</strong> Pasarela segura para la tramitación de fianzas y pagos con certificación PCI-DSS.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">5. Conservación de los Datos</h2>
          <p>
            Los datos se conservarán durante el tiempo estrictamente necesario para cumplir con la finalidad para la que fueron recabados y mientras se mantenga la relación asistencial o comercial. Una vez finalizada, se conservarán debidamente bloqueados durante los plazos legalmente exigidos para la prescripción de responsabilidades tributarias o sanitarias.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">6. Ejercicio de Derechos y Reclamación</h2>
          <p>
            Usted puede ejercitar en cualquier momento sus derechos de <strong>Acceso, Rectificación, Supresión, Limitación del tratamiento, Portabilidad y Oposición</strong> enviando una solicitud por escrito, acompañada de fotocopia de su DNI o documento equivalente, al email <strong>{settings.clinic_email || 'nuestro email de atención'}</strong> o a nuestra dirección postal en <strong>{settings.clinic_address || 'nuestro domicilio social'}</strong>.
          </p>
          <p className="mt-3">
            Asimismo, le informamos de que tiene derecho a presentar una reclamación ante la autoridad de control competente, la <strong>Agencia Española de Protección de Datos (AEPD)</strong> en <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-[#d4af37] underline font-bold">www.aepd.es</a>, si considera que el tratamiento no se ajusta a la normativa vigente.
          </p>
        </section>
      </div>
    </div>
  );
}
