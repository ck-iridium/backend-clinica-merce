"use client"
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFeedback } from '@/app/contexts/FeedbackContext';

export default function ConsentPreviewPage() {
  const { showFeedback } = useFeedback();
  const { id: clientId, consent_id: consentId } = useParams();
  const router = useRouter();
  
  const [consent, setConsent] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [clientId, consentId]);

  const fetchData = async () => {
    try {
      const [conRes, cRes, sRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${clientId}/consents/${consentId}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${clientId}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/`)
      ]);
      
      if (conRes.ok) setConsent(await conRes.json());
      if (cRes.ok) setClient(await cRes.json());
      if (sRes.ok) setSettings(await sRes.json());
    } catch (e) {
      console.error(e);
      showFeedback({ type: 'error', title: 'Error', message: 'Error cargando la vista del documento legal' });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
        <div className="text-center py-32">
          <div className="inline-block w-8 h-8 border-4 border-[#d4af37] border-t-[#d9777f] rounded-full animate-spin mb-4"></div>
          <p className="text-stone-500 font-medium tracking-widest uppercase text-xs">Cargando documento...</p>
        </div>
    );
  }

  if (!consent || !client) return <div className="p-10 text-center font-bold text-stone-500">Documento legal no disponible.</div>;

  return (
    <div className="animate-in fade-in duration-500 pb-20 max-w-[1400px] mx-auto print:p-0 print:max-w-none">
      
      {/* HEADER DE NAVEGACION (No se imprime) */}
      <div className="flex justify-between items-center mb-10 print:hidden relative z-10">
        <div className="flex items-center gap-4">
           <button onClick={() => router.back()} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-stone-200 text-stone-400 hover:text-stone-700 hover:border-stone-400 transition-all font-bold">
             ←
           </button>
           <div>
              <h1 className="text-3xl font-extrabold text-[#d9777f] drop-shadow-sm flex items-center gap-3">
                <span className="text-2xl">⚖️</span>
                Visor Legal
              </h1>
              <p className="text-stone-500 font-medium">{consent.document_title}</p>
           </div>
        </div>

        <div className="flex gap-4">
           {/* Botón Flotante de Imprimir */}
           <button 
             onClick={handlePrint}
             className="px-6 py-3 font-extrabold text-white bg-[#d9777f] hover:bg-[#c6646b] rounded-xl shadow-lg hover:shadow-xl transition-all border border-[#c6646b] flex items-center gap-2"
           >
             <span>🖨️</span> Imprimir Documento (A4)
           </button>
        </div>
      </div>

      {/* ÁREA DEL DOCUMENTO (FOLIO A4) */}
      <div className="flex justify-center flex-1 relative z-0 print:block print:w-full print:bg-white">
        {/* Folio Blanco */}
        <div className="bg-white w-full max-w-[800px] min-h-[1131px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] print:shadow-none print:w-full print:max-w-none print:min-h-0 print:h-auto print:m-0 print:p-0 mx-auto transform transition-transform border border-stone-100 p-12 relative flex flex-col justify-between">
          
          <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.02] pointer-events-none print:hidden">
             {settings?.logo_pdf_b64 ? (
                <img src={settings.logo_pdf_b64} alt="Watermark" className="w-3/4 grayscale mix-blend-multiply" style={{ objectFit: 'contain' }} />
             ) : settings?.logo_app_b64 ? (
                <img src={settings.logo_app_b64} alt="Watermark" className="w-3/4 grayscale mix-blend-multiply" style={{ objectFit: 'contain' }} />
             ) : null}
          </div>

          <div className="relative z-10">
             {/* CABECERA LEGAL */}
             <div className="flex justify-between items-start border-b-2 border-stone-800 pb-8 mb-8">
                <div>
                   {settings?.logo_pdf_b64 ? (
                      <img src={settings.logo_pdf_b64} alt="Logo" className="h-20 object-contain mb-4" />
                   ) : settings?.logo_app_b64 ? (
                      <img src={settings.logo_app_b64} alt="Logo" className="h-20 object-contain mb-4" />
                   ) : (
                      <div className="h-20 flex items-center font-extrabold text-2xl text-stone-800 tracking-tight">{settings?.clinic_name || 'CLÍNICA MERCE'}</div>
                   )}
                   <p className="text-xs font-bold text-stone-500 tracking-widest uppercase">Documento Confidencial Médio-Legal</p>
                </div>
                <div className="text-right max-w-[250px]">
                   <p className="font-extrabold text-stone-800 tracking-tight mb-2 uppercase break-words">{settings?.clinic_name || 'Clínica Mercè'}</p>
                   <p className="text-xs text-stone-400 font-medium">
                     {settings?.clinic_address || 'Dirección de la clínica no configurada'}
                   </p>
                   <p className="text-xs text-stone-400 font-medium">NIF: {settings?.clinic_nif || '---'}</p>
                   <p className="text-xs font-bold border border-stone-200 bg-stone-50 rounded-lg px-2 py-1 mt-4 inline-block text-stone-500">
                     Ref: {consent.id.split('-')[0].toUpperCase()}
                   </p>
                </div>
             </div>

             {/* BLOQUE DE IDENTIFICACIÓN PACIENTE */}
             <div className="bg-stone-50 border border-stone-200 p-6 rounded-2xl mb-8 flex flex-col gap-2">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-200 pb-2 mb-2">
                  Datos del Cliente
                </h3>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <p className="text-xs text-stone-500 mb-1">Nombre Completo:</p>
                     <p className="font-extrabold text-stone-800">{client.name}</p>
                   </div>
                   {client.dni && (
                     <div>
                       <p className="text-xs text-stone-500 mb-1">DNI / NIE / Pasaporte:</p>
                       <p className="font-bold text-stone-700">{client.dni}</p>
                     </div>
                   )}
                   {client.address && (
                     <div className="col-span-2">
                       <p className="text-xs text-stone-500 mb-1">Dirección de Residencia:</p>
                       <p className="font-bold text-stone-700">{client.address}</p>
                     </div>
                   )}
                </div>
             </div>

             {/* CUERPO DEL TEXTO LEGAL */}
             <div className="mb-12">
               <h2 className="text-xl font-extrabold text-stone-800 mb-6 text-center underline decoration-stone-300 underline-offset-4">
                 {consent.document_title}
               </h2>
               <div className="text-sm text-stone-700 leading-relaxed text-justify space-y-4">
                 {/* Al haber guardado el body en el panel frontal con párrafos simples, los renderizamos tal cual */}
                 {consent.document_body.split('\n\n').map((paragraph: string, i: number) => (
                    <p key={i}>{paragraph}</p>
                 ))}
               </div>
             </div>
          </div>

          {/* PIE DE FIRMAS (Footer) */}
          <div className="relative z-10 border-t border-stone-200 pt-8 mt-auto flex justify-between items-end">
             <div className="max-w-[300px]">
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Clínica / Facultativo</p>
                {settings?.signature_b64 ? (
                   <img src={settings.signature_b64} alt="Sello y Firma Clínica" className="h-16 object-contain mix-blend-multiply opacity-50 mb-2 grayscale" />
                ) : (
                   <div className="h-16"></div>
                )}
                <p className="text-xs font-extrabold text-stone-800">{settings?.clinic_name || 'Clínica Mercè'}</p>
             </div>

             <div className="text-right flex flex-col items-center border border-stone-300 rounded-2xl p-4 bg-stone-50/50 min-w-[250px]">
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-4 w-full text-left border-b border-stone-200 pb-2">
                  Firma del Cliente
                </p>
                <img 
                   src={consent.signature_b64} 
                   alt="Firma del Cliente" 
                   className="h-24 object-contain mix-blend-multiply drop-shadow-sm mb-4" 
                />
                <div className="w-full text-left">
                   <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Firmado digitalmente el:</p>
                   <p className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg inline-block shadow-sm">
                     {new Date(consent.signed_at).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'medium' })}
                   </p>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
