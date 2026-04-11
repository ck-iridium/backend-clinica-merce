'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFeedback } from '@/app/contexts/FeedbackContext';

export default function POSPage() {
  const { showFeedback } = useFeedback();
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [finalPrice, setFinalPrice] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('Tarjeta');
  const [isSimplified, setIsSimplified] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/`)
      ]);
      if (cRes.ok) setClients(await cRes.json());
      if (sRes.ok) {
        const servs = await sRes.json();
        setServices(servs.filter((s: any) => s.is_active));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceChange = (id: string) => {
    setSelectedServiceId(id);
    const service = services.find(s => s.id === id);
    if (service) {
      setFinalPrice(service.price.toString());
    }
  };

  const filteredClients = clients.filter(c => 
    c.email !== 'contado@clinica-mercedes.com' && (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm)
    )
  ).slice(0, 5);

  const handleProcessSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSimplified && !selectedClientId) return;
    if (!selectedServiceId || !finalPrice) return;

    setIsProcessing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/direct-sale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: isSimplified ? 'simplified' : selectedClientId, // Backend handles 'simplified' via flag
          service_id: selectedServiceId,
          final_price: Number(finalPrice),
          payment_method: paymentMethod,
          is_simplified: isSimplified
        })
      });

      if (res.ok) {
        const invoice = await res.json();
        setLastInvoice(invoice);
      } else {
        showFeedback({ type: 'error', title: 'Error', message: 'Error al procesar la venta' });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setLastInvoice(null);
    setSelectedClientId('');
    setSelectedServiceId('');
    setSearchTerm('');
    setFinalPrice('');
    setPaymentMethod('Tarjeta');
    setIsSimplified(false);
  };

  if (loading) return (
    <div className="p-20 text-center">
      <div className="inline-block w-8 h-8 border-4 border-[#f3c7cb] border-t-[#d9777f] rounded-full animate-spin mb-4"></div>
      <p className="text-stone-500 font-medium tracking-widest uppercase text-xs">Abriendo Terminal de Venta...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
      
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-black text-stone-800 tracking-tight flex items-center justify-center md:justify-start gap-4">
          <span className="bg-stone-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xl">🏷️</span>
          Venta Rápida
        </h1>
        <p className="text-stone-500 font-medium mt-2">Módulo de cobro directo sin cita previa.</p>
      </header>

      {lastInvoice ? (
        <div className="bg-white rounded-[2.5rem] p-12 shadow-2xl border border-emerald-100 text-center animate-in zoom-in-95 duration-300">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">✅</div>
          <h2 className="text-3xl font-black text-stone-800 mb-2">¡Cobro Realizado!</h2>
          <p className="text-stone-500 mb-10 font-medium">La factura <span className="text-stone-800 font-bold">#{lastInvoice.id}</span> se ha generado como PAGADA.</p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link 
              href={`/dashboard/invoices`} 
              className="bg-stone-900 text-white px-10 py-5 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-stone-900/20 active:scale-95"
            >
              Ver Todas las Facturas
            </Link>
            <button 
              onClick={resetForm}
              className="bg-stone-100 text-stone-600 px-10 py-5 rounded-2xl font-bold hover:bg-stone-200 transition-all active:scale-95 border border-stone-200"
            >
              Nueva Venta 🏷️
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* SECCIÓN 1: CLIENTE Y SERVICIO */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-stone-100 space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-black text-[#d9777f] uppercase tracking-[0.2em]">1. Identificación</h3>
              <button 
                onClick={() => { setIsSimplified(!isSimplified); if (!isSimplified) { setSelectedClientId(''); setSearchTerm(''); } }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border-2 ${isSimplified ? 'bg-stone-800 border-stone-800 text-white' : 'bg-white border-stone-100 text-stone-400 hover:border-stone-200'}`}
              >
                <span className="text-[10px] font-black uppercase tracking-tighter">{isSimplified ? 'Modo Ticket ✅' : 'Factura Nomminal'}</span>
                <div className={`w-3 h-3 rounded-full ${isSimplified ? 'bg-emerald-400 animate-pulse' : 'bg-stone-200'}`}></div>
              </button>
            </div>
            
            {/* Buscador de Cliente */}
            <div className={`relative transition-opacity duration-300 ${isSimplified ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`}>
              <label className="block text-sm font-bold text-stone-700 mb-2">{isSimplified ? 'Venta al Portador' : 'Buscar Cliente'}</label>
              <input 
                type="text"
                placeholder={isSimplified ? "Identificación no necesaria" : "Nombre, email o teléfono..."}
                disabled={isSimplified}
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setSelectedClientId(''); }}
                className="w-full px-5 py-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-[#d9777f] outline-none bg-stone-50 transition-all font-medium"
              />
              {searchTerm && !selectedClientId && filteredClients.length > 0 && !isSimplified && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {filteredClients.map(c => (
                    <button 
                      key={c.id}
                      onClick={() => { setSelectedClientId(c.id); setSearchTerm(c.name); }}
                      className="w-full text-left px-5 py-3 hover:bg-[#fdf2f3] border-b border-stone-50 last:border-0 flex flex-col"
                    >
                      <span className="font-bold text-stone-800 text-sm">{c.name}</span>
                      <span className="text-[10px] text-stone-400">{c.email || c.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selector de Servicio */}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Servicio Prestado</label>
              <select 
                value={selectedServiceId} 
                onChange={e => handleServiceChange(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-stone-100 bg-stone-50 focus:ring-2 focus:ring-[#d9777f] outline-none font-bold text-stone-800"
              >
                <option value="">-- Selecciona el servicio --</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.price}€)</option>)}
              </select>
            </div>
          </div>

          {/* SECCIÓN 2: COBRO Y PAGO */}
          <div className="bg-stone-900 text-white rounded-[2rem] p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-2">2. Resumen y Pago</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white/70 mb-2">Importe a Cobrar (€)</label>
                <input 
                  type="number"
                  step="0.01"
                  value={finalPrice}
                  onChange={e => setFinalPrice(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 px-6 py-5 rounded-2xl text-4xl font-black focus:ring-2 focus:ring-white outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white/70 mb-4">Método de Pago</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Tarjeta', 'Efectivo'].map(method => (
                    <button 
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-4 rounded-2xl font-black text-sm transition-all border-2 ${paymentMethod === method ? 'bg-white text-stone-900 border-white shadow-lg' : 'bg-transparent border-white/20 text-white/60 hover:border-white/40'}`}
                    >
                      {method === 'Tarjeta' ? '💳 Tarjeta' : '💵 Efectivo'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button 
                onClick={handleProcessSale}
                disabled={(!isSimplified && !selectedClientId) || !selectedServiceId || isProcessing}
                className="w-full bg-white text-stone-900 px-8 py-5 rounded-[1.5rem] font-black text-xl hover:bg-stone-100 transition-all disabled:opacity-30 active:scale-95 shadow-xl"
              >
                {isProcessing ? 'Procesando...' : 'Confirmar y Cobrar'}
              </button>
              {!isSimplified && !selectedClientId && searchTerm && <p className="text-[10px] text-white/40 mt-3 text-center">Debes seleccionar un cliente de la lista</p>}
            </div>
          </div>

        </div>
      )}

      {/* Informativo */}
      <div className="mt-12 p-6 bg-stone-100/50 rounded-2xl border border-stone-100 flex items-center gap-4 text-stone-500">
        <span className="text-2xl">ℹ️</span>
        <p className="text-xs font-medium leading-relaxed">
          Este módulo genera automáticamente una factura firmada y marcada como sujeta a IVA (21%). 
          La venta quedará vinculada al historial del cliente pero <strong>no genera reserva en el calendario</strong>.
        </p>
      </div>

    </div>
  );
}
