"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

function isRootDomain(): boolean {
  if (typeof window === 'undefined') return true;
  const hostname = window.location.hostname.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  
  // Si explícitamente se especifica un tenant en la URL, no es el root corporativo
  if (searchParams.has('tenant') || searchParams.has('tenant_id')) return false;
  
  // Dominios corporativos de ProBookia
  if (hostname === 'probookia.com' || hostname === 'www.probookia.com') return true;
  
  // Entorno de desarrollo local sin subdominio
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
  
  // Subdominios de probookia (ej. style-stella.probookia.com o merce.probookia.com)
  if (hostname.endsWith('.probookia.com') && hostname !== 'www.probookia.com') return false;
  
  // Subdominios locales (ej. merce.localhost)
  if (hostname.endsWith('.localhost')) return false;
  
  // Dominios personalizados asignados a clínicas
  return false;
}

export default function AvisoLegalPage() {
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
    return <div className="py-24 text-center text-stone-400 font-sans">Cargando información legal...</div>;
  }

  // VISTA A: AVISO LEGAL CORPORATIVO DE PROBOOKIA (probookia.com)
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
            LSSI-CE y Régimen de Información General
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-stone-900 dark:text-stone-100 mt-4 tracking-tight">
            Aviso Legal
          </h1>
          <p className="text-sm text-stone-500 mt-2">
            Información identificativa del titular de la plataforma tecnológica <strong>ProBookia</strong>.
          </p>
        </header>

        <div className="prose prose-stone dark:prose-invert max-w-none space-y-8 text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
          <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
              1. Datos Identificativos del Titular
            </h2>
            <p>
              En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se hace constar que el titular y prestador de servicios del sitio web <strong>probookia.com</strong> es:
            </p>
            <ul className="mt-4 space-y-2 list-none p-0 text-sm">
              <li><strong>Titular Responsable:</strong> Juan Antonio Bares Dorado</li>
              <li><strong>NIF / DNI:</strong> 53329921-M</li>
              <li><strong>Domicilio a efectos de contacto:</strong> 46291 Benimodo, Valencia (España)</li>
              <li><strong>Correo Electrónico de Contacto:</strong> <a href="mailto:contacto@probookia.com" className="text-[#d4af37] font-semibold underline">contacto@probookia.com</a></li>
              <li><strong>Canal de Consultas Legales:</strong> <a href="mailto:legal@probookia.com" className="text-[#d4af37] font-semibold underline">legal@probookia.com</a></li>
              <li><strong>Actividad:</strong> Desarrollo y explotación de soluciones de software como servicio (SaaS) y plataformas digitales de gestión para centros de estética, peluquería, bienestar y clínicas.</li>
            </ul>
          </section>

          <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
              2. Objeto del Sitio Web y Estado del Servicio
            </h2>
            <p>
              El sitio web <strong>probookia.com</strong> tiene por objeto la difusión comercial, presentación de funcionalidades y acceso a la plataforma de gestión SaaS ProBookia, incluyendo agenda multiespecialista, terminal de venta (TPV), firma biométrica y portales web de reservas.
            </p>
            <div className="mt-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200">
              <strong>Fase de Lanzamiento y Evaluación Piloto:</strong> La plataforma se encuentra disponible en modalidad de acceso anticipado con períodos de prueba gratuita (14 días) y plazas piloto para centros seleccionados. La facturación recurrente de suscripciones comerciales queda sujeta a la posterior formalización de cada contrato de suscripción.
            </div>
          </section>

          <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
              3. Propiedad Intelectual e Industrial
            </h2>
            <p>
              Todos los elementos que forman el sitio web y la plataforma de software (incluyendo, de manera enunciativa pero no limitativa, el código fuente, la arquitectura de base de datos multi-tenant, logotipos, diseños gráficos, interfaces visuales, componentes de inteligencia artificial y textos explicativos) son propiedad exclusiva de <strong>Juan Antonio Bares Dorado</strong> o cuentan con la debida autorización de terceros licenciantes.
            </p>
            <p className="mt-3">
              Queda expresamente prohibida la reproducción, duplicación, distribución, ingeniería inversa, descompilación o comunicación pública, total o parcial, con fines comerciales o de lucro ajeno sin la autorización previa y por escrito de su titular.
            </p>
          </section>

          <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
              4. Condiciones de Uso y Exención de Responsabilidad
            </h2>
            <p>
              El usuario se compromete a realizar un uso lícito y adecuado de los contenidos y servicios disponibles en el portal. ProBookia no se responsabiliza de los daños o perjuicios que pudieran derivarse de interferencias, caídas o averías en las redes de telecomunicaciones, ataques informáticos o fallos en proveedores de infraestructura tecnológica ajenos a su control razonable.
            </p>
          </section>

          <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
              5. Legislación Aplicable y Jurisdicción
            </h2>
            <p>
              Para la resolución de cuantas discrepancias pudieran suscitarse con ocasión de la interpretación o ejecución del presente Aviso Legal o de los servicios prestados, ambas partes se someten a la legislación española y, para relaciones mercantiles B2B, a los Juzgados y Tribunales de la ciudad de <strong>Valencia</strong>, con renuncia a cualquier otro fuero que pudiera corresponderles.
            </p>
          </section>
        </div>
      </div>
    );
  }

  // VISTA B: AVISO LEGAL DEL CENTRO O CLÍNICA CLIENTE (subdominio del tenant)
  const clinicName = settings?.clinic_name || 'Establecimiento Colaborador';
  const legalName = settings?.legal_name || clinicName;
  const clinicNif = settings?.clinic_nif || 'Disponible para consulta presencial en el establecimiento o previa solicitud telemática';
  const clinicAddress = settings?.clinic_address || 'Consulte la dirección de atención al público en nuestro establecimiento';
  const clinicEmail = settings?.clinic_email || 'Email de atención del centro';
  const clinicPhone = settings?.whatsapp_number || settings?.clinic_phone || 'Teléfono del centro';

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 animate-in fade-in duration-700 font-sans">
      <nav className="mb-12">
        <Link href="/" className="text-sm font-bold text-[#d4af37] hover:underline flex items-center gap-2">
          ← Volver a la web
        </Link>
      </nav>

      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-black text-stone-900 dark:text-stone-100 mb-2 tracking-tight">
          Aviso Legal
        </h1>
        <p className="text-sm text-stone-500">
          Información general de conformidad con el Art. 10 de la Ley 34/2002 (LSSI-CE).
        </p>
      </header>

      {(!settings?.clinic_nif || !settings?.clinic_address) && (
        <div className="mb-8 p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300">
          <strong>Aviso informativo:</strong> Los datos registrales y fiscales definitivos de este centro se encuentran en proceso de actualización formal por el titular del establecimiento.
        </div>
      )}

      <div className="prose prose-stone dark:prose-invert max-w-none space-y-8 text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
        <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
            1. Información del Titular del Centro
          </h2>
          <p>
            En cumplimiento del artículo 10 de la Ley 34/2002 (LSSI-CE), se exponen los siguientes datos identificativos del titular de este establecimiento:
          </p>
          <ul className="mt-4 space-y-2 list-none p-0 text-sm">
            <li><strong>Titular del Establecimiento:</strong> {legalName}</li>
            <li><strong>CIF / NIF:</strong> {clinicNif}</li>
            <li><strong>Domicilio Social:</strong> {clinicAddress}</li>
            <li><strong>Email de Contacto:</strong> {clinicEmail}</li>
            <li><strong>Teléfono / WhatsApp:</strong> {clinicPhone}</li>
            {settings?.sanitary_register && (
              <li><strong>Nº Registro Sanitario:</strong> {settings.sanitary_register}</li>
            )}
          </ul>
        </section>

        <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
            2. Propiedad Intelectual de Contenidos y Tecnología
          </h2>
          <p>
            Los signos distintivos, logotipos, imágenes fotográficas de tratamientos y textos descriptivos publicados en este portal pertenecen a <strong>{clinicName}</strong> o a sus respectivos licenciantes.
          </p>
          <p className="mt-3">
            La infraestructura tecnológica, software de gestión de citas, terminal de cobro y arquitectura digital del portal de reservas son provistos bajo licencia de uso tecnológico por la plataforma <strong>ProBookia SaaS</strong>, siendo su código, diseño y algoritmos propiedad exclusiva de sus respectivos desarrolladores.
          </p>
        </section>

        <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
            3. Protección de Datos Personales
          </h2>
          <p>
            Para consultar el tratamiento detallado de sus datos personales, finalidades y el ejercicio de sus derechos de privacidad, acceda a nuestra <Link href="/privacidad" className="text-[#d4af37] font-semibold underline">Política de Privacidad</Link>.
          </p>
        </section>

        <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wider text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
            4. Legislación Aplicable
          </h2>
          <p>
            Las relaciones entre <strong>{clinicName}</strong> y los usuarios de sus servicios presentes en esta web se rigen por la legislación y jurisdicción españolas.
          </p>
        </section>
      </div>
    </div>
  );
}
