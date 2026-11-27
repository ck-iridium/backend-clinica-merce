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

export default function PrivacidadPage() {
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
    return <div className="py-24 text-center text-stone-400 font-sans">Cargando política de privacidad...</div>;
  }

  // VISTA A: POLÍTICA DE PRIVACIDAD CORPORATIVA DE PROBOOKIA (probookia.com)
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
            Reglamento General de Protección de Datos (RGPD)
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-stone-900 dark:text-stone-100 mt-4 tracking-tight">
            Política de Privacidad
          </h1>
          <p className="text-sm text-stone-500 mt-2">
            Tratamiento de datos personales en la plataforma tecnológica <strong>ProBookia</strong>.
          </p>
        </header>

        <div className="prose prose-stone dark:prose-invert max-w-none space-y-8 text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
          <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
              1. Responsable del Tratamiento
            </h2>
            <p>
              De conformidad con el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), se informa de que el Responsable del Tratamiento de los datos recabados en este sitio web es:
            </p>
            <ul className="mt-4 space-y-2 list-none p-0 text-sm">
              <li><strong>Titular Responsable:</strong> Juan Antonio Bares Dorado</li>
              <li><strong>NIF / DNI:</strong> 53329921-M</li>
              <li><strong>Domicilio de Contacto:</strong> 46291 Benimodo, Valencia (España)</li>
              <li><strong>Canal Oficial de Privacidad y DPO:</strong> <a href="mailto:contacto@probookia.com" className="text-[#d4af37] font-semibold underline">contacto@probookia.com</a> / <a href="mailto:legal@probookia.com" className="text-[#d4af37] font-semibold underline">legal@probookia.com</a></li>
            </ul>
          </section>

          <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
              2. Finalidades y Bases Jurídicas del Tratamiento
            </h2>
            <p>Sus datos personales se recaban y tratan para las siguientes finalidades legítimas:</p>
            <ul className="mt-4 list-disc pl-5 space-y-2 text-sm">
              <li>
                <strong>Gestión de solicitudes de información y demostraciones:</strong> Atender consultas sobre la plataforma ProBookia remitidas a través de formularios o WhatsApp (Base jurídica: consentimiento del interesado, Art. 6.1.a RGPD).
              </li>
              <li>
                <strong>Gestión de cuentas en fase de evaluación y prueba gratuita (14 días):</strong> Crear el entorno de trabajo, aprovisionar el subdominio del centro y prestar soporte técnico inicial (Base jurídica: aplicación de medidas precontractuales, Art. 6.1.b RGPD).
              </li>
              <li>
                <strong>Facturación y gestión de suscripciones:</strong> Tramitar el cobro de planes de suscripción mensual o anual mediante la pasarela segura Stripe Billing una vez formalizada la contratación (Base jurídica: ejecución contractual, Art. 6.1.b RGPD).
              </li>
              <li>
                <strong>Mantenimiento de la seguridad y prevención de fraudes:</strong> Supervisar la integridad técnica del software, registros de acceso y prevención de ataques (Base jurídica: interés legítimo de seguridad, Art. 6.1.f RGPD).
              </li>
            </ul>
          </section>

          <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
              3. Delimitación de Responsabilidad (Art. 28 RGPD: Encargado del Tratamiento)
            </h2>
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300 space-y-2">
              <p>
                <strong>Diferenciación esencial:</strong> Respecto a los datos personales (incluyendo datos de salud, citas, historiales médicos y cobros) que cada centro o clínica cliente introduce en su respectivo espacio o tenant de ProBookia:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>El centro cliente es el <strong>único y exclusivo Responsable del Tratamiento</strong> frente a sus pacientes y usuarios.</li>
                <li><strong>ProBookia actúa estrictamente en calidad de Encargado del Tratamiento</strong> (Art. 28 RGPD), limitándose a almacenar y procesar técnicamente dicha información bajo estricto secreto profesional y sin utilizar jamás los datos de los pacientes para fines propios o cesión a terceros.</li>
              </ul>
            </div>
          </section>

          <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
              4. Destinatarios de los Datos y Transferencias
            </h2>
            <p>
              No se cederán datos a terceros salvo obligación legal expresa. Para la prestación tecnológica se utilizan proveedores de servicios que operan como subencargados del tratamiento bajo acuerdos conformes al RGPD:
            </p>
            <ul className="mt-4 list-disc pl-5 space-y-1.5 text-sm">
              <li><strong>Infraestructura en la nube y base de datos:</strong> Proveedores con servidores ubicados en la Unión Europea dotados de cifrado en reposo (AES-256) y en tránsito (TLS 1.3).</li>
              <li><strong>Stripe Payments Europe, Ltd.:</strong> Pasarela de pago con certificación bancaria PCI-DSS Nivel 1 para la gestión de cobros y facturación.</li>
            </ul>
          </section>

          <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
              5. Derechos de los Interesados (ARCO+)
            </h2>
            <p>
              En cualquier momento puede ejercer sus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad dirigiendo un correo electrónico a <strong>contacto@probookia.com</strong> indicando como referencia &ldquo;Protección de Datos&rdquo; y acompañando copia de su documento de identidad. Asimismo, tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-[#d4af37] underline">www.aepd.es</a>).
            </p>
          </section>
        </div>
      </div>
    );
  }

  // VISTA B: POLÍTICA DE PRIVACIDAD DEL CENTRO / CLÍNICA (subdominio del tenant)
  const clinicName = settings?.clinic_name || 'Establecimiento Colaborador';
  const legalName = settings?.legal_name || clinicName;
  const clinicNif = settings?.clinic_nif || 'Disponible en el establecimiento físico o bajo solicitud';
  const clinicAddress = settings?.clinic_address || 'Dirección registrada del centro';

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 animate-in fade-in duration-700 font-sans">
      <nav className="mb-12">
        <Link href="/" className="text-sm font-bold text-[#d4af37] hover:underline flex items-center gap-2">
          ← Volver a la web
        </Link>
      </nav>

      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-black text-stone-900 dark:text-stone-100 mb-2 tracking-tight">
          Política de Privacidad
        </h1>
        <p className="text-sm text-stone-500">
          Información sobre el tratamiento de datos de clientes y pacientes en <strong>{clinicName}</strong>.
        </p>
      </header>

      <div className="prose prose-stone dark:prose-invert max-w-none space-y-8 text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
        <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
            1. Responsable del Tratamiento
          </h2>
          <p>
            <strong>{legalName}</strong>, con CIF/NIF <strong>{clinicNif}</strong> y domicilio en <strong>{clinicAddress}</strong>, como Responsable del Tratamiento, le informa de que, de conformidad con el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), tratará sus datos personales con absoluta confidencialidad y bajo las medidas de seguridad técnicas y organizativas adecuadas.
          </p>
        </section>

        <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
            2. Finalidad del Tratamiento
          </h2>
          <p>Sus datos personales serán tratados exclusivamente para las siguientes finalidades legítimas:</p>
          <ul className="mt-4 list-disc pl-5 space-y-1.5 text-sm">
            <li>Gestión operativa, confirmación y recordatorio de citas y reservas en el centro.</li>
            <li>Prestación del servicio de estética, bienestar o salud solicitado y seguimiento de historial o expediente.</li>
            <li>Formalización de consentimientos informados y firma digital previa a tratamientos que lo requieran.</li>
            <li>Emisión de facturas oficiales, cobros en TPV y cumplimiento de obligaciones fiscales y contables obligatorias.</li>
            <li>Atención personalizada de consultas a través de nuestro Asistente Virtual o canales de contacto directo (teléfono y WhatsApp).</li>
          </ul>
        </section>

        <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
            3. Legitimación del Tratamiento
          </h2>
          <p>Las bases jurídicas que legitiman el tratamiento son:</p>
          <ul className="mt-4 list-disc pl-5 space-y-1.5 text-sm">
            <li><strong>Ejecución contractual o precontractual (Art. 6.1.b RGPD):</strong> Gestión de su reserva, atención presencial y cobro del servicio.</li>
            <li><strong>Consentimiento explícito (Art. 6.1.a y Art. 9.2.a RGPD):</strong> Para la recogida de alertas médicas y firma de consentimientos informados específicos.</li>
            <li><strong>Obligación legal (Art. 6.1.c RGPD):</strong> Facturación oficial y conservación de registros contables y tributarios.</li>
            <li><strong>Interés legítimo (Art. 6.1.f RGPD):</strong> Garantizar la seguridad de las instalaciones y prevención de ausencias injustificadas mediante política de depósitos de reserva.</li>
          </ul>
        </section>

        <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
            4. Destinatarios y Encargados del Tratamiento
          </h2>
          <p>
            Sus datos no serán cedidos a terceros, salvo obligación legal expresa. Para la prestación técnica de este servicio web y de gestión de citas, el centro utiliza los servicios de proveedores tecnológicos que actúan como <strong>Encargados del Tratamiento</strong> bajo estricto contrato de confidencialidad conforme al artículo 28 del RGPD:
          </p>
          <ul className="mt-4 list-disc pl-5 space-y-1.5 text-sm">
            <li><strong>ProBookia SaaS:</strong> Proveedor de la plataforma de software, infraestructura y base de datos con servidores alojados en la Unión Europea.</li>
            <li><strong>Stripe Payments Europe, Ltd.:</strong> Pasarela segura para la tramitación de fianzas y pagos con certificación PCI-DSS.</li>
          </ul>
        </section>

        <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
            5. Derechos de los Usuarios
          </h2>
          <p>
            Puede ejercer sus derechos de acceso, rectificación, supresión y oposición poniéndose en contacto directamente con el centro en <strong>{settings?.clinic_email || 'nuestro email de contacto'}</strong> o acudiendo presencialmente a nuestras instalaciones.
          </p>
        </section>
      </div>
    </div>
  );
}
