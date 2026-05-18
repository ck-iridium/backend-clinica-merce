"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Eye, UserPlus } from "lucide-react";
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/app/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  allergies: string | null;
  dni?: string | null;
  address?: string | null;
}

export default function ClientsPage() {
  const { t } = useLanguage();
  const { showFeedback } = useFeedback();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
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
      newErrors.name = t('dashboard.clients.name_required') || 'El nombre completo es obligatorio'; 
      valid = false; 
    }
    
    const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!formData.email.trim() || !emailPattern.test(formData.email)) {
      newErrors.email = t('dashboard.clients.email_invalid') || 'Introduce un correo válido'; 
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
      
      if (!res.ok) throw new Error(t('dashboard.clients.server_error') || "Error en el servidor al guardar");
      
      await fetchClients(); // Recargar datos
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', allergies: '', dni: '', address: '' });
      toast.success(t('dashboard.clients.client_registered') || 'Cliente registrado correctamente');
    } catch (err) {
      toast.error(t('dashboard.clients.save_error') || "No se pudo guardar la ficha. Verifica la conexión.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-serif font-light text-stone-800 tracking-tight">
            {t('dashboard.clients.directory_title') || 'Directorio de Clientes'}
          </h1>
          <p className="text-stone-400 mt-1.5 text-sm font-medium">
            {t('dashboard.clients.directory_subtitle') || 'Gestión de fichas médicas e historiales'}
          </p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <button className="bg-stone-900 text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-[#d9777f] transition-all active:scale-95 shadow-lg shadow-stone-200 flex items-center gap-2 group">
              <UserPlus size={18} className="group-hover:rotate-12 transition-transform" />
              {t('dashboard.clients.add_client') || 'Añadir Cliente'}
            </button>
          </DialogTrigger>
          <DialogContent className="p-0 border-none max-w-2xl bg-white rounded-2xl overflow-hidden">
            <DialogHeader className="p-8 md:p-10 pb-6 border-b border-stone-100 bg-white relative z-10 rounded-t-xl">
              <DialogTitle className="text-3xl font-serif font-light text-stone-800 tracking-tight">
                {t('dashboard.clients.new_medical_record') || 'Nueva Ficha Médica'}
              </DialogTitle>
              <DialogDescription className="text-stone-400 text-sm mt-1">
                {t('dashboard.clients.new_medical_record_desc') || 'Completa los datos para dar de alta al cliente en el sistema.'}
              </DialogDescription>
            </DialogHeader>

            <form id="client-form" onSubmit={handleSubmit} className="flex flex-col bg-white">
              <div className="px-8 md:px-10 py-6 pb-32 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">
                      {t('dashboard.clients.full_name_label') || 'Nombre completo *'}
                    </label>
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
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">
                      {t('dashboard.clients.email_label') || 'Correo electrónico *'}
                    </label>
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
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">
                      {t('dashboard.clients.phone_label') || 'Teléfono móvil'}
                    </label>
                    <input 
                      type="tel" 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})} 
                      className="w-full px-6 py-4 rounded-2xl border border-stone-100 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all" 
                      placeholder="+34 600..." 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">
                      {t('dashboard.clients.dni_label') || 'DNI / NIF'}
                    </label>
                    <input 
                      type="text" 
                      value={formData.dni} 
                      onChange={e => setFormData({...formData, dni: e.target.value})} 
                      className="w-full px-6 py-4 rounded-2xl border border-stone-100 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all" 
                      placeholder={t('dashboard.clients.dni_placeholder') || "00000000X (Opcional)"} 
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">
                      {t('dashboard.clients.address_label') || 'Dirección Fiscal Completa'}
                    </label>
                    <input 
                      type="text" 
                      value={formData.address} 
                      onChange={e => setFormData({...formData, address: e.target.value})} 
                      className="w-full px-6 py-4 rounded-2xl border border-stone-100 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all" 
                      placeholder={t('dashboard.clients.address_placeholder') || "Calle Ejemplar 123, Madrid (Opcional)"} 
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">
                      {t('dashboard.clients.allergies_label') || 'Alergias / Notas críticas'}
                    </label>
                    <input 
                      type="text" 
                      value={formData.allergies} 
                      onChange={e => setFormData({...formData, allergies: e.target.value})} 
                      className="w-full px-6 py-4 rounded-2xl border border-stone-100 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all" 
                      placeholder={t('dashboard.clients.allergies_placeholder') || "Alergia al látex, medicamentos..."} 
                    />
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 left-0 w-full flex justify-end gap-3 p-8 md:p-10 py-6 border-t border-stone-100 bg-white rounded-b-2xl z-20">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-4 rounded-full text-xs font-bold text-stone-400 hover:text-stone-600 transition-all"
                >
                  {t('dashboard.clients.cancel') || 'Cancelar'}
                </button>
                <button 
                  disabled={saving} 
                  type="submit" 
                  className="bg-[#bf7d6b] hover:bg-[#a66a5a] disabled:opacity-50 text-white px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-[#bf7d6b]/20 active:scale-95"
                >
                  {saving ? (t('dashboard.clients.registering') || 'Registrando...') : (t('dashboard.clients.register_record') || 'Registrar Ficha')}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table Section (SaaS Island) */}
      <div className="bg-card rounded-[2rem] shadow-sm overflow-hidden border border-border/40 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="bg-muted/50 border-b border-border/50 text-muted-foreground text-xs font-bold tracking-widest uppercase">
                <th className="px-8 py-4 font-semibold">{t('dashboard.clients.client') || 'Cliente'}</th>
                <th className="px-8 py-4 font-semibold">{t('dashboard.clients.contact') || 'Contacto'}</th>
                <th className="px-8 py-4 font-semibold">{t('dashboard.clients.medical_alerts') || 'Alertas Médicas'}</th>
                <th className="px-8 py-4 font-semibold text-right">{t('dashboard.clients.actions') || 'Acciones'}</th>
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
                <tr>
                  <td colSpan={4} className="text-center py-24 text-muted-foreground font-medium text-sm">
                    {t('dashboard.clients.no_clients') || 'Aún no hay clientes registrados en el sistema.'}
                  </td>
                </tr>
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
                          <div className="font-bold text-stone-800 text-sm">{client.name}</div>
                          <div className="text-[11px] text-stone-400 mt-0.5 font-mono">ID: {client.id.split('-')[0]}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-stone-700 font-medium text-sm">{client.email}</div>
                      <div className="text-stone-400 text-xs mt-0.5">
                        {client.phone || (t('dashboard.clients.no_phone') || 'Sin teléfono')}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {client.allergies ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive mr-1.5"></span>
                          {client.allergies}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                          {t('dashboard.clients.none') || 'Ninguna'}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link 
                        href={`/dashboard/clients/${client.id}`}
                        className="p-2.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-[#d9777f] transition-all border border-transparent hover:border-stone-100 inline-flex items-center justify-center group/eye"
                        title={t('dashboard.clients.view_full_record') || "Ver ficha completa"}
                      >
                        <Eye size={18} strokeWidth={1.5} className="group-hover/eye:scale-110 transition-transform" />
                      </Link>
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
