"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookiesPage() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/`)
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error("Error fetching settings:", err));
  }, []);

  if (!settings) return <div className="py-20 text-center text-stone-400">Cargando política de cookies...</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 animate-in fade-in duration-700">
      <nav className="mb-12">
        <Link href="/" className="text-sm font-bold text-[#d9777f] hover:underline flex items-center gap-2">
          ← Volver a la web
        </Link>
      </nav>

      <h1 className="text-4xl md:text-5xl font-black text-stone-800 mb-12 tracking-tight">Política de Cookies</h1>

      <div className="prose prose-stone max-w-none space-y-8 text-stone-600 leading-relaxed font-medium">
        <section>
          <h2 className="text-xl font-bold text-stone-800 mb-4 uppercase tracking-wider text-sm">1. ¿Qué son las Cookies?</h2>
          <p>
            Una cookie es un fichero que se descarga en su ordenador al acceder a determinadas páginas web. Las cookies permiten a una página web, entre otras cosas, almacenar y recuperar información sobre los hábitos de navegación de un usuario o de su equipo y, dependiendo de la información que contengan y de la forma en que utilice su equipo, pueden utilizarse para reconocer al usuario.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-800 mb-4 uppercase tracking-wider text-sm">2. ¿Qué tipos de cookies utiliza esta web?</h2>
          <p>
            Esta página web utiliza los siguientes tipos de cookies:
          </p>
          <ul className="mt-4 list-disc pl-5">
             <li><strong>Cookies Técnicas:</strong> Son aquellas que permiten al usuario la navegación a través de una página web, plataforma o aplicación y la utilización de las diferentes opciones o servicios que en ella existan.</li>
             <li><strong>Cookies de Análisis:</strong> Son aquellas que bien tratadas por nosotros o por terceros, nos permiten cuantificar el número de usuarios y así realizar la medición y análisis estadístico de la utilización que hacen los usuarios del servicio ofertado.</li>
             <li><strong>Cookies de Personalización:</strong> Son aquellas que permiten al usuario acceder al servicio con algunas características de carácter general predefinidas en función de una serie de criterios en el terminal del usuario (como el consentimiento de cookies guardado en `localStorage`).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-800 mb-4 uppercase tracking-wider text-sm">3. Revocación y Eliminación de Cookies</h2>
          <p>
            Usted puede permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la configuración de las opciones del navegador instalado en su ordenador. También puede limpiar el `localStorage` de su navegador si desea revocar el consentimiento del banner de nuestra web.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-800 mb-4 uppercase tracking-wider text-sm">4. Titularidad</h2>
          <p>
            El responsable del tratamiento de las cookies utilizadas en este sitio web es <strong>{settings.legal_name || settings.clinic_name}</strong> con NIF <strong>{settings.clinic_nif}</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
