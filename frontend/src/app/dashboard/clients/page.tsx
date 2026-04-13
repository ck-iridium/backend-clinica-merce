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
import { MoreHorizontal, FileText, User as UserIcon, UserPlus } from "lucide-react";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

export default function ClientsPage() {
  const { showFeedback } = useFeedback();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', allergies: '', dni: '', address: '' });
      toast.success('Cliente registrado correctamente');
    } catch (err) {
      toast.error("No se pudo guardar la ficha. Verifica la conexión.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-serif font-light text-stone-800 tracking-tight">Directorio de Clientes</h1>
          <p className="text-stone-400 mt-1.5 text-sm font-medium">Gestión de fichas médicas e historiales</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <button className="bg-stone-900 text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-[#d9777f] transition-all active:scale-95 shadow-lg shadow-stone-200 flex items-center gap-2 group">
              <UserPlus size={18} className="group-hover:rotate-12 transition-transform" />
              Añadir Cliente
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
            <DialogHeader className="p-10 pb-0">
              <DialogTitle className="text-3xl font-serif font-light text-stone-800 tracking-tight">
                Nueva Ficha Médica
              </DialogTitle>
              <DialogDescription className="text-stone-400 text-sm mt-1">
                Completa los datos para dar de alta al cliente en el sistema.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">Nombre completo *</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => {setFormData({...formData, name: e.target.value}); setErrors({...errors, name: ''});}} 
                    className={`w-full px-6 py-4 rounded-2xl border bg-stone-50/50 transition-all ${errors.name ? 'border-red-300 focus:ring-red-100' : 'border-stone-100 focus:ring-stone-100 focus:bg-white'} outline-none focus:ring-4`} 
                    placeholder="Ana Martínez" 
                  />
                  {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">Correo electrónico *</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => {setFormData({...formData, email: e.target.value}); setErrors({...errors, email: ''});}} 
                    className={`w-full px-6 py-4 rounded-2xl border bg-stone-50/50 transition-all ${errors.email ? 'border-red-300 focus:ring-red-100' : 'border-stone-100 focus:ring-stone-100 focus:bg-white'} outline-none focus:ring-4`} 
                    placeholder="ana@email.com" 
                  />
                  {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">Teléfono móvil</label>
                  <input 
                    type="tel" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                    className="w-full px-6 py-4 rounded-2xl border border-stone-100 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all" 
                    placeholder="+34 600..." 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">DNI / NIF</label>
                  <input 
                    type="text" 
                    value={formData.dni} 
                    onChange={e => setFormData({...formData, dni: e.target.value})} 
                    className="w-full px-6 py-4 rounded-2xl border border-stone-100 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all" 
                    placeholder="00000000X (Opcional)" 
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">Dirección Fiscal Completa</label>
                  <input 
                    type="text" 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                    className="w-full px-6 py-4 rounded-2xl border border-stone-100 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all" 
                    placeholder="Calle Ejemplar 123, Madrid (Opcional)" 
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">Alergias / Notas críticas</label>
                  <input 
                    type="text" 
                    value={formData.allergies} 
                    onChange={e => setFormData({...formData, allergies: e.target.value})} 
                    className="w-full px-6 py-4 rounded-2xl border border-stone-100 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all" 
                    placeholder="Alergia al látex, medicamentos..." 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-4 rounded-full text-xs font-bold text-stone-400 hover:text-stone-600 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  disabled={saving} 
                  type="submit" 
                  className="bg-[#bf7d6b] hover:bg-[#a66a5a] disabled:opacity-50 text-white px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-[#bf7d6b]/20 active:scale-95"
                >
                  {saving ? 'Registrando...' : 'Registrar Ficha'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
                  .map((client, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    key={client.id} 
                    className="hover:bg-muted/30 group transition-colors"
                  >
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
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
