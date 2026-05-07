"use client"
import { useState, useEffect, useRef } from 'react';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuthRole } from '@/hooks/useAuthRole';
import { Skeleton } from '@/components/ui/skeleton';
import { Save, Building2, SearchCode, ImageIcon, Hash, Clock, Calendar, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Importación de Pestañas
import GeneralTab from './tabs/GeneralTab';
import AgendaTab from './tabs/AgendaTab';
import BillingTab from './tabs/BillingTab';
import BrandingTab from './tabs/BrandingTab';
import AdvancedTab from './tabs/AdvancedTab';

export default function SettingsPage() {
  const { showFeedback } = useFeedback();
  const router = useRouter();
  const { role, loading: loadingRole } = useAuthRole();
  const [settings, setSettings] = useState<any>(null);
  const [timeBlocks, setTimeBlocks] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');

  // Modal de Ausencias
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [newBlock, setNewBlock] = useState({ start_time: '', end_time: '', reason: '', is_annual_holiday: false });
  const [addingBlock, setAddingBlock] = useState(false);
  
  // File inputs refs
  const logoAppRef = useRef<HTMLInputElement>(null);
  const logoPdfRef = useRef<HTMLInputElement>(null);
  const sigRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loadingRole) {
      const currentRole = role?.toLowerCase();
      if (currentRole !== 'administrador' && currentRole !== 'admin') {
        router.replace('/dashboard');
        toast.error("Acceso denegado: Solo los administradores pueden gestionar los ajustes.");
      } else {
        fetchSettings();
      }
    }
  }, [role, loadingRole, router]);

  const fetchSettings = async () => {
    try {
      const [settingsRes, blocksRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/time-blocks/`)
      ]);
      
      if (settingsRes.ok) {
        const remoteSettings = await settingsRes.json();
        const savedDays = localStorage.getItem('mercestetica_working_days');
        if (savedDays) {
          remoteSettings.working_days = JSON.parse(savedDays);
        } else if (!remoteSettings.working_days) {
          remoteSettings.working_days = [1, 2, 3, 4, 5];
        }
        setSettings(remoteSettings);
      }
      if (blocksRes.ok) {
        setTimeBlocks(await blocksRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const { id, ...payload } = settings;
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      toast.success('Ajustes actualizados correctamente');
    } catch (e) {
      console.error(e);
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingBlock(true);
    try {
      const payload = {
        ...newBlock,
        start_time: new Date(newBlock.start_time).toISOString(),
        end_time: new Date(newBlock.end_time).toISOString()
      };
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/time-blocks/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success('Ausencia añadida correctamente');
        setShowBlockModal(false);
        fetchSettings();
      } else {
        toast.error('Error al añadir la ausencia');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error de red al añadir');
    } finally {
      setAddingBlock(false);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta ausencia?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/time-blocks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Ausencia eliminada');
        fetchSettings();
      } else {
        toast.error('Error al eliminar');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error de red');
    }
  };

  const handleImageUpload = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max_size = 500;
        if (width > height) {
          if (width > max_size) { height *= max_size / width; width = max_size; }
        } else {
          if (height > max_size) { width *= max_size / height; height = max_size; }
        }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/png', 0.8);
        setSettings({ ...settings, [field]: dataUrl });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (loading || loadingRole || !settings || (role?.toLowerCase() !== 'administrador' && role?.toLowerCase() !== 'admin')) {
     return (
       <div className="flex flex-col gap-4 justify-center items-center h-[60vh] animate-in fade-in duration-500">
         <Skeleton className="w-16 h-16 rounded-2xl" />
         <Skeleton className="w-48 h-6 rounded-xl" />
       </div>
     );
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-[1200px] mx-auto pb-20">
      {/* CABECERA */}
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif font-semibold text-stone-800 tracking-tight">Ajustes</h1>
          <p className="text-stone-400 font-medium mt-1">Configura la identidad y operativa de tu clínica.</p>
        </div>
        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="bg-stone-900 hover:bg-[#d4af37] text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
        >
          <Save size={16} strokeWidth={1.5} />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* SIDEBAR */}
        <aside className="w-full md:w-64 shrink-0 bg-white border border-stone-100 rounded-[2rem] p-3 shadow-sm sticky top-24">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-hide">
            {[
              { id: 'general', label: 'General', icon: Building2 },
              { id: 'agenda', label: 'Agenda', icon: Clock },
              { id: 'billing', label: 'Facturación', icon: Hash },
              { id: 'branding', label: 'Branding', icon: ImageIcon },
              { id: 'advanced', label: 'Avanzado', icon: SearchCode },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap
                  ${activeTab === tab.id 
                    ? 'bg-stone-900 text-white shadow-md shadow-stone-200' 
                    : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'}`}
              >
                <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2 : 1.5} />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* PANEL DINÁMICO */}
        <div className="flex-1 w-full">
          {activeTab === 'general' && <GeneralTab settings={settings} setSettings={setSettings} />}
          {activeTab === 'agenda' && (
            <AgendaTab 
              settings={settings} 
              setSettings={setSettings} 
              timeBlocks={timeBlocks} 
              setShowBlockModal={setShowBlockModal} 
              handleDeleteBlock={handleDeleteBlock} 
            />
          )}
          {activeTab === 'billing' && (
            <BillingTab 
              settings={settings} 
              setSettings={setSettings} 
              logoPdfRef={logoPdfRef} 
              sigRef={sigRef} 
              handleImageUpload={handleImageUpload} 
            />
          )}
          {activeTab === 'branding' && (
            <BrandingTab 
              settings={settings} 
              logoAppRef={logoAppRef} 
              handleImageUpload={handleImageUpload} 
            />
          )}
          {activeTab === 'advanced' && <AdvancedTab settings={settings} setSettings={setSettings} />}
        </div>
      </div>

      {/* MODAL AUSENCIAS (Centralizado en el padre) */}
      <Dialog open={showBlockModal} onOpenChange={setShowBlockModal}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-[#fcf8e5] p-6 pb-4 border-b border-stone-100">
             <DialogHeader>
                <DialogTitle className="text-2xl font-serif text-stone-800">Añadir Nueva Ausencia</DialogTitle>
                <DialogDescription className="text-stone-500 font-medium pt-1">
                  Bloquea la agenda para festivos o vacaciones.
                </DialogDescription>
             </DialogHeader>
          </div>
          <form onSubmit={handleAddBlock} className="p-6 pt-4 bg-white grid gap-5">
            <div className="grid gap-2">
              <label className="text-xs font-bold text-stone-500">Motivo (Ej. Vacaciones de Verano)</label>
              <input required type="text" value={newBlock.reason} onChange={e => setNewBlock({...newBlock, reason: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d4af37] transition-all outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-xs font-bold text-stone-500">Inicio</label>
                <input required type="date" value={newBlock.start_time} onChange={e => setNewBlock({...newBlock, start_time: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d4af37] font-mono text-sm outline-none" />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-stone-500">Fin</label>
                <input required type="date" value={newBlock.end_time} onChange={e => setNewBlock({...newBlock, end_time: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d4af37] font-mono text-sm outline-none" />
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-stone-50 rounded-xl border border-stone-100">
                <div className="relative">
                  <input type="checkbox" checked={newBlock.is_annual_holiday} onChange={e => setNewBlock({...newBlock, is_annual_holiday: e.target.checked})} className="sr-only" />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${newBlock.is_annual_holiday ? 'bg-[#d4af37]' : 'bg-stone-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${newBlock.is_annual_holiday ? 'translate-x-4' : ''}`}></div>
                </div>
                <span className="text-xs font-bold text-stone-700">Se repite anualmente</span>
            </label>
            <div className="flex justify-end gap-3 mt-4">
               <button type="button" onClick={() => setShowBlockModal(false)} className="px-4 py-2 text-stone-500 font-bold hover:bg-stone-100 rounded-xl transition-colors">Cancelar</button>
               <button type="submit" disabled={addingBlock} className="px-6 py-2 bg-stone-900 text-white font-bold rounded-xl shadow-sm hover:bg-stone-800 transition-colors disabled:opacity-50">
                 {addingBlock ? 'Guardando...' : 'Añadir Ausencia'}
               </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
