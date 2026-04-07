import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacto | Clínica de Estética',
  description: 'Ponte en contacto con nosotros para reservar tu cita o para cualquier consulta sobre nuestros tratamientos.',
};

async function getSettings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/settings/`, { next: { revalidate: 60 } });
    if (res.ok) return await res.json();
  } catch(e) {
    console.error(e);
  }
  return null;
}

export default async function ContactoPage() {
  const settings = await getSettings();

  return (
    <div className="min-h-screen bg-stone-50 font-sans mt-16 md:mt-0 pt-32 pb-24">
      <main className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16 animate-in slide-in-from-bottom-4 duration-700">
          <span className="text-[#d4af37] font-bold tracking-widest uppercase text-sm mb-4 block">Contacto</span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-stone-900 mb-6">Estamos aquí para ti</h1>
          <p className="text-lg md:text-xl text-stone-500 max-w-2xl mx-auto font-medium">
            Contacta con nosotros para resolver dudas, pedir asesoramiento o agendar tu próxima cita.
          </p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-xl border border-stone-100 overflow-hidden text-center md:text-left">
           <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-10 md:p-14 bg-stone-900 text-white flex flex-col justify-center">
                 <h2 className="text-3xl font-extrabold mb-8">Información Directa</h2>
                 
                 <div className="space-y-6">
                    <div>
                      <p className="text-stone-400 font-bold text-sm uppercase tracking-wider mb-1">Teléfono Fijo</p>
                      <p className="text-xl font-medium">{settings?.clinic_phone || 'No configurado'}</p>
                    </div>
                    
                    <div>
                      <p className="text-stone-400 font-bold text-sm uppercase tracking-wider mb-1">WhatsApp</p>
                      <a href={settings?.whatsapp_number ? `https://wa.me/${settings.whatsapp_number.replace(/\D/g,'')}` : '#'} className="text-xl font-medium text-[#d4af37] hover:underline">
                         {settings?.whatsapp_number || 'No configurado'}
                      </a>
                    </div>
                    
                    <div>
                      <p className="text-stone-400 font-bold text-sm uppercase tracking-wider mb-1">Email</p>
                      <a href={`mailto:${settings?.clinic_email}`} className="text-xl font-medium hover:text-[#d4af37] transition-colors">
                         {settings?.clinic_email || 'No configurado'}
                      </a>
                    </div>
                    
                    <div>
                      <p className="text-stone-400 font-bold text-sm uppercase tracking-wider mb-1">Ubicación</p>
                      <p className="text-lg leading-relaxed">{settings?.clinic_address || 'Sin especificar'}</p>
                      {settings?.maps_url && (
                        <a href={settings.maps_url} target="_blank" rel="noreferrer" className="inline-block mt-3 text-sm text-[#d4af37] font-bold hover:underline">
                           Ver en Google Maps →
                        </a>
                      )}
                    </div>
                 </div>
              </div>
              
              <div className="p-10 md:p-14 flex flex-col justify-center bg-stone-50 md:bg-white border-t md:border-t-0 md:border-l border-stone-100">
                 <h2 className="text-2xl font-extrabold mb-6 text-stone-800">¿Hablamos rápido?</h2>
                 <p className="text-stone-500 mb-8 font-medium">La vía más rápida para confirmar disponibilidad y reservas en el día de hoy es a través de WhatsApp.</p>
                 
                 <a 
                   href={settings?.whatsapp_number ? `https://wa.me/${settings.whatsapp_number.replace(/\D/g,'')}` : '#'} 
                   className="bg-[#25D366] text-white py-5 px-8 rounded-2xl font-bold flex items-center justify-center gap-3 text-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                 >
                   <span>📱</span> Abrir chat en WhatsApp
                 </a>
                 
                 {settings?.instagram_url && (
                   <div className="mt-8 text-center border-t border-stone-200 pt-8">
                     <p className="text-stone-400 font-bold text-sm uppercase tracking-wider mb-4">Síguenos en Redes</p>
                     <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="text-stone-600 hover:text-[#d4af37] font-bold">
                       Instagram @clinicamerce
                     </a>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
