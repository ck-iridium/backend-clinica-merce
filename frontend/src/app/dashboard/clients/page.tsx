"use client"
import { useState, useEffect } from 'react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  allergies: string | null;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Validation and Data States
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', allergies: '' });
  const [errors, setErrors] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/`);
      if (res.ok) setClients(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    let valid = true;
    const newErrors = { name: '', email: '' };
    
    if (!formData.name.trim()) { 
      newErrors.name = 'El nombre completo es obligatorio'; 
      valid = false; 
    }
    
    const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!formData.email.trim() || !emailPattern.test(formData.email)) {
      newErrors.email = 'Introduce un correo válido'; 
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error("Error en el servidor al guardar");
      
      await fetchClients(); // Recargar datos
      setShowForm(false);
      setFormData({ name: '', email: '', phone: '', allergies: '' });
    } catch (err) {
      alert("No se pudo guardar la ficha. Verifica tu conexión a Render.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-800">Directorio de Pacientes</h1>
          <p className="text-stone-500 mt-1 font-medium">Gestión de fichas médicas e historiales</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-md ${showForm ? 'bg-stone-200 text-stone-700 hover:bg-stone-300' : 'bg-[#d9777f] text-white hover:bg-[#c6646b] hover:shadow-lg'}`}>
          {showForm ? 'Descartar' : '+ Añadir Paciente'}
        </button>
      </div>

      {/* Creation Form */}
      {showForm && (
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-[#fdf2f3] border border-[#f3c7cb] mb-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#fdf2f3] rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2"></div>
          
          <h2 className="text-2xl font-bold text-stone-800 mb-6 border-b border-stone-100 pb-4 relative z-10">Nueva Ficha Médica</h2>
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Nombre completo *</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => {setFormData({...formData, name: e.target.value}); setErrors({...errors, name: ''});}} 
                  className={`w-full px-5 py-4 rounded-xl border bg-stone-50 focus:bg-white transition-colors ${errors.name ? 'border-red-400 focus:ring-red-400' : 'border-stone-200 focus:ring-[#d9777f]'} focus:outline-none focus:ring-2`} 
                  placeholder="Ana Martínez" 
                />
                {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Correo electrónico *</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => {setFormData({...formData, email: e.target.value}); setErrors({...errors, email: ''});}} 
                  className={`w-full px-5 py-4 rounded-xl border bg-stone-50 focus:bg-white transition-colors ${errors.email ? 'border-red-400 focus:ring-red-400' : 'border-stone-200 focus:ring-[#d9777f]'} focus:outline-none focus:ring-2`} 
                  placeholder="ana@email.com" 
                />
                {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Teléfono móvil</label>
                <input 
                  type="tel" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  className="w-full px-5 py-4 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d9777f] transition-colors" 
                  placeholder="+34 600..." 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Alergias / Notas críticas</label>
                <input 
                  type="text" 
                  value={formData.allergies} 
                  onChange={e => setFormData({...formData, allergies: e.target.value})} 
                  className="w-full px-5 py-4 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d9777f] transition-colors" 
                  placeholder="Alergia al látex, medicamentos..." 
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button disabled={saving} type="submit" className="bg-stone-900 hover:bg-[#d9777f] disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95">
                {saving ? 'Registrando...' : 'Registrar Paciente'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-100 text-stone-400 text-xs font-bold tracking-widest uppercase">
                <th className="px-8 py-5">Paciente</th>
                <th className="px-8 py-5">Contacto</th>
                <th className="px-8 py-5">Alertas Médicas</th>
                <th className="px-8 py-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-16">
                    <div className="inline-block w-8 h-8 border-4 border-[#f3c7cb] border-t-[#d9777f] rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-16 text-stone-400 font-medium">Aún no hay pacientes registrados en el sistema. Usa el botón superior para añadir uno.</td></tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-[#fdf2f3] group transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-bold font-serif shadow-sm">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-stone-800 text-base">{client.name}</div>
                          <div className="text-xs text-stone-400 mt-0.5 font-mono">ID: {client.id.split('-')[0]}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-stone-700 font-medium text-sm">{client.email}</div>
                      <div className="text-stone-500 text-xs mt-1">{client.phone || 'Sin teléfono'}</div>
                    </td>
                    <td className="px-8 py-6">
                      {client.allergies ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span>
                          {client.allergies}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100 shadow-sm">
                          Ninguna
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <a href={`/dashboard/clients/${client.id}`} className="inline-block text-stone-400 group-hover:text-[#d9777f] font-bold text-sm bg-white border border-stone-200 group-hover:border-[#d9777f] px-4 py-2 rounded-lg transition-all shadow-sm active:scale-95">
                        Ficha
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
