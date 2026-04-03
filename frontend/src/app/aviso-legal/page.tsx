"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AvisoLegalPage() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/`)
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error("Error fetching settings:", err));
  }, []);

  if (!settings) return <div className="py-20 text-center text-stone-400">Cargando información legal...</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 animate-in fade-in duration-700">
      <nav className="mb-12">
        <Link href="/" className="text-sm font-bold text-[#d9777f] hover:underline flex items-center gap-2">
          ← Volver a la web
        </Link>
      </nav>

      <h1 className="text-4xl md:text-5xl font-black text-stone-800 mb-12 tracking-tight">Aviso Legal</h1>

      <div className="prose prose-stone max-w-none space-y-8 text-stone-600 leading-relaxed font-medium">
        <section>
          <h2 className="text-xl font-bold text-stone-800 mb-4 uppercase tracking-wider text-sm">1. Información del Titular</h2>
          <p>
            En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSICE), se exponen los siguientes datos identificativos del titular de este sitio web:
          </p>
          <ul className="mt-4 space-y-2 list-none p-0">
            <li><strong>Titular:</strong> {settings.legal_name || settings.clinic_name}</li>
            <li><strong>CIF/NIF:</strong> {settings.clinic_nif}</li>
            <li><strong>Domicilio:</strong> {settings.clinic_address}</li>
            <li><strong>Email:</strong> {settings.clinic_email}</li>
            <li><strong>Teléfono/WhatsApp:</strong> {settings.whatsapp_number || settings.clinic_phone}</li>
            {settings.sanitary_register && (
              <li><strong>Nº Registro Sanitario:</strong> {settings.sanitary_register}</li>
            )}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-800 mb-4 uppercase tracking-wider text-sm">2. Propiedad Intelectual</h2>
          <p>
            El código fuente, los diseños gráficos, las imágenes, las fotografías, los sonidos, las animaciones, el software, los textos, así como la información y los contenidos que se recogen en el presente sitio web están protegidos por la legislación española sobre los derechos de propiedad intelectual e industrial a favor de <strong>{settings.clinic_name}</strong>. No se permite la reproducción y/o publicación, total o parcial, del sitio web, ni su tratamiento informático, su distribución, su difusión, ni su modificación o transformación, sin el permiso previo y por escrito de su titular.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-800 mb-4 uppercase tracking-wider text-sm">3. Protección de Datos de Carácter Personal</h2>
          <p>
            Puede consultar toda la información relativa al tratamiento de sus datos personales accediendo a nuestra <Link href="/privacidad" className="text-[#d9777f] font-bold underline">Política de Privacidad</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-800 mb-4 uppercase tracking-wider text-sm">4. Legislación Aplicable</h2>
          <p>
            Con carácter general las relaciones entre <strong>{settings.clinic_name}</strong> con los usuarios de sus servicios telemáticos, presentes en esta web, se encuentran sometidas a la legislación y jurisdicción españolas.
          </p>
        </section>
      </div>
    </div>
  );
}
