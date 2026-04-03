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
        <Link href="/" className="text-sm font-bold text-[#d9777f] hover:underline flex items-center gap-2">
          ← Volver a la web
        </Link>
      </nav>

      <h1 className="text-4xl md:text-5xl font-black text-stone-800 mb-12 tracking-tight">Política de Privacidad</h1>

      <div className="prose prose-stone max-w-none space-y-8 text-stone-600 leading-relaxed font-medium">
        <section>
          <h2 className="text-xl font-bold text-stone-800 mb-4 uppercase tracking-wider text-sm">1. Información al Usuario</h2>
          <p>
            <strong>{settings.legal_name || settings.clinic_name}</strong>, como Responsable del Tratamiento, le informa que, según lo dispuesto en el Reglamento (UE) 2016/679 (RGPD) y en la L.O. 3/2018 (LOPDGDD), trataremos sus datos tal y como reflejamos en la presente Política de Privacidad.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-800 mb-4 uppercase tracking-wider text-sm">2. Finalidad del Tratamiento</h2>
          <p>
            Tratamos sus datos personales para las siguientes finalidades:
          </p>
          <ul className="mt-4 list-disc pl-5">
             <li>Gestión de la reserva de citas y prestación de servicios de estética.</li>
             <li>Envío de comunicaciones informativas relacionadas con su cita.</li>
             <li>Cumplimiento de obligaciones legales y fiscales (facturación).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-800 mb-4 uppercase tracking-wider text-sm">3. Legitimación del Tratamiento</h2>
          <p>
            La base legal para el tratamiento de sus datos es:
          </p>
          <ul className="mt-4 list-disc pl-5">
             <li>Ejecución de un contrato o precontrato (reserva de cita).</li>
             <li>Consentimiento del interesado para el envío de información corporativa.</li>
             <li>Interés legítimo del responsable.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-800 mb-4 uppercase tracking-wider text-sm">4. Conservación de los Datos</h2>
          <p>
            Se conservarán durante no más tiempo del necesario para mantener el fin del tratamiento o mientras existan prescripciones legales que dictaminen su custodia.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-800 mb-4 uppercase tracking-wider text-sm">5. Derechos del Usuario</h2>
          <p>
            El usuario tiene derecho a acceder, rectificar y suprimir los datos, así como otros derechos explicados en la información adicional. Para ejercer sus derechos, puede contactar con nosotros en: <strong>{settings.clinic_email}</strong> o en nuestro domicilio en <strong>{settings.clinic_address}</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
