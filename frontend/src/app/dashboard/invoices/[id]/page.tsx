"use client"
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function InvoicePreviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Estados interactivos del Cuño/Firma y Persistencia
  const SELLO_KEY = `sello_pos_${id}`;

  const savedSello = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem(SELLO_KEY) || 'null') 
    : null;

  const [selloPos, setSelloPos] = useState<{ x: number; y: number }>(
    savedSello ? { x: savedSello.x, y: savedSello.y } : { x: -100, y: -50 }
  );

  const [sigRot, setSigRot] = useState<number>(
    savedSello ? savedSello.rot : 0
  );
  
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });

  const saveSello = useCallback((pos: { x: number; y: number }, rot: number) => {
      if (typeof window !== 'undefined') {
          localStorage.setItem(SELLO_KEY, JSON.stringify({ x: pos.x, y: pos.y, rot }));
      }
  }, [SELLO_KEY]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const iRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${id}`);
      if (!iRes.ok) throw new Error("Factura no encontrada");
      const invData = await iRes.json();
      setInvoice(invData);

      const cRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${invData.client_id}`);
      if (cRes.ok) setClient(await cRes.json());
      
      const sRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/`);
      if (sRes.ok) setSettings(await sRes.json());
    } catch (e) {
      console.error(e);
      alert("Error cargando la vista de factura");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (currentStatus: string) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setInvoice({ ...invoice, status: newStatus });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const onSelloMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, origX: selloPos.x, origY: selloPos.y };

    const onMove = (ev: MouseEvent) => {
        if (!dragRef.current.dragging) return;
        const newPos = {
            x: dragRef.current.origX + (ev.clientX - dragRef.current.startX),
            y: dragRef.current.origY + (ev.clientY - dragRef.current.startY),
        };
        setSelloPos(newPos);
    };

    const onUp = () => {
        dragRef.current.dragging = false;
        setSelloPos(prev => { 
            saveSello(prev, sigRot); 
            return prev; 
        });
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [selloPos.x, selloPos.y, sigRot, saveSello]);

  if (loading) {
    return (
        <div className="text-center py-32">
          <div className="inline-block w-8 h-8 border-4 border-[#d4af37] border-t-[#d9777f] rounded-full animate-spin mb-4"></div>
          <p className="text-stone-500 font-medium tracking-widest uppercase text-xs">Cargando folio...</p>
        </div>
    );
  }

  if (!invoice) return <div className="p-10 text-center font-bold text-stone-500">Documento no disponible.</div>;

  return (
    <div className="animate-in fade-in duration-500 pb-20 max-w-[1400px] mx-auto">
      
      {/* HEADER DE NAVEGACION (No se imprime) */}
      <div className="mb-8 print:hidden flex items-center gap-4">
        <button onClick={() => router.back()} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-stone-100 text-stone-500 hover:text-[#d9777f] hover:border-[#d9777f] transition-all">
          ←
        </button>
        <div>
           <h1 className="text-2xl font-extrabold text-stone-800">Visor de Folio</h1>
           <p className="text-stone-500 text-sm font-medium">#{invoice.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* COLUMNA IZQUIERDA: PANEL DE CONTROL ERP (No se imprime) */}
        <div className="xl:col-span-1 space-y-6 print:hidden">
          
          {/* Tarjeta de Cliente */}
          <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Información del Cliente</p>
            <div className="flex flex-col gap-1 mb-4">
              <span className="font-extrabold text-stone-800 text-lg leading-tight">{client?.name || 'Paciente Borrado'}</span>
              <span className="text-sm font-medium text-stone-500">{client?.email || 'Sin email'}</span>
              <span className="text-sm font-medium text-stone-500">{client?.phone || 'Sin teléfono'}</span>
            </div>
            {client?.id && (
               <Link href={`/dashboard/clients/${client.id}`} className="text-xs font-bold text-[#d9777f] hover:underline flex items-center gap-1">
                 Ver Ficha Completa →
               </Link>
            )}
          </div>

          {/* Tarjeta de Estados y Acciones */}
          <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Control de Estado</p>
            
            <button 
              onClick={() => handleToggleStatus(invoice.status)}
              className={`w-full p-4 rounded-xl flex items-center justify-between text-left transition-all font-bold text-sm mb-6 ${
                invoice.status === 'paid' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                : 'bg-orange-50 text-orange-700 border border-orange-200 shadow-sm'
              }`}
            >
              <span>{invoice.status === 'paid' ? '✔ Estado: Pagado' : '⏳ Estado: Pendiente'}</span>
              <span className="text-xs opacity-70 italic underline">Cambiar</span>
            </button>

            <button 
              onClick={handlePrint}
              className="w-full bg-stone-900 hover:bg-[#d4af37] text-white p-4 rounded-xl font-extrabold active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              IMPRIMIR DOCUMENTO
            </button>
          </div>

        </div>

        {/* COLUMNA DERECHA: VISTA PREVIA DEL FOLIO A4 */}
        <div className="xl:col-span-3 flex justify-center">
          
          {/* Contenedor del Folio A4 real */}
          <div 
             className="bg-white shadow-2xl print:shadow-none w-[210mm] min-h-[297mm] overflow-hidden relative print:absolute print:left-0 print:top-0 print:m-0"
             style={{ pageBreakAfter: 'always' }}
          >
            {/* Decoración lateral estética (opcional, pero da toque Premium) */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#d9777f] print:bg-[#d9777f] z-0"></div>

            <div className="p-[20mm] relative z-10 w-full h-full flex flex-col">
                
                {/* CABECERA: Logo y Datos Clínica */}
                <div className="flex justify-between items-start mb-8 border-b border-stone-200 pb-4">
                  <div className="flex flex-col">
                    {/* Imagen de Logo */}
                    {settings?.logo_pdf_b64 ? (
                       <img src={settings.logo_pdf_b64} alt="Company Logo" className="w-auto h-20 object-contain mb-4" />
                    ) : (
                       <div className="w-24 h-24 bg-stone-100 rounded-2xl mb-4 flex items-center justify-center text-stone-300 font-bold text-[10px] text-center p-2 border border-stone-200 border-dashed">
                         Sin Logo
                       </div>
                    )}
                    <h2 className="text-2xl font-extrabold text-[#d9777f] mb-1">{settings?.clinic_name || 'Clínica Mercè'}</h2>
                    <p className="text-xs text-stone-500 font-medium">{settings?.clinic_email || 'correo@clinica.com'}</p>
                    <p className="text-xs text-stone-400 mt-2">NIF: {settings?.clinic_nif || 'No especificado'}<br/>{settings?.clinic_address || 'Sin dirección registrada'}<br/>{settings?.clinic_phone || ''}</p>
                  </div>
                  
                  <div className="text-right flex flex-col items-end">
                    <h1 className="text-4xl font-extrabold text-stone-200 tracking-tighter mb-4">FACTURA</h1>
                    <div className="text-xs text-stone-500 font-medium grid grid-cols-2 gap-x-4 gap-y-1 text-right w-full max-w-[200px]">
                      <span className="text-stone-400">Nº Documento:</span> <span className="text-stone-800 font-bold uppercase">{invoice.id}</span>
                      <span className="text-stone-400">Fecha Emisión:</span> <span className="text-stone-800 font-bold">{new Date(invoice.date).toLocaleDateString()}</span>
                      <span className="text-stone-400">Estado:</span> 
                      <span className={`font-bold ${invoice.status === 'paid' ? 'text-emerald-500' : 'text-orange-500'}`}>
                        {invoice.status === 'paid' ? 'Pagado' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* DATOS DEL PACIENTE */}
                <div className="mb-6">
                   <p className="text-[10px] font-bold text-[#d4af37] uppercase tracking-widest mb-3 border-b border-stone-100 pb-2">Facturar o Cobrar A:</p>
                   <div className="pl-2">
                     <p className="text-base font-bold text-stone-800 mb-1">{client?.name || 'Cliente sin nombre'}</p>
                     
                     {/* Datos de contacto */}
                     {client?.phone && <p className="text-xs text-stone-500 font-medium mb-2">{client.phone}</p>}
                     
                     {/* Campos Fiscales Condicionales (Para Factura Completa) */}
                     {client?.dni && (
                       <p className="text-xs text-stone-600"><strong>NIF/CIF:</strong> {client.dni}</p>
                     )}
                     {client?.address && (
                       <p className="text-xs text-stone-600"><strong>Dirección:</strong> {client.address}</p>
                     )}
                   </div>
                </div>

                {/* TABLA DE CONCEPTOS */}
                <div className="mb-6 flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-stone-800 text-xs uppercase tracking-widest text-stone-800">
                        <th className="py-4 font-extrabold w-3/4">Descripción / Concepto</th>
                        <th className="py-4 font-extrabold text-right">Importe Neto</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-stone-600">
                      <tr className="border-b border-stone-100">
                        <td className="py-6 font-semibold">{invoice.concept}</td>
                        <td className="py-6 font-bold text-stone-800 text-right">{Number(invoice.amount).toFixed(2)} €</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* TOTALES */}
                <div className="flex justify-end mb-8">
                  <div className="w-[250px]">
                     <div className="flex justify-between py-2 text-sm text-stone-500">
                       <span>Base Imponible</span>
                       <span>{(Number(invoice.amount) / (1 + (invoice.tax_rate || 21)/100)).toFixed(2)} €</span>
                     </div>
                     <div className="flex justify-between py-2 text-sm text-stone-500 border-b border-stone-200 mb-2">
                       <span>IVA ({invoice.tax_rate || 21}%)</span>
                       <span>{(Number(invoice.amount) - (Number(invoice.amount) / (1 + (invoice.tax_rate || 21)/100))).toFixed(2)} €</span>
                     </div>
                     <div className="flex justify-between items-end pt-2">
                       <span className="font-extrabold text-stone-800">TOTAL</span>
                       <span className="text-3xl font-extrabold text-[#d9777f]">{Number(invoice.amount).toFixed(2)} €</span>
                     </div>
                  </div>
                </div>

                {/* PIE DE PÁGINA (Footer) */}
                <div className="mt-auto border-t border-stone-200 pt-4 flex justify-between items-end">
                   <div className="max-w-[300px]">
                     <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Instrucciones</p>
                     <p className="text-xs text-stone-500 text-left">
                       Los bonos y tratamientos adquiridos están sujetos a su periodo de vigencia. El abono se ha registrado correctamente en nuestra contabilidad interna.
                     </p>
                   </div>
                   <div className="text-right flex flex-col items-end relative min-w-[200px] min-h-[100px]">
                     {settings?.signature_b64 ? (
                        <div 
                          className="z-50 group flex flex-col items-center justify-center p-2 rounded-xl transition-shadow hover:shadow-[0_0_20px_rgba(217,119,127,0.3)] print:shadow-none print:p-0 print:m-0"
                          style={{
                               position: 'absolute',
                               left: selloPos.x,
                               top: selloPos.y,
                               transform: `rotate(${sigRot}deg)`,
                               cursor: 'grab',
                               userSelect: 'none'
                          }}
                          onMouseDown={onSelloMouseDown}
                        >
                           <img 
                             src={settings.signature_b64} 
                             alt="Sello y Firma" 
                             draggable={false}
                             style={{ pointerEvents: 'none', mixBlendMode: 'multiply' }}
                             className="h-20 w-auto object-contain opacity-80 select-none drop-shadow-sm" 
                           />
                           
                           {/* Panel de Opciones Flotante (Se oculta al imprimir) */}
                           <div 
                             className="absolute -top-12 left-1/2 -translate-x-1/2 bg-stone-900 border border-stone-700 text-white rounded-xl p-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden shadow-xl"
                             onMouseDown={(e) => e.stopPropagation()} // Prevenir arrastre al hacer clic en los botones
                           >
                              <button title="Rotar Izquierda" onClick={() => { const r = sigRot - 5; setSigRot(r); saveSello(selloPos, r); }} onMouseDown={e => e.stopPropagation()} className="w-8 h-8 rounded-lg hover:bg-stone-700 flex items-center justify-center font-bold text-stone-300 hover:text-white transition-colors">↺</button>
                              <span className="text-[10px] font-mono font-bold w-10 text-center">{sigRot}º</span>
                              <button title="Rotar Derecha" onClick={() => { const r = sigRot + 5; setSigRot(r); saveSello(selloPos, r); }} onMouseDown={e => e.stopPropagation()} className="w-8 h-8 rounded-lg hover:bg-stone-700 flex items-center justify-center font-bold text-stone-300 hover:text-white transition-colors">↻</button>
                           </div>
                        </div>
                     ) : (
                        <div className="h-24 w-40"></div>
                     )}
                     <p className="text-xs text-stone-400 italic mt-2">Gracias por su confianza.</p>
                     <p className="text-sm font-extrabold text-stone-800 mt-1">{settings?.clinic_name || 'Clínica Mercè'}</p>
                   </div>
                </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
