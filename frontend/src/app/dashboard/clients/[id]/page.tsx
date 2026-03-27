"use client"
import { useState, useEffect } from 'react';

export default function ClientProfilePage({ params }: { params: { id: string } }) {
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClient();
  }, [params.id]);

  const fetchClient = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setClient(data);
        setFormData(data);
      }
    } catch (err) {
      console.error("Error fetching client", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone === '' ? null : formData.phone,
          allergies: formData.allergies === '' ? null : formData.allergies,
          medical_history: formData.medical_history === '' ? null : formData.medical_history
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setClient(updated);
        setIsEditing(false);
      } else {
        alert("Error al guardar los cambios.");
      }
    } catch (err) {
      alert("Error de conexión fallida.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-20 text-center">
      <div className="inline-block w-8 h-8 border-4 border-[#f3c7cb] border-t-[#d9777f] rounded-full animate-spin mb-4"></div>
      <p className="text-stone-500 font-medium">Leyendo historial médico...</p>
    </div>
  );
  
  if (!client) return <div className="p-10 text-stone-500 text-center font-bold text-xl">Paciente no encontrado</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <a href="/dashboard/clients" className="text-sm font-semibold text-stone-400 hover:text-[#d9777f] mb-6 inline-flex items-center transition-colors">
        ← Volver al directorio
      </a>

      {/* Header Profile */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100 flex flex-col md:flex-row gap-8 items-start mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#fdf2f3] to-white rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="w-24 h-24 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-300 font-serif text-5xl shadow-inner z-10 font-bold shrink-0">
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div className="z-10 flex-1 w-full">
          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-1">Nombre</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#d9777f] outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#d9777f] outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-1">Teléfono</label>
                  <input type="tel" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#d9777f] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-1">Alergias</label>
                  <input type="text" value={formData.allergies || ''} onChange={e => setFormData({...formData, allergies: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#d9777f] outline-none" placeholder="Sin alergias" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-1">Historial y Observaciones</label>
                  <textarea value={formData.medical_history || ''} onChange={e => setFormData({...formData, medical_history: e.target.value})} rows={3} className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#d9777f] outline-none" placeholder="Añadir notas médicas..."></textarea>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="bg-[#d9777f] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#c6646b] transition-all disabled:opacity-50">
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button type="button" onClick={() => {setIsEditing(false); setFormData(client);}} className="bg-stone-100 text-stone-600 px-6 py-2.5 rounded-xl font-bold hover:bg-stone-200 transition-all">
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="text-4xl font-extrabold text-stone-900 mb-2">{client.name}</h1>
              <p className="text-stone-500 text-lg">{client.email} {client.phone && `• ${client.phone}`}</p>
              <div className="mt-6 flex flex-wrap gap-4">
                <button className="bg-[#d9777f] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#c6646b] shadow-md transition-all active:scale-95 border border-transparent">
                  Reservar Cita
                </button>
                <button onClick={() => setIsEditing(true)} className="bg-stone-50 text-stone-600 px-6 py-2.5 rounded-xl font-bold hover:bg-stone-100 border border-stone-200 transition-all active:scale-95 shadow-sm">
                  Editar Ficha
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Alerts & Medical Info */}
        <div className="md:col-span-1 bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100">
          <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 shadow-sm border border-red-100">⚠️</span>
            Alertas Médicas
          </h3>
          {client.allergies ? (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-800 font-medium">
              {client.allergies}
            </div>
          ) : (
            <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 font-medium text-center">
              Sin alergias o precauciones registradas.
            </div>
          )}
          
          <h3 className="text-lg font-bold text-stone-800 mb-4 mt-8 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100">📝</span>
            Observaciones Libres
          </h3>
          <p className="text-stone-500 text-sm leading-relaxed bg-stone-50 p-5 rounded-2xl border border-stone-100 shadow-inner min-h-[100px] whitespace-pre-wrap">
            {client.medical_history || 'No hay historial médico redactado aún.'}
          </p>
        </div>

        {/* Treatment History */}
        <div className="md:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100">
          <h3 className="text-xl font-bold text-stone-800 mb-6 border-b border-stone-50 pb-4">Historial de Tratamientos</h3>
          <div className="text-center py-16 bg-stone-50/50 rounded-2xl border border-stone-100 border-dashed">
            <span className="text-stone-300 text-5xl mb-4 block inline-block transform -rotate-6">📅</span>
            <p className="text-stone-500 font-medium text-lg">Cero tratamientos finalizados.</p>
            <p className="text-stone-400 text-sm mt-1">El paciente es nuevo en la plataforma.</p>
            <button className="mt-6 text-[#d9777f] font-bold text-sm bg-white px-5 py-2.5 rounded-xl border border-stone-200 shadow-sm hover:border-[#f3c7cb] transition-colors">
              + Añadir Tratamiento Manual
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
