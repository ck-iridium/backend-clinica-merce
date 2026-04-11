"use client"
import { useState, useEffect } from 'react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  allergies: string | null;
  dni?: string | null;
  address?: string | null;
}
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FileText, User as UserIcon } from "lucide-react";
import Link from 'next/link';

export default function ClientsPage() {
  const { showFeedback } = useFeedback();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Validation and Data States
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', allergies: '', dni: '', address: '' });
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
      setFormData({ name: '', email: '', phone: '', allergies: '', dni: '', address: '' });
    } catch (err) {
      showFeedback({ type: 'error', title: 'Error de Red', message: "No se pudo guardar la ficha. Verifica tu conexión a Render." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-serif text-stone-800">Directorio de Clientes</h1>
          <p className="text-muted-foreground mt-1 text-sm font-sans">Gestión de fichas médicas e historiales</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm ${showForm ? 'bg-stone-200 text-stone-700 hover:bg-stone-300' : 'bg-primary text-primary-foreground hover:opacity-90 hover:shadow-md'}`}>
          {showForm ? 'Cancelar' : '+ Añadir Cliente'}
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
                <label className="block text-sm font-semibold text-stone-700 mb-2">DNI / NIF</label>
                <input 
                  type="text" 
                  value={formData.dni} 
                  onChange={e => setFormData({...formData, dni: e.target.value})} 
                  className="w-full px-5 py-4 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d9777f] transition-colors" 
                  placeholder="00000000X (Opcional)" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-stone-700 mb-2">Dirección Fiscal Completa</label>
                <input 
                  type="text" 
                  value={formData.address} 
                  onChange={e => setFormData({...formData, address: e.target.value})} 
                  className="w-full px-5 py-4 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d9777f] transition-colors" 
                  placeholder="Calle Ejemplar 123, Madrid (Opcional)" 
                />
              </div>
              <div className="md:col-span-2">
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
                {saving ? 'Registrando...' : 'Registrar Cliente'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Section (SaaS Island) */}
      <div className="bg-card rounded-[2rem] shadow-sm overflow-hidden border border-border/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="bg-muted/50 border-b border-border/50 text-muted-foreground text-xs font-bold tracking-widest uppercase">
                <th className="px-8 py-4 font-semibold">Cliente</th>
                <th className="px-8 py-4 font-semibold">Contacto</th>
                <th className="px-8 py-4 font-semibold">Alertas Médicas</th>
                <th className="px-8 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </td>
                    <td className="px-8 py-6"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></td>
                  </tr>
                ))
              ) : clients.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-24 text-muted-foreground font-medium text-sm">Aún no hay clientes registrados en el sistema.</td></tr>
              ) : (
                clients
                  .filter(c => c.email !== 'contado@clinica-mercedes.com')
                  .map((client) => (
                  <tr key={client.id} className="hover:bg-muted/30 group transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-serif font-bold shadow-sm">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-foreground text-sm">{client.name}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">ID: {client.id.split('-')[0]}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-stone-700 font-medium text-sm">{client.email}</div>
                      <div className="text-muted-foreground text-xs mt-0.5">{client.phone || 'Sin teléfono'}</div>
                    </td>
                    <td className="px-8 py-5">
                      {client.allergies ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive mr-1.5"></span>
                          {client.allergies}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                          Ninguna
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors focus:outline-none">
                          <MoreHorizontal size={18} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/clients/${client.id}`} className="cursor-pointer flex items-center gap-2">
                              <UserIcon size={14} className="text-stone-500" />
                              Ver Ficha Completa
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/clients/${client.id}?tab=history`} className="cursor-pointer flex items-center gap-2">
                              <FileText size={14} className="text-stone-500" />
                              Historial Clínico
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
