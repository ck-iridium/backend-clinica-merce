"use client"
import { useState, useEffect } from 'react';

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const defaultForm = { name: '', description: '', duration_minutes: 30, price: 0, is_active: true };
  const [formData, setFormData] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/`);
      if (res.ok) setServices(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (svc: any) => {
    setEditingId(svc.id);
    setFormData({
      name: svc.name,
      description: svc.description || '',
      duration_minutes: svc.duration_minutes,
      price: svc.price,
      is_active: svc.is_active
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(defaultForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    setSaving(true);
    try {
      const url = editingId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/services/${editingId}` 
        : `${process.env.NEXT_PUBLIC_API_URL}/services/`;
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        await fetchServices();
        handleCancel();
      } else {
        alert("Error al guardar el servicio.");
      }
    } catch (err) {
      alert("Error de conexión.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-800">Catálogo de Servicios</h1>
          <p className="text-stone-500 mt-1 font-medium">Tratamientos, tiempos estimativos y tarifas base</p>
        </div>
        <button 
          onClick={() => showForm ? handleCancel() : setShowForm(true)}
          className={`px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 ${showForm ? 'bg-stone-200 text-stone-700' : 'bg-[#d4af37] hover:bg-[#b08e23] border border-transparent text-white'}`}>
          {showForm ? 'Cancelar' : '+ Nuevo Servicio'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-yellow-50 border border-yellow-100 mb-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2"></div>
          <h2 className="text-2xl font-bold text-stone-800 mb-6 border-b border-stone-100 pb-4 relative z-10 flex items-center gap-3">
            {editingId ? 'Editar Técnica de Tratamiento' : 'Alta Técnica de Tratamiento'}
          </h2>
          
          <form onSubmit={handleSubmit} className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Nombre del servicio *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all" placeholder="Ej: Láser Axilas" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Descripción pública</label>
                <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all" placeholder="El tratamiento perfecto para..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Duración (minutos) *</label>
                <input required type="number" min="5" step="5" value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: Number(e.target.value)})} className="w-full px-5 py-4 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all" />
                <p className="text-xs text-stone-400 mt-2 font-medium">Reserva el hueco total bloqueado en Agenda.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Precio Base (€) *</label>
                <input required type="number" min="0" step="0.5" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full px-5 py-4 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all" />
              </div>
            </div>
            <div className="flex justify-end border-t border-stone-100 pt-6">
              <button disabled={saving} type="submit" className="bg-stone-900 hover:bg-[#d4af37] disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95">
                {saving ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Añadir Servicio al Catálogo')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Services */}
      {loading ? (
        <div className="text-center py-20"><div className="inline-block w-8 h-8 border-4 border-yellow-100 border-t-[#d4af37] rounded-full animate-spin"></div></div>
      ) : services.length === 0 ? (
        <div className="text-center py-24 text-stone-400 bg-stone-50/50 rounded-[2rem] border border-stone-200 border-dashed">
          No hay servicios técnicos configurados. Añade el primer tratamiento arriba.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((svc) => (
            <div key={svc.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 hover:shadow-xl hover:shadow-yellow-50 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-50 to-transparent rounded-bl-[4rem] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="text-xl font-bold text-stone-800 pr-4">{svc.name}</h3>
                <span className="bg-[#fcf8e5] text-[#b08e23] font-bold px-3 py-1.5 rounded-xl text-sm shrink-0 whitespace-nowrap shadow-sm border border-yellow-100">
                  {svc.price} €
                </span>
              </div>
              
              <p className="text-stone-500 text-sm mb-8 line-clamp-3 min-h-[4rem] relative z-10 font-medium">
                {svc.description || 'Tratamiento genérico en clínica. Sin especificaciones adicionales.'}
              </p>
              
              <div className="flex justify-between items-center border-t border-stone-100 pt-4 mt-auto relative z-10">
                <div className="flex items-center gap-2 text-stone-400 text-sm font-semibold bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
                  <span className="text-[#d4af37] text-base leading-none">⏱</span> {svc.duration_minutes} min
                </div>
                <button onClick={() => handleEditClick(svc)} className="text-stone-400 hover:text-stone-800 font-bold text-sm bg-white border border-stone-200 px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all">
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
