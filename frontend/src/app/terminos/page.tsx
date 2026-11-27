'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Scale, FileText, Database, Bot } from 'lucide-react';

export default function TerminosProbookiaPage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans">
      <div className="max-w-4xl mx-auto px-6 py-16 md:py-24 animate-in fade-in duration-700">
        <nav className="mb-10">
          <Link 
            href="/marketing" 
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d4af37] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a ProBookia</span>
          </Link>
        </nav>

        <header className="mb-14 border-b border-stone-200 dark:border-stone-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#b08e23] dark:text-[#d4af37] text-xs font-bold uppercase tracking-widest mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>Marco Contractual B2B</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-black tracking-tight text-stone-950 dark:text-stone-50 mb-3">
            Términos y Condiciones del Servicio
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm md:text-base font-medium">
            Acuerdo de Licencia SaaS, Niveles de Servicio y Contrato de Encargado de Tratamiento (Art. 28 RGPD).
          </p>
          <p className="text-xs text-stone-400 mt-2">Última actualización: Noviembre de 2026</p>
        </header>

        <div className="prose prose-stone dark:prose-invert max-w-none space-y-10 text-stone-600 dark:text-stone-300 leading-relaxed font-normal text-sm md:text-base">
          
          <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h2 className="text-lg md:text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#d4af37]" />
              <span>1. Objeto y Naturaleza del Servicio</span>
            </h2>
            <p>
              El presente contrato regula la prestación de servicios de software como servicio (SaaS) por parte de <strong>ProBookia</strong> a favor de los centros, salones, clínicas estéticas o profesionales autónomos suscritos (en adelante, el &ldquo;Cliente&rdquo; o &ldquo;Tenant&rdquo;).
            </p>
            <p className="mt-3">
              ProBookia proporciona una plataforma integral de gestión clínica, agenda multiespecialista, terminal punto de venta (TPV), firma digital de consentimientos informados, control de fichaje de jornada laboral y portal web de marca blanca de alta gama.
            </p>
          </section>

          <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h2 className="text-lg md:text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
              <span>2. Planes, Suscripción y Facturación</span>
            </h2>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Prueba Gratuita:</strong> ProBookia ofrece un período de prueba sin compromiso de 14 días. Finalizado dicho plazo, el Cliente debe seleccionar un plan de pago para continuar operando en la plataforma.</li>
              <li><strong>Facturación Recurrente:</strong> Las suscripciones se cobran por anticipado de forma mensual o anual mediante tarjeta de crédito a través de la pasarela segura Stripe Billing.</li>
              <li><strong>Cancelación:</strong> El Cliente puede cancelar su suscripción en cualquier momento desde su panel de facturación. El acceso permanecerá activo hasta el último día del ciclo ya abonado. No se realizan devoluciones proporcionales por meses ya devengados.</li>
            </ul>
          </section>

          <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h2 className="text-lg md:text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#d4af37]" />
              <span>3. Acuerdo de Encargado de Tratamiento (Art. 28 RGPD)</span>
            </h2>
            <p className="font-semibold text-stone-800 dark:text-stone-200">
              Cláusula de Delimitación de Responsabilidad de Protección de Datos:
            </p>
            <div className="mt-3 space-y-3 text-xs md:text-sm">
              <p>
                <strong>a) Roles:</strong> El Cliente (la clínica o centro) es el único y exclusivo <strong>Responsable del Tratamiento</strong> de los datos personales (incluidos datos identificativos, citas y datos de salud o alergias) de sus pacientes y empleados. ProBookia actúa únicamente en calidad de <strong>Encargado del Tratamiento</strong> por cuenta y bajo las instrucciones del Cliente.
              </p>
              <p>
                <strong>b) Seguridad y Aislamiento:</strong> ProBookia garantiza el aislamiento estricto de base de datos multi-tenant por ID de tenant, copias de seguridad continuas y cifrado en tránsito (TLS 1.3) y en reposo (AES-256), con servidores e infraestructura localizados en la Unión Europea.
              </p>
              <p>
                <strong>c) Deber de Secreto:</strong> Todo el personal de ProBookia con acceso autorizado a labores de soporte o mantenimiento técnico está sujeto a compromisos formales de confidencialidad y deber de sigilo.
              </p>
              <p>
                <strong>d) Indemnidad:</strong> El Cliente garantiza haber obtenido el consentimiento legal previo de sus pacientes/clientes para el tratamiento de sus datos y mantendrá indemne a ProBookia ante cualquier reclamación o sanción derivada del uso ilícito de datos que efectúe el Cliente.
              </p>
            </div>
          </section>

          <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h2 className="text-lg md:text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#d4af37]" />
              <span>4. Inteligencia Artificial y Descargo Sanitario</span>
            </h2>
            <p>
              Las capacidades de Inteligencia Artificial integradas en ProBookia (Co-Piloto interno, Asistente Concierge 24/7 y generación de imágenes) son herramientas tecnológicas de asistencia y soporte operativo.
            </p>
            <p className="mt-3 bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
              <strong>Aviso Médico Importante:</strong> El Asistente de IA no emite diagnósticos médicos ni prescribe tratamientos farmacológicos. La prescripción, aplicación y evaluación clínica de cualquier tratamiento corresponde en todo momento al especialista sanitario o profesional cualificado del centro.
            </p>
          </section>

          <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h2 className="text-lg md:text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#d4af37]" />
              <span>5. Propiedad Intelectual y Disponibilidad (SLA)</span>
            </h2>
            <p>
              El código fuente, arquitectura, diseño y marcas de ProBookia son propiedad exclusiva de sus titulares. Se otorga al Cliente una licencia de uso temporal, revocable e intransferible durante la vigencia de su suscripción. La titularidad de los datos, archivos e imágenes del centro pertenece en todo momento al Cliente.
            </p>
            <p className="mt-3">
              ProBookia se compromete a mantener un objetivo de disponibilidad del servicio del 99.5%, excluyendo paradas de mantenimiento preventivo notificadas o fallos imputables a redes de telecomunicaciones locales del Cliente.
            </p>
          </section>

        </div>

        <footer className="mt-16 text-center text-xs text-stone-400">
          ProBookia Platform &bull; Soporte y consultas contractuales: <span className="font-semibold text-stone-700 dark:text-stone-300">soporte@probookia.com</span>
        </footer>
      </div>
    </div>
  );
}
