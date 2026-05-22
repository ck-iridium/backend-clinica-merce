"use client"
import { useState, useEffect, useRef } from 'react';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuthRole } from '@/hooks/useAuthRole';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Save, Building2, SearchCode, ImageIcon, Hash, Clock, Calendar, Trash2, CreditCard, LayoutTemplate, Wallet } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Importación de Pestañas
import GeneralTab from './tabs/GeneralTab';
import SubscriptionTab from './tabs/SubscriptionTab';
import AgendaTab from './tabs/AgendaTab';
import BillingTab from './tabs/BillingTab';
import BrandingTab from './tabs/BrandingTab';
import AdvancedTab from './tabs/AdvancedTab';
import PaymentsTab from './tabs/PaymentsTab';
import BookingLayoutTab from './tabs/BookingLayoutTab';

export default function SettingsPage() {
  const { t } = useLanguage();
  const { showFeedback } = useFeedback();
  const router = useRouter();
  const { role, loading: loadingRole } = useAuthRole();
  const [settings, setSettings] = useState<any>(null);
  const [originalSettings, setOriginalSettings] = useState<any>(null);
  const [timeBlocks, setTimeBlocks] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

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
        setOriginalSettings(JSON.parse(JSON.stringify(remoteSettings)));
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

  useEffect(() => {
    if (settings && originalSettings) {
      const isDifferent = JSON.stringify(settings) !== JSON.stringify(originalSettings);
      setHasChanges(isDifferent);
    }
  }, [settings, originalSettings]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const { id, ...payload } = settings;
      
      // Sanitizar valores vacíos o NaN antes de enviarlos al backend
      if (payload.cancellation_margin_hours === "" || payload.cancellation_margin_hours === null || isNaN(payload.cancellation_margin_hours)) {
        payload.cancellation_margin_hours = 24;
      }
      if (payload.global_deposit_amount === "" || payload.global_deposit_amount === null || isNaN(payload.global_deposit_amount)) {
        payload.global_deposit_amount = 0;
      }
      if (payload.invoice_next_number === "" || payload.invoice_next_number === null || isNaN(payload.invoice_next_number)) {
        payload.invoice_next_number = 1;
      }
      if (payload.default_tax_rate === "" || payload.default_tax_rate === null || isNaN(payload.default_tax_rate)) {
        payload.default_tax_rate = 21;
      }
      if (payload.booking_margin_hours === "" || payload.booking_margin_hours === null || isNaN(payload.booking_margin_hours)) {
        payload.booking_margin_hours = 2.0;
      }

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setSettings({ ...settings, ...payload });
      setOriginalSettings(JSON.parse(JSON.stringify({ ...settings, ...payload })));
      setHasChanges(false);
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
    showFeedback({
      type: 'confirm',
      title: 'Eliminar Ausencia',
      message: '¿Estás seguro de que deseas eliminar este bloque horario? Esta acción no se puede deshacer.',
      onConfirm: async () => {
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
      }
    });
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
    <div className="animate-in fade-in duration-500 max-w-[1400px] w-full px-0 sm:px-4 md:px-8 pt-4 md:pt-0 pb-32 md:pb-20">
      {/* CABECERA (Desktop & Mobile) */}
      <div className="mb-3 md:mb-8 px-3 sm:px-0">
        <h1 className="text-3xl md:text-4xl font-serif font-semibold text-stone-800 tracking-tight">{t('dashboard.settings.title')}</h1>
        <p className="text-xs md:text-base text-stone-400 font-medium mt-1">{t('dashboard.settings.subtitle')}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-2 md:gap-8 items-start relative px-1 sm:px-0">
        {/* SIDEBAR (Desktop) / TOPBAR (Mobile) */}
        <aside className="w-full md:w-64 shrink-0 z-40 sticky top-1 md:top-6 bg-white border border-stone-200/50 rounded-2xl md:rounded-[2rem] p-3 shadow-sm md:shadow-none md:bg-transparent md:border-none md:p-0">
          <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible scrollbar-hide">
            {[
              { id: 'general', label: t('dashboard.settings.tabs.general'), icon: Building2 },
              { id: 'subscription', label: 'Plan & Suscripción', icon: CreditCard },
              { id: 'agenda', label: t('dashboard.settings.tabs.agenda'), icon: Clock },
              { id: 'billing', label: t('dashboard.settings.tabs.billing'), icon: Hash },
              { id: 'payments', label: t('dashboard.settings.tabs.payments'), icon: Wallet },
              { id: 'branding', label: t('dashboard.settings.tabs.branding'), icon: ImageIcon },
              { id: 'booking_ui', label: t('dashboard.settings.tabs.booking_ui'), icon: LayoutTemplate },
              { id: 'advanced', label: t('dashboard.settings.tabs.advanced'), icon: SearchCode },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-2.5 md:py-3.5 rounded-full md:rounded-2xl font-bold text-sm transition-all duration-300 whitespace-nowrap md:w-full md:justify-start
                    ${activeTab === tab.id
                    ? 'bg-stone-900 text-white shadow-md shadow-stone-200/50 font-bold'
                    : 'bg-stone-50 md:bg-transparent text-stone-500 hover:text-stone-700 hover:bg-stone-100 border border-stone-100 md:border-transparent font-medium'}`}
              >
                <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2 : 1.5} className={activeTab === tab.id ? 'text-[#d4af37]' : 'text-stone-400'} />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* BOTÓN GUARDAR (Desktop) */}
          <div className="hidden md:block mt-4 pt-4 border-t border-stone-200/50">
            <button
              onClick={() => handleSave()}
              disabled={saving || !hasChanges}
              className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm
                  ${hasChanges
                  ? 'bg-stone-900 text-white hover:bg-[#d4af37]'
                  : 'bg-stone-100 text-stone-300 cursor-not-allowed'}`}
            >
              <Save size={18} strokeWidth={1.5} />
              {saving ? t('dashboard.settings.saving') : t('dashboard.settings.save_changes')}
            </button>
            {!hasChanges && <p className="text-[10px] text-stone-300 text-center mt-2 font-medium italic">{t('dashboard.settings.no_changes')}</p>}
          </div>
        </aside>

        {/* PANEL DINÁMICO */}
        <div className="flex-1 w-full mt-0 relative z-10">
          {activeTab === 'general' && <GeneralTab settings={settings} setSettings={setSettings} />}
          {activeTab === 'subscription' && <SubscriptionTab />}
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
          {activeTab === 'payments' && <PaymentsTab settings={settings} setSettings={setSettings} />}
          {activeTab === 'booking_ui' && <BookingLayoutTab settings={settings} setSettings={setSettings} />}
          {activeTab === 'advanced' && <AdvancedTab settings={settings} setSettings={setSettings} />}
        </div>
      </div>

      {/* FAB STICKY (Mobile) */}
      <div className={`md:hidden fixed bottom-16 right-6 z-50 transition-all duration-300 ${hasChanges ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <button
          onClick={() => handleSave()}
          disabled={saving || !hasChanges}
          className="px-6 py-4 rounded-full font-bold bg-stone-900 text-white flex items-center justify-center gap-2 shadow-[0_8px_30px_rgb(0,0,0,0.2)] active:scale-95 transition-transform"
        >
          <Save size={18} strokeWidth={1.5} />
          {saving ? t('dashboard.settings.saving') : t('dashboard.general.save')}
        </button>
      </div>

      {/* MODAL AUSENCIAS */}

      {/* MODAL AUSENCIAS (Centralizado en el padre) */}
      <Dialog open={showBlockModal} onOpenChange={setShowBlockModal}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-[#fcf8e5] p-6 pb-4 border-b border-stone-100">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif text-stone-800">{t('dashboard.settings.absences.add_title')}</DialogTitle>
              <DialogDescription className="text-stone-500 font-medium pt-1">
                {t('dashboard.settings.absences.add_desc')}
              </DialogDescription>
            </DialogHeader>
          </div>
          <form onSubmit={handleAddBlock} className="p-6 pt-4 bg-white grid gap-5">
            <div className="grid gap-2">
              <label className="text-xs font-bold text-stone-500">{t('dashboard.settings.absences.reason')}</label>
              <input required type="text" value={newBlock.reason} onChange={e => setNewBlock({ ...newBlock, reason: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d4af37] transition-all outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-xs font-bold text-stone-500">{t('dashboard.settings.absences.start')}</label>
                <input required type="date" value={newBlock.start_time} onChange={e => setNewBlock({ ...newBlock, start_time: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d4af37] font-mono text-sm outline-none" />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-stone-500">{t('dashboard.settings.absences.end')}</label>
                <input required type="date" value={newBlock.end_time} onChange={e => setNewBlock({ ...newBlock, end_time: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d4af37] font-mono text-sm outline-none" />
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-stone-50 rounded-xl border border-stone-100">
              <div className="relative">
                <input type="checkbox" checked={newBlock.is_annual_holiday} onChange={e => setNewBlock({ ...newBlock, is_annual_holiday: e.target.checked })} className="sr-only" />
                <div className={`block w-10 h-6 rounded-full transition-colors ${newBlock.is_annual_holiday ? 'bg-[#d4af37]' : 'bg-stone-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${newBlock.is_annual_holiday ? 'translate-x-4' : ''}`}></div>
              </div>
              <span className="text-xs font-bold text-stone-700">{t('dashboard.settings.absences.repeat_annually')}</span>
            </label>
            <div className="flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setShowBlockModal(false)} className="px-4 py-2 text-stone-500 font-bold hover:bg-stone-100 rounded-xl transition-colors">{t('dashboard.general.cancel')}</button>
              <button type="submit" disabled={addingBlock} className="px-6 py-2 bg-stone-900 text-white font-bold rounded-xl shadow-sm hover:bg-stone-800 transition-colors disabled:opacity-50">
                {addingBlock ? t('dashboard.settings.saving') : t('dashboard.settings.absences.add_btn')}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
