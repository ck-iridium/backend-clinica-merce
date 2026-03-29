"use client"
import { useState, useEffect } from 'react';

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [totalSessions, setTotalSessions] = useState(5);
  const [expirationMonths, setExpirationMonths] = useState(12);
  const [totalPrice, setTotalPrice] = useState<number | ''>('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vRes, cRes, sRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/vouchers/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/`)
      ]);
      if (vRes.ok) setVouchers(await vRes.json());
      if (cRes.ok) setClients(await cRes.json());
      if (sRes.ok) setServices(await sRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Paciente Borrado';
  const getServiceName = (id: string) => services.find(s => s.id === id)?.name || 'Servicio Borrado';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const purDate = new Date();
    const expDate = new Date();
    expDate.setMonth(expDate.getMonth() + expirationMonths);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vouchers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: selectedClientId,
          service_id: selectedServiceId,
          total_sessions: totalSessions,
          used_sessions: 0,
          total_price: Number(totalPrice),
          purchase_date: purDate.toISOString().split('T')[0],
          expiration_date: expDate.toISOString().split('T')[0]
        })
      });

      if (res.ok) {
        setShowModal(false);
        setSelectedClientId('');
        setSelectedServiceId('');
        setTotalPrice('');
        fetchData();
      } else {
        alert("Error creando el bono.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas anular este bono? Se perderán las sesiones restantes.')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vouchers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        alert("Error al anular.")
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isExpired = (expDate: string) => new Date(expDate) < new Date();

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">Venta de Bonos</h1>
          <p className="text-stone-500 font-medium">Gestión y control de bonos multi-sesión de pacientes</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#d9777f] hover:bg-[#b35e65] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2">
          <span className="text-xl leading-none">+</span> Emitir Nuevo Bono
        </button>
      </div>

      {loading ? (
        <div className="text-center py-32">
          <div className="inline-block w-8 h-8 border-4 border-[#d4af37] border-t-[#d9777f] rounded-full animate-spin mb-4"></div>
          <p className="text-stone-500 font-medium tracking-widest uppercase text-xs">Cargando base de datos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vouchers.length === 0 ? (
             <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-stone-100 shadow-sm">
                <span className="text-5xl opacity-50 mb-4 block">🎟</span>
                <p className="text-stone-500 font-medium text-lg">Aún no hay ningún bono emitido.</p>
             </div>
          ) : vouchers.map(v => {
            const expired = isExpired(v.expiration_date);
            const empty = v.used_sessions >= v.total_sessions;
            const active = !expired && !empty;

            return (
            <div key={v.id} className={`p-6 bg-white rounded-3xl border ${active ? 'border-[#f3c7cb] shadow-lg shadow-[#fdf2f3]' : 'border-stone-100 opacity-70 grayscale shadow-sm'} relative overflow-hidden transition-all group hover:scale-[1.01]`}>
              {/* Card Decoration */}
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none ${active ? 'bg-[#d9777f]' : 'bg-stone-500'}`}></div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                 <div>
                   <p className="text-[10px] font-bold text-[#d9777f] uppercase tracking-widest mb-1">Paciente</p>
                   <p className="font-extrabold text-stone-800 text-lg leading-tight truncate max-w-[180px]">{getClientName(v.client_id)}</p>
                 </div>
                 <div className={`text-xs font-bold px-3 py-1 rounded-full border flex-shrink-0 ${active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : (empty ? 'bg-stone-100 text-stone-500 border-stone-300' : 'bg-red-50 text-red-600 border-red-200')}`}>
                   {active ? 'Vigente' : (empty ? 'Agotado' : 'Caducado')}
                 </div>
              </div>

              <div className="mb-6 relative z-10">
                 <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Tratamiento Asignado</p>
                 <p className="font-bold text-stone-700 flex items-center gap-2">✨ {getServiceName(v.service_id)}</p>
              </div>

              <div className="flex gap-4 mb-6 pt-4 border-t border-stone-50 relative z-10">
                <div className="flex-1 bg-[#fdf2f3] p-3 rounded-xl border border-[#f3c7cb]/50">
                  <p className="text-[10px] uppercase font-bold text-[#d9777f] mb-1">Consumidas</p>
                  <p className="text-2xl font-extrabold text-stone-800 flex items-baseline gap-1">
                    {v.used_sessions} <span className="text-sm font-bold text-stone-400">/ {v.total_sessions}</span>
                  </p>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Caducidad</p>
                  <p className={`font-extrabold ${expired ? 'text-red-500' : 'text-stone-600'}`}>{new Date(v.expiration_date).toLocaleDateString()}</p>
                </div>
              </div>

              <button onClick={() => handleDelete(v.id)} className="w-full py-3 bg-stone-50 hover:bg-red-50 hover:text-red-600 text-stone-400 text-xs font-bold uppercase tracking-widest rounded-xl transition-all relative z-10">
                Anular Bono
              </button>
            </div>
          )})}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-md w-full animate-in zoom-in-95 duration-200 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-stone-100 text-stone-500 font-bold hover:bg-stone-200 flex items-center justify-center transition-colors">✕</button>
            <h2 className="text-2xl font-extrabold text-stone-800 mb-6">Emitir Nuevo Bono</h2>
            <form onSubmit={handleCreate} className="space-y-5">
              
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Asignar al Paciente *</label>
                <select required value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#d9777f] outline-none bg-stone-50 appearance-none font-semibold text-stone-700">
                  <option value="">-- Elige un paciente --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Servicio del Bono *</label>
                <select required value={selectedServiceId} onChange={e => setSelectedServiceId(e.target.value)} className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#d9777f] outline-none bg-stone-50 appearance-none font-semibold text-stone-700">
                  <option value="">-- Tratamiento --</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.price}€)</option>)}
                </select>
              </div>

              {selectedServiceId && totalSessions > 0 && (
                <p className="text-xs text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-100 italic flex items-center gap-2">
                  <span>💡</span> Precio de {totalSessions} sesiones sueltas: 
                  <span className="line-through font-bold">{services.find(s => s.id === selectedServiceId)?.price * totalSessions}€</span>
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">Total Sesiones</label>
                  <input required type="number" min="1" value={totalSessions} onChange={e => setTotalSessions(Number(e.target.value))} className="w-full px-5 py-4 rounded-xl border border-stone-200 font-extrabold text-stone-700 focus:ring-2 focus:ring-[#d9777f] outline-none bg-stone-50" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#d9777f] mb-2">Precio Final Rebajado (€) *</label>
                  <input required type="number" step="0.01" min="0" value={totalPrice} onChange={e => setTotalPrice(e.target.value ? Number(e.target.value) : '')} className="w-full px-5 py-4 rounded-xl border border-[#f3c7cb] font-extrabold text-[#d9777f] focus:ring-2 focus:ring-[#d9777f] outline-none bg-[#fdf2f3] placeholder:text-[#f3c7cb]" placeholder="0.00" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">Validez (Meses)</label>
                <input required type="number" min="1" value={expirationMonths} onChange={e => setExpirationMonths(Number(e.target.value))} className="w-full px-5 py-4 rounded-xl border border-stone-200 font-extrabold text-stone-700 focus:ring-2 focus:ring-[#d9777f] outline-none bg-stone-50" />
              </div>

              <div className="flex gap-3 pt-6 border-t border-stone-100">
                <button disabled={saving} type="submit" className="flex-1 bg-stone-900 hover:bg-[#d9777f] text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95">
                  {saving ? 'Guardando...' : 'Crear Bono'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
