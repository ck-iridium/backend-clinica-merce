"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function VouchersPage() {
  const [activeTab, setActiveTab] = useState<'catalogo' | 'vendidos'>('vendidos');
  
  // Data States
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Template Modal State
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateServiceId, setTemplateServiceId] = useState('');
  const [templateSessions, setTemplateSessions] = useState(5);
  const [templatePrice, setTemplatePrice] = useState<number | ''>('');

  // Assign Voucher Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Extracted values when template is selected
  const [assignPrice, setAssignPrice] = useState<number | ''>('');
  const [assignAmountPaid, setAssignAmountPaid] = useState<number | ''>('');
  const [expirationMonths, setExpirationMonths] = useState(12);
  
  // Pay Debt Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [payVoucherId, setPayVoucherId] = useState('');
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [paying, setPaying] = useState(false);
  const [currentDebt, setCurrentDebt] = useState(0);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vRes, tRes, cRes, sRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/vouchers/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/voucher_templates/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/`)
      ]);
      if (vRes.ok) setVouchers(await vRes.json());
      if (tRes.ok) setTemplates(await tRes.json());
      if (cRes.ok) setClients(await cRes.json());
      if (sRes.ok) setServices(await sRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Cliente Borrado';
  const getServiceName = (id: string) => services.find(s => s.id === id)?.name || 'Servicio Borrado';

  // --- Handlers: Templates ---
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voucher_templates/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          service_id: templateServiceId,
          total_sessions: templateSessions,
          price: Number(templatePrice)
        })
      });
      if (res.ok) {
        setShowTemplateModal(false);
        setTemplateName('');
        setTemplateServiceId('');
        setTemplatePrice('');
        fetchData();
      } else {
        alert("Error al crear plantilla");
      }
    } finally {
      setSaving(false);
    }
  };

  const calculateTemplateDefaultPrice = (srvId: string, sessions: number) => {
      const s = services.find(srv => srv.id === srvId);
      if (s) setTemplatePrice(s.price * sessions);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta plantilla?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voucher_templates/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // --- Handlers: Vouchers (Assignments) ---
  const handleSelectTemplateForAssignment = (id: string) => {
    setSelectedTemplateId(id);
    const tmpl = templates.find(t => t.id === id);
    if (tmpl) {
      setAssignPrice(tmpl.price);
      setAssignAmountPaid(0); // Default 0
    }
  };

  const handleOpenPayModal = (v: any) => {
    setPayVoucherId(v.id);
    const debt = v.total_price - v.amount_paid;
    setCurrentDebt(debt);
    setPayAmount(debt); // Autocomplete with exact remaining amount
    setShowPayModal(true);
  };

  const handlePayDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    try {
      const v = vouchers.find(x => x.id === payVoucherId);
      if (!v) return;
      const newAmountPaid = Number(v.amount_paid) + Number(payAmount);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vouchers/${payVoucherId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_paid: newAmountPaid })
      });
      if (res.ok) {
        setShowPayModal(false);
        fetchData();
      } else {
        alert("Error al registrar el pago");
      }
    } finally {
      setPaying(false);
    }
  };

  const handleAssignVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateId) return alert('Debes seleccionar una plantilla.');
    setSaving(true);
    
    const purDate = new Date();
    const expDate = new Date();
    expDate.setMonth(expDate.getMonth() + expirationMonths);

    const tmpl = templates.find(t => t.id === selectedTemplateId);
    if (!tmpl) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vouchers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: selectedClientId,
          service_id: tmpl.service_id,
          total_sessions: tmpl.total_sessions,
          used_sessions: 0,
          total_price: Number(assignPrice),
          amount_paid: Number(assignAmountPaid || 0),
          purchase_date: purDate.toISOString().split('T')[0],
          expiration_date: expDate.toISOString().split('T')[0]
        })
      });

      if (res.ok) {
        setShowAssignModal(false);
        setSelectedClientId('');
        setSelectedTemplateId('');
        setAssignPrice('');
        setAssignAmountPaid('');
        fetchData();
      } else {
        alert("Error emitiendo el bono.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    if (!confirm('¿Seguro que deseas anular este bono? Se perderán las sesiones restantes.')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vouchers/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const isExpired = (expDate: string) => new Date(expDate) < new Date();

  // Search filter for templates combo
  const filteredTemplates = templates.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return (
    <div className="p-20 text-center">
      <div className="inline-block w-8 h-8 border-4 border-[#f3c7cb] border-t-[#d9777f] rounded-full animate-spin mb-4"></div>
      <p className="text-stone-500 font-medium tracking-widest uppercase text-xs">Cargando bonos...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">Gestión de Bonos</h1>
          <p className="text-stone-500 mt-1 font-medium">Control de plantillas y tratamientos emitidos a clientes.</p>
        </div>
        
        {/* Tabs Navigation */}
        <div className="flex bg-stone-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('vendidos')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'vendidos' ? 'bg-white text-[#d9777f] shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
             Bonos Asignados
          </button>
          <button 
            onClick={() => setActiveTab('catalogo')}
             className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'catalogo' ? 'bg-white text-[#d9777f] shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
             Catálogo (Plantillas)
          </button>
        </div>
      </div>

      {/* ======================= TAB: BONOS VENDIDOS ======================= */}
      {activeTab === 'vendidos' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-stone-800 block">Clientes con Bonos</h2>
            <button 
              onClick={() => setShowAssignModal(true)}
              className="bg-[#d9777f] hover:bg-[#c6646b] text-white px-5 py-2.5 rounded-xl font-extrabold text-sm shadow-sm transition-all hover:shadow border border-[#c6646b] flex items-center gap-2"
            >
              <span>+</span> Emitir Nuevo Bono
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vouchers.map(v => {
              const expired = isExpired(v.expiration_date);
              const isEmpty = v.used_sessions >= v.total_sessions;
              const active = !expired && !isEmpty;

              return (
                <div key={v.id} className={`bg-white rounded-2xl p-6 border transition-all ${active ? 'border-stone-100 shadow-sm hover:border-[#f3c7cb] group' : 'border-stone-100 opacity-60'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-extrabold text-stone-800">{getClientName(v.client_id)}</h3>
                      <p className="text-xs font-bold text-[#d9777f] uppercase tracking-wider mt-1">{getServiceName(v.service_id)}</p>
                    </div>
                    {active ? (
                      <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-100 uppercase tracking-widest shadow-sm">
                        Activo
                      </span>
                    ) : (
                      <span className="bg-stone-100 text-stone-500 px-2.5 py-1 rounded-lg text-xs font-bold border border-stone-200 uppercase tracking-widest">
                        {isEmpty ? 'Agotado' : 'Caducado'}
                      </span>
                    )}
                  </div>
                  
                  {/* Financial Status Indicator */}
                  <div className="mb-4 bg-stone-50 p-3 rounded-xl border border-stone-100 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-stone-400">Estado Pago</p>
                      <p className="text-sm font-bold text-stone-800" title={`Pagado: ${v.amount_paid}€ / Total: ${v.total_price}€`}>
                        {v.payment_status === 'paid' && <span className="text-emerald-600 flex items-center gap-1">✓ Pagado Total</span>}
                        {v.payment_status === 'partial' && (
                          <span className="text-amber-500 flex items-center gap-1 cursor-pointer hover:underline" onClick={() => handleOpenPayModal(v)}>
                            ⚠️ Resta: {v.total_price - v.amount_paid}€ <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded ml-1">Cobrar</span>
                          </span>
                        )}
                        {v.payment_status === 'pending' && (
                          <span className="text-rose-500 flex items-center gap-1 cursor-pointer hover:underline" onClick={() => handleOpenPayModal(v)}>
                            ✕ Pendiente Comp. <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded ml-1">Cobrar</span>
                          </span>
                        )}
                      </p>
                    </div>
                     <div className="text-right">
                       <p className="text-[10px] uppercase font-bold text-stone-400">Total</p>
                       <p className="text-sm font-extrabold text-stone-800">{v.total_price}€</p>
                     </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-stone-500">Sesiones Disfrutadas</span>
                      <span className="text-stone-800">{v.used_sessions} / {v.total_sessions}</span>
                    </div>
                    <div className="h-2.5 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                      <div 
                        className={`h-full transition-all ${active ? 'bg-[#d9777f]' : 'bg-stone-300'}`} 
                        style={{ width: `${Math.min((v.used_sessions / v.total_sessions) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 items-center text-xs font-semibold text-stone-400">
                    <span className="flex-1">⏳ Vence: {new Date(v.expiration_date).toLocaleDateString()}</span>
                  </div>

                  {/* Acciones Rápidas */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-stone-50 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Link href={`/dashboard/clients/${v.client_id}`} className="flex-1 text-center py-2 bg-stone-50 text-stone-600 font-bold text-xs rounded-xl hover:bg-stone-100 transition-colors">
                       Ver Ficha
                     </Link>
                     <button onClick={() => handleDeleteVoucher(v.id)} className="px-3 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-bold transition-colors">
                       ✕
                     </button>
                  </div>
                </div>
              );
            })}
            
            {vouchers.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-stone-200 rounded-3xl">
                <p className="text-stone-400 font-medium">No hay bonos activos asignados a clientes.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ======================= TAB: CATÁLOGO PLANTILLAS ======================= */}
      {activeTab === 'catalogo' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-stone-800 block">Plantillas de Tratamiento</h2>
            <button 
              onClick={() => setShowTemplateModal(true)}
              className="bg-stone-800 hover:bg-stone-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
            >
              <span>+</span> Crear Plantilla
            </button>
          </div>
          
          <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-stone-50 border-b border-stone-100 text-xs uppercase tracking-wider font-bold text-stone-400">
                      <th className="p-5">Nombre de la Plantilla</th>
                      <th className="p-5">Tratamiento Válido</th>
                      <th className="p-5 text-center">Nº Sesiones</th>
                      <th className="p-5">Precio Sugerido</th>
                      <th className="p-5 text-right">Acciones</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                   {templates.length === 0 ? (
                      <tr><td colSpan={5} className="p-10 text-center text-stone-400 font-medium">El catálogo está vacío. Crea tu primer bono base.</td></tr>
                   ) : templates.map(t => (
                      <tr key={t.id} className="hover:bg-stone-50/50 transition-colors group">
                         <td className="p-5 font-bold text-stone-800">{t.name}</td>
                         <td className="p-5 font-medium text-stone-500 text-sm">{getServiceName(t.service_id)}</td>
                         <td className="p-5 text-center">
                            <span className="inline-block bg-[#fdf2f3] text-[#d9777f] font-extrabold text-xs px-3 py-1 rounded-lg">
                              {t.total_sessions} ses.
                            </span>
                         </td>
                         <td className="p-5 font-extrabold text-stone-700">{t.price} €</td>
                         <td className="p-5 text-right">
                            <button 
                              onClick={() => handleDeleteTemplate(t.id)}
                              className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-colors ml-auto opacity-0 group-hover:opacity-100"
                              title="Eliminar plantilla"
                            >
                              ✕
                            </button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </>
      )}

      {/* ======================= MODAL: EMITIR BONO (ASSIGNMENT) ======================= */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h2 className="text-xl font-extrabold text-stone-800">Emitir / Vender Bono</h2>
              <button onClick={() => setShowAssignModal(false)} className="text-stone-400 hover:text-stone-600 font-bold p-2">✕</button>
            </div>

            <form onSubmit={handleAssignVoucher} className="p-6 overflow-y-auto max-h-[75vh]">
              {/* 1. Seleccionar Cliente */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Cliente Receptor</label>
                <select 
                  required 
                  value={selectedClientId} 
                  onChange={e => setSelectedClientId(e.target.value)}
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-800 focus:outline-none focus:border-[#d9777f] focus:ring-1 focus:ring-[#d9777f]"
                >
                  <option value="">Selecciona cliente...</option>
                  {clients
                    .filter(c => c.email !== 'contado@clinica-mercedes.com')
                    .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* 2. Seleccionar Plantilla con Buscador */}
              <div className="mb-6 p-4 bg-stone-50 border border-stone-200 rounded-2xl relative">
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Elegir Plantilla del Catálogo</label>
                {!selectedTemplateId ? (
                   <>
                      <input 
                        type="text" 
                        placeholder="Buscar plantilla..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-3 mb-2 bg-white border border-stone-200 rounded-xl text-sm outline-none"
                      />
                      <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                         {filteredTemplates.length === 0 && <p className="text-xs text-stone-400">No se encontraron plantillas.</p>}
                         {filteredTemplates.map(t => (
                            <div 
                              key={t.id} 
                              onClick={() => handleSelectTemplateForAssignment(t.id)}
                              className="p-3 bg-white border border-stone-100 rounded-xl hover:border-[#d9777f] hover:shadow-sm cursor-pointer transition-all flex justify-between items-center"
                            >
                               <div>
                                 <p className="font-bold text-stone-700 text-sm">{t.name}</p>
                                 <p className="text-xs text-stone-400">{t.total_sessions} Sesiones</p>
                               </div>
                               <span className="font-extrabold text-[#d9777f]">{t.price}€</span>
                            </div>
                         ))}
                      </div>
                   </>
                ) : (
                   <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#f3c7cb] shadow-inner">
                      <div>
                         <p className="font-bold text-stone-800 text-sm">{templates.find(t => t.id === selectedTemplateId)?.name}</p>
                         <p className="text-xs text-[#d9777f] font-semibold mt-0.5">{templates.find(t => t.id === selectedTemplateId)?.total_sessions} Sesiones a consumir</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setSelectedTemplateId('')}
                        className="text-xs font-bold text-stone-400 underline hover:text-stone-600"
                      >Cambiar</button>
                   </div>
                )}
              </div>

              {/* 3. Condiciones Financieras (Sólo viables si seleccionamos plantilla) */}
              <div className={`transition-all duration-300 ${selectedTemplateId ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden'}`}>
                 <h3 className="text-sm font-extrabold text-stone-800 mb-3 border-b border-stone-100 pb-2">Acuerdo Financiero & Caducidad</h3>
                 
                 <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-500 tracking-wide mb-1">Precio Final Acordado (€)</label>
                      <input 
                        type="number" step="0.01" required 
                        value={assignPrice} onChange={e => setAssignPrice(Number(e.target.value))}
                        className="w-full p-3 bg-white border border-stone-200 border-l-4 border-l-stone-400 rounded-xl font-extrabold text-stone-800 outline-none focus:border-l-[#d9777f]"
                      />
                      <p className="text-[10px] text-stone-400 mt-1 leading-tight">Valor por defecto provisto por la plantilla. Puedes ajustarlo si existe descuento.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-emerald-600 tracking-wide mb-1">Pago Inicial Hoy (€)</label>
                      <input 
                        type="number" step="0.01" required min="0" max={Number(assignPrice)}
                        value={assignAmountPaid} onChange={e => setAssignAmountPaid(Number(e.target.value))}
                        className="w-full p-3 bg-white border border-stone-200 border-l-4 border-l-emerald-400 rounded-xl font-extrabold text-stone-800 outline-none focus:border-l-emerald-600 focus:bg-emerald-50/30"
                      />
                       <p className="text-[10px] text-stone-400 mt-1 leading-tight">Dinero adelantado por el cliente en el momento de crear el bono.</p>
                    </div>
                 </div>

                 <div className="mb-2">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Caducidad</label>
                    <select 
                      value={expirationMonths} onChange={e => setExpirationMonths(Number(e.target.value))}
                      className="w-full p-3 bg-white border border-stone-200 rounded-xl font-semibold text-stone-700 outline-none"
                    >
                      <option value={3}>3 meses desde la compra</option>
                      <option value={6}>6 meses desde la compra</option>
                      <option value={12}>12 meses desde la compra</option>
                      <option value={24}>2 años desde la compra</option>
                    </select>
                 </div>
              </div>
              
              <div className="mt-8">
                <button 
                  type="submit" 
                  disabled={saving || !selectedTemplateId} 
                  className="w-full py-4 rounded-xl font-extrabold text-white bg-[#d9777f] hover:bg-[#c6646b] shadow-md transition-colors disabled:opacity-50 flex justify-center items-center h-[56px]"
                >
                  {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Crear y Asignar Bono"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: CREAR PLANTILLA ======================= */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-6">
            <h2 className="text-xl font-extrabold text-stone-800 mb-6 flex justify-between">
              Crear Plantilla
              <button onClick={() => setShowTemplateModal(false)} className="text-stone-400">✕</button>
            </h2>

            <form onSubmit={handleCreateTemplate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Nombre (Ej: Bono 5 Ses. Axilas)</label>
                  <input required type="text" value={templateName} onChange={e => setTemplateName(e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Servicio / Tratamiento base</label>
                  <select 
                    required 
                    value={templateServiceId} 
                    onChange={e => {
                      setTemplateServiceId(e.target.value);
                      calculateTemplateDefaultPrice(e.target.value, templateSessions);
                    }} 
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-semibold"
                  >
                    <option value="">Seleccionar...</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.price}€/sesión)</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Sesiones</label>
                    <input 
                      required type="number" min="1" 
                      value={templateSessions} 
                      onChange={e => {
                        const sess = Number(e.target.value);
                        setTemplateSessions(sess);
                        calculateTemplateDefaultPrice(templateServiceId, sess);
                      }} 
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-semibold" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Total (€)</label>
                    <input required type="number" step="0.01" value={templatePrice} onChange={e => setTemplatePrice(Number(e.target.value))} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-extrabold text-[#d9777f]" />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                 <button type="button" onClick={() => setShowTemplateModal(false)} className="flex-1 py-3 text-stone-600 font-bold border border-stone-200 rounded-xl hover:bg-stone-50">Cancelar</button>
                 <button type="submit" disabled={saving} className="flex-1 py-3 text-white bg-stone-800 font-bold rounded-xl hover:bg-stone-900 shadow-md">
                   {saving ? 'Guardando...' : 'Guardar'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: SALDAR DEUDA ======================= */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-6">
            <h2 className="text-xl font-extrabold text-stone-800 mb-6 flex justify-between">
              Añadir Pago
              <button onClick={() => setShowPayModal(false)} className="text-stone-400">✕</button>
            </h2>

            <form onSubmit={handlePayDebt}>
              <p className="text-sm text-stone-500 mb-4 bg-stone-50 p-3 rounded-lg border border-stone-100">
                La deuda actual de este bono es de <strong className="text-rose-500">{currentDebt}€</strong>.
              </p>
              
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Monto abonado HOY (€)</label>
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  max={currentDebt}
                  value={payAmount} 
                  onChange={e => setPayAmount(Number(e.target.value))} 
                  className="w-full p-4 bg-white border border-stone-200 border-l-4 border-l-[#d9777f] rounded-xl font-extrabold text-stone-800 outline-none text-xl" 
                />
                <p className="text-[10px] text-stone-400 mt-1">Este importe se sumará al saldo pagado del bono. Permite pagos parciales.</p>
              </div>

              <div className="mt-8 flex gap-3">
                 <button type="button" onClick={() => setShowPayModal(false)} className="flex-1 py-3 text-stone-600 font-bold border border-stone-200 rounded-xl hover:bg-stone-50">Cancelar</button>
                 <button type="submit" disabled={paying} className="flex-1 py-3 text-white bg-[#d9777f] font-bold rounded-xl hover:bg-[#c6646b] shadow-md flex justify-center items-center">
                   {paying ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Confirmar Cobro'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
