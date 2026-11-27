'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Scale, FileText, Database, Bot, AlertTriangle, Clock, RefreshCw } from 'lucide-react';

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
            <span>Marco Contractual B2B &bull; SaaS</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-black tracking-tight text-stone-950 dark:text-stone-50 mb-3">
            Términos y Condiciones del Servicio
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm md:text-base font-medium">
            Acuerdo de Licencia SaaS, Niveles de Servicio, Limitación de Responsabilidad y Encargado de Tratamiento (Art. 28 RGPD).
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-stone-400">
            <span>Titular: <strong>Juan Antonio Bares Dorado (DNI 53329921-M)</strong></span>
            <span>&bull;</span>
            <span>Ubicación: <strong>Benimodo, Valencia (España)</strong></span>
            <span>&bull;</span>
            <span>Contacto: <strong>contacto@probookia.com</strong></span>
          </div>
        </header>

        <div className="space-y-8 text-stone-600 dark:text-stone-300 leading-relaxed font-normal text-sm md:text-base">
          
          {/* 1. Objeto y Licencia */}
          <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h2 className="text-lg md:text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#d4af37]" />
              <span>1. Objeto y Concesión de Licencia de Uso</span>
            </h2>
            <p>
              El presente contrato regula la prestación de servicios de software como servicio (SaaS) por parte de <strong>ProBookia</strong> (titularidad de Juan Antonio Bares Dorado) a favor de los centros, salones, clínicas estéticas o profesionales autónomos suscritos (en adelante, el &ldquo;Cliente&rdquo; o &ldquo;Tenant&rdquo;).
            </p>
            <p className="mt-3">
              ProBookia concede al Cliente una licencia de uso temporal, no exclusiva, revocable e intransferible para acceder y operar la plataforma de gestión en la nube (agenda multiespecialista, TPV, consentimientos informados, control de fichaje y portal web de reservas).
            </p>
            <p className="mt-2 text-xs text-stone-500">
              Queda expresamente prohibida la descompilación, ingeniería inversa, sublicencia, reventa o copia de la arquitectura o código del software.
            </p>
          </section>

          {/* 2. Pruebas y Facturación */}
          <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h2 className="text-lg md:text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#d4af37]" />
              <span>2. Período de Prueba, Plazas Piloto y Facturación</span>
            </h2>
            <ul className="list-disc pl-5 space-y-2 mt-3 text-sm">
              <li>
                <strong>Fase de Lanzamiento y Prueba Gratuita (14 días):</strong> ProBookia ofrece un período de prueba sin coste y sin compromiso de permanencia. Igualmente, ProBookia podrá asignar plazas piloto de acceso anticipado con condiciones especiales de evaluación.
              </li>
              <li>
                <strong>Facturación Recurrente:</strong> Una vez finalizado el período de prueba o plaza piloto, la continuidad del servicio requiere la suscripción a uno de los planes comerciales oficiales (Individual, Pro o Élite), facturados por anticipado de forma mensual o anual a través de la pasarela segura Stripe Billing.
              </li>
              <li>
                <strong>Cancelación Voluntaria:</strong> El Cliente puede cancelar su suscripción en cualquier momento desde su panel de facturación. El acceso se mantendrá operativo hasta el último día del ciclo ya abonado. No se emitirán reembolsos parciales por períodos mensuales ya devengados.
              </li>
            </ul>
          </section>

          {/* 3. Modificación de Tarifas */}
          <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h2 className="text-lg md:text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-[#d4af37]" />
              <span>3. Facultad de Modificación de Precios y Condiciones</span>
            </h2>
            <p>
              ProBookia se reserva el derecho de actualizar, modificar o adaptar las tarifas de suscripción, modalidades de planes y características del software cuando lo estime oportuno para garantizar la evolución tecnológica y sostenibilidad de la plataforma.
            </p>
            <div className="mt-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300">
              <strong>Procedimiento de Preaviso de 30 Días:</strong> Cualquier modificación de precio será comunicada al Cliente con un mínimo de <strong>30 días naturales de antelación</strong> mediante correo electrónico o notificación destacada en el panel de control. Si el Cliente no estuviese conforme con la nueva tarifa, podrá cancelar su suscripción sin penalización alguna antes de la fecha de entrada en vigor. La continuación en el uso del servicio una vez transcurrido el plazo constituirá la aceptación íntegra de las nuevas condiciones económicas.
            </div>
          </section>

          {/* 4. Límite de Responsabilidad */}
          <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h2 className="text-lg md:text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>4. Limitación de Responsabilidad y Exclusión de Lucro Cesante</span>
            </h2>
            <div className="space-y-3 text-sm">
              <p>
                <strong>Tope Máximo Indemnizatorio:</strong> En la máxima medida permitida por la legislación aplicable, la responsabilidad económica total y agregada de ProBookia frente al Cliente por cualquier concepto derivado de este contrato, fallos técnicos o interrupciones del servicio estará expresamente limitada al <strong>importe total efectivamente abonado por el Cliente en concepto de cuotas de suscripción durante los últimos tres (3) meses anteriores al hecho causante</strong>.
              </p>
              <p className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200">
                <strong>Exclusión de Daños Indirectos y Pérdida de Ingresos:</strong> ProBookia no responderá bajo ninguna circunstancia por daños indirectos, lucro cesante, pérdidas comerciales, pérdida de ingresos por citas no celebradas, interrupción de la actividad del establecimiento o daños a la reputación comercial del Cliente.
              </p>
            </div>
          </section>

          {/* 5. SLA y Terceros */}
          <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h2 className="text-lg md:text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
              <span>5. Nivel de Servicio (SLA) e Infraestructura de Terceros</span>
            </h2>
            <p className="text-sm">
              ProBookia opera con estándares de alta disponibilidad y tiene como objetivo un SLA del 99,5% anual. No obstante, el servicio se provee &ldquo;tal cual&rdquo; (<em>as is</em>).
            </p>
            <p className="mt-2 text-sm">
              ProBookia queda totalmente exonerada de responsabilidad ante indisponibilidades originadas por:
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-xs text-stone-500 dark:text-stone-400">
              <li>Caídas, mantenimientos o incidencias en proveedores de nube e infraestructura (como Vercel, Supabase, Amazon Web Services o Google Cloud).</li>
              <li>Averías o caídas en la pasarela externa de pagos Stripe.</li>
              <li>Cortes en el suministro eléctrico o en las conexiones de telecomunicaciones de los dispositivos del Cliente.</li>
              <li>Paradas programadas de mantenimiento técnico preventivo debidamente notificadas.</li>
            </ul>
          </section>

          {/* 6. RGPD Art. 28 */}
          <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h2 className="text-lg md:text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#d4af37]" />
              <span>6. Contrato de Encargado de Tratamiento (Art. 28 RGPD)</span>
            </h2>
            <div className="space-y-3 text-xs md:text-sm">
              <p>
                <strong>a) Propiedad de los Datos:</strong> Todos los datos de pacientes, clientes, historiales, fotografías y agendas introducidos por el Cliente en su tenant son de su exclusiva propiedad. ProBookia no adquiere derecho alguno sobre los mismos ni los comercializará bajo ningún concepto.
              </p>
              <p>
                <strong>b) Distribución de Roles:</strong> El Cliente actúa como único <strong>Responsable del Tratamiento</strong> de los datos de sus pacientes y empleados. ProBookia actúa únicamente en calidad de <strong>Encargado del Tratamiento</strong> técnico, aplicando medidas de cifrado (TLS 1.3 / AES-256) y aislamiento estricto multi-tenant con servidores en la Unión Europea.
              </p>
              <p>
                <strong>c) Cláusula de Indemnidad:</strong> El Cliente garantiza contar con el consentimiento previo o base legítima de sus pacientes para registrar sus datos y formalizar consentimientos. El Cliente mantendrá indemne a ProBookia frente a cualquier sanción, multa o reclamación de la Agencia Española de Protección de Datos (AEPD) o de terceros derivada del tratamiento ilícito de datos efectuado por el Cliente.
              </p>
            </div>
          </section>

          {/* 7. Asistente IA */}
          <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h2 className="text-lg md:text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#d4af37]" />
              <span>7. Asistente Virtual IA y Descargo de Responsabilidad Médica</span>
            </h2>
            <p className="text-sm">
              Las funciones basadas en Inteligencia Artificial (Co-Piloto, Asistente Concierge 24/7 y generación de imágenes) son herramientas tecnológicas de asistencia administrativa y operativa.
            </p>
            <div className="mt-3 bg-stone-50 dark:bg-stone-800/50 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 text-xs">
              <strong>Descargo Sanitario:</strong> Ninguna respuesta, cálculo o sugerencia emitida por la IA constituye diagnóstico médico ni prescripción facultativa. La evaluación clínica, idoneidad de tratamientos y pautas higiénico-sanitarias corresponden en exclusiva a los profesionales debidamente titulados del centro.
            </div>
          </section>

          {/* 8. Suspensión y Baja */}
          <section className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h2 className="text-lg md:text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#d4af37]" />
              <span>8. Suspensión por Impago, Portabilidad y Fuero Jurisdiccional</span>
            </h2>
            <div className="space-y-3 text-sm">
              <p>
                <strong>Suspensión por Impago o Abuso:</strong> Si la cuota de suscripción es rechazada en Stripe, se concederá un período de gracia de siete (7) días naturales. Transcurrido dicho plazo sin regularización, ProBookia suspenderá el acceso a la plataforma. Igualmente, ProBookia podrá cancelar de forma inmediata cualquier cuenta que incurra en actividades fraudulentas o ataques al sistema.
              </p>
              <p>
                <strong>Portabilidad de Datos:</strong> En caso de baja, el Cliente tiene derecho a exportar su base de datos de clientes, citas e historiales en formatos estándar (CSV/JSON). Transcurridos 60 días desde la baja definitiva, ProBookia procederá al borrado seguro de la información residual del tenant.
              </p>
              <p>
                <strong>Legislación y Jurisdicción:</strong> Este contrato se rige íntegramente por la legislación española. Para dirimir cualquier controversia entre las partes (relación mercantil B2B), ambas partes renuncian a su propio fuero y acuerdan someterse a los <strong>Juzgados y Tribunales de la ciudad de Valencia (España)</strong>.
              </p>
            </div>
          </section>

        </div>

        <footer className="mt-16 text-center text-xs text-stone-400">
          ProBookia Platform &bull; Soporte y consultas contractuales: <span className="font-semibold text-stone-700 dark:text-stone-300">contacto@probookia.com</span>
        </footer>
      </div>
    </div>
  );
}
