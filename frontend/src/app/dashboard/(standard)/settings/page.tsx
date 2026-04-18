"use client"
import { useState, useEffect, useRef } from 'react';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { toast } from 'sonner';
import { Save, Building2, Link2, SearchCode, ImageIcon, Hash, ChevronDown, Clock, Calendar, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function SettingsPage() {
  const { showFeedback } = useFeedback();
  const [settings, setSettings] = useState<any>(null);
  const [timeBlocks, setTimeBlocks] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal de Ausencias
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [newBlock, setNewBlock] = useState({ start_time: '', end_time: '', reason: '', is_annual_holiday: false });
  const [addingBlock, setAddingBlock] = useState(false);
  
  // File inputs refs
  const logoAppRef = useRef<HTMLInputElement>(null);
  const logoPdfRef = useRef<HTMLInputElement>(null);
  const sigRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [settingsRes, blocksRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/time-blocks/`)
      ]);
      
      if (settingsRes.ok) {
        const remoteSettings = await settingsRes.json();
        // Cargar días laborables desde localStorage para persistencia real
        const savedDays = localStorage.getItem('mercestetica_working_days');
        if (savedDays) {
          remoteSettings.working_days = JSON.parse(savedDays);
        } else if (!remoteSettings.working_days) {
          remoteSettings.working_days = [1, 2, 3, 4, 5]; // Default L-V
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
      // Parse dates to add local timezone properly if needed or just send local generic
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
        fetchSettings(); // refresh list
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


  // Compresión de imagen a Base64
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
        const max_size = 500; // Máximo 500px

        if (width > height) {
          if (width > max_size) {
            height *= max_size / width;
            width = max_size;
          }
        } else {
          if (height > max_size) {
            width *= max_size / height;
            height = max_size;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/png', 0.8);
        setSettings({ ...settings, [field]: dataUrl });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (loading || !settings) {
     return <div className="text-center py-32"><div className="w-8 h-8 border-4 border-[#d4af37] border-t-[#d9777f] rounded-full animate-spin mx-auto"></div></div>;
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-[1100px] mx-auto">
      <div className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-serif font-semibold text-stone-800 tracking-tight">Ajustes Generales</h1>
          <p className="text-stone-400 font-medium mt-1">Configura la información de tu clínica y preferencias.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-stone-900 hover:bg-[#d9777f] text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={16} strokeWidth={1.5} />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Detalles de la Empresa */}
        <div className="bg-white rounded-[2.5rem] border border-stone-100 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
            <span className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
              <Building2 size={18} strokeWidth={1.5} />
            </span>
            <h3 className="text-2xl font-serif font-semibold text-stone-800">Detalles de la Empresa</h3>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">Nombre Comercial</label>
                <input required type="text" value={settings.clinic_name} onChange={e => setSettings({...settings, clinic_name: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] focus:ring-1 focus:ring-[#d9777f] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">Nombre Legal del Titular (DNI)</label>
                <input type="text" value={settings.legal_name || ''} onChange={e => setSettings({...settings, legal_name: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] focus:ring-1 focus:ring-[#d9777f] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">CIF/NIF</label>
                <input type="text" value={settings.clinic_nif} onChange={e => setSettings({...settings, clinic_nif: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] focus:ring-1 focus:ring-[#d9777f] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">Nº de Registro Sanitario</label>
                <input type="text" value={settings.sanitary_register || ''} onChange={e => setSettings({...settings, sanitary_register: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] focus:ring-1 focus:ring-[#d9777f] transition-all" placeholder="Opcional" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-500 mb-2">Dirección Completa</label>
                <input type="text" value={settings.clinic_address} onChange={e => setSettings({...settings, clinic_address: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] focus:ring-1 focus:ring-[#d9777f] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">Teléfono de Contacto</label>
                <input type="text" value={settings.clinic_phone} onChange={e => setSettings({...settings, clinic_phone: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] focus:ring-1 focus:ring-[#d9777f] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">Email</label>
                <input type="email" value={settings.clinic_email} onChange={e => setSettings({...settings, clinic_email: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] focus:ring-1 focus:ring-[#d9777f] transition-all" />
              </div>
           </div>
        </div>

        {/* Horario Hábil */}
        <div className="bg-white rounded-[2.5rem] border border-stone-100 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
            <span className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
              <Clock size={18} strokeWidth={1.5} />
            </span>
            <h3 className="text-2xl font-serif font-semibold text-stone-800">Horario Hábil y Descansos</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-emerald-700 mb-2">Apertura (Mañana)</label>
                <input type="time" value={settings.open_time || ''} onChange={e => setSettings({...settings, open_time: e.target.value})} className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl focus:border-emerald-400 font-mono font-bold text-emerald-800 transition-all outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-orange-700 mb-2">Cierre (Tarde/Noche)</label>
                <input type="time" value={settings.close_time || ''} onChange={e => setSettings({...settings, close_time: e.target.value})} className="w-full p-4 bg-orange-50/50 border border-orange-100 rounded-xl focus:border-orange-400 font-mono font-bold text-orange-800 transition-all outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">Inicio Descanso</label>
                <input type="time" value={settings.lunch_start || ''} onChange={e => setSettings({...settings, lunch_start: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] font-mono font-bold transition-all outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">Fin Descanso</label>
                <input type="time" value={settings.lunch_end || ''} onChange={e => setSettings({...settings, lunch_end: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] font-mono font-bold transition-all outline-none" />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="block text-xs font-bold text-stone-500 mb-4 uppercase tracking-widest">Días Laborables</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: 1, label: 'L' },
                  { id: 2, label: 'M' },
                  { id: 3, label: 'X' },
                  { id: 4, label: 'J' },
                  { id: 5, label: 'V' },
                  { id: 6, label: 'S' },
                  { id: 7, label: 'D' }
                ].map((day) => {
                  const isActive = (settings.working_days || [1,2,3,4,5]).includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => {
                        const current = settings.working_days || [1,2,3,4,5];
                        const next = isActive 
                          ? current.filter((d: number) => d !== day.id)
                          : [...current, day.id].sort();
                        
                        // Guardado inmediato en localStorage para persistencia real
                        localStorage.setItem('mercestetica_working_days', JSON.stringify(next));
                        setSettings({ ...settings, working_days: next });
                      }}
                      className={`w-12 h-12 rounded-2xl font-black transition-all flex items-center justify-center text-sm shadow-sm
                        ${isActive 
                          ? 'bg-stone-900 text-white shadow-stone-200 scale-105' 
                          : 'bg-white border border-stone-200 text-stone-400 hover:border-stone-400'}
                      `}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-stone-400 mt-4 leading-relaxed tracking-wide font-medium italic">Selecciona los días que la clínica estará abierta. Los días desactivados aparecerán como "Día Libre" en la agenda.</p>
            </div>
          </div>
        </div>

        {/* Gestor de Ausencias */}
        <div className="bg-white rounded-[2.5rem] border border-stone-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
                <Calendar size={18} strokeWidth={1.5} />
              </span>
              <h3 className="text-2xl font-serif font-semibold text-stone-800">Vacaciones y Festivos</h3>
            </div>
            <button type="button" onClick={() => setShowBlockModal(true)} className="bg-[#fdf2f3] text-[#d9777f] px-4 py-2 rounded-xl font-bold hover:bg-[#f3c7cb] transition-colors text-sm">
              + Añadir Ausencia
            </button>
          </div>
          
          <div className="bg-stone-50/50 border border-stone-100 rounded-2xl overflow-hidden">
            {timeBlocks && timeBlocks.length > 0 ? (
              <ul className="divide-y divide-stone-100">
                {timeBlocks.map((tb: any) => (
                  <li key={tb.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white transition-colors">
                    <div className="flex flex-col">
                      <span className="font-bold text-stone-800">{tb.reason || 'Día inhábil'}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded-md font-mono">{new Date(tb.start_time).toLocaleDateString()} a {new Date(tb.end_time).toLocaleDateString()}</span>
                        {tb.is_annual_holiday && <span className="text-[10px] font-bold text-[#d9777f] uppercase tracking-wider bg-[#fdf2f3] px-2 py-1 rounded">Anual</span>}
                      </div>
                    </div>
                    <button type="button" onClick={() => handleDeleteBlock(tb.id)} className="text-stone-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-stone-400 text-sm">
                No hay vacaciones ni días festivos programados.
              </div>
            )}
          </div>
        </div>

        {/* Enlaces y Redes Sociales */}
        <div className="bg-white rounded-[2.5rem] border border-stone-100 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
            <span className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
              <Link2 size={18} strokeWidth={1.5} />
            </span>
            <h3 className="text-2xl font-serif font-semibold text-stone-800">Enlaces y Redes Sociales</h3>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">URL de Instagram</label>
                <input type="text" value={settings.instagram_url || ''} onChange={e => setSettings({...settings, instagram_url: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] transition-all" placeholder="https://instagram.com/..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">Teléfono WhatsApp</label>
                <input type="text" value={settings.whatsapp_number || ''} onChange={e => setSettings({...settings, whatsapp_number: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] transition-all" placeholder="600000000" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">URL de Google Maps</label>
                <input type="text" value={settings.maps_url || ''} onChange={e => setSettings({...settings, maps_url: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] transition-all" placeholder="https://goo.gl/maps/..." />
              </div>
           </div>
        </div>

        {/* Control SEO */}
        <div className="bg-white rounded-[2.5rem] border border-stone-100 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
            <span className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
              <SearchCode size={18} strokeWidth={1.5} />
            </span>
            <h3 className="text-2xl font-serif font-semibold text-stone-800">Posicionamiento SEO</h3>
          </div>
           <label className="flex items-center gap-4 cursor-pointer group w-fit">
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={settings.allow_search_engine_indexing} 
                  onChange={e => setSettings({...settings, allow_search_engine_indexing: e.target.checked})} 
                  className="sr-only" 
                />
                <div className={`block w-14 h-8 rounded-full transition-colors ${settings.allow_search_engine_indexing ? 'bg-emerald-500' : 'bg-stone-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.allow_search_engine_indexing ? 'translate-x-6' : ''}`}></div>
              </div>
              <div className="flex flex-col">
                <span className={`text-sm font-bold transition-colors ${settings.allow_search_engine_indexing ? 'text-emerald-700' : 'text-stone-500'}`}>
                  {settings.allow_search_engine_indexing ? 'Indexación en Google Activada' : 'Indexación Oculta (No Index)'}
                </span>
                <span className="text-xs text-stone-400 font-medium">Determina si los motores de búsqueda pueden rastrear e indexar tu página pública.</span>
              </div>
           </label>
        </div>

        {/* Imágenes y Logos */}
        <div className="bg-white rounded-[2.5rem] border border-stone-100 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
            <span className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
              <ImageIcon size={18} strokeWidth={1.5} />
            </span>
            <h3 className="text-2xl font-serif font-semibold text-stone-800">Imágenes y Logotipos</h3>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Logo App */}
              <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 flex flex-col items-start gap-4">
                 <div>
                   <label className="block text-sm font-bold text-stone-800 mb-1">Logo Panel App</label>
                   <p className="text-xs text-stone-400">Barra lateral (Solo icono o compacto)</p>
                 </div>
                 <div className="w-full h-32 bg-white border border-stone-200 border-dashed rounded-lg flex items-center justify-center p-2">
                    {settings.logo_app_b64 ? <img src={settings.logo_app_b64} alt="App Logo" className="max-h-full object-contain" /> : <span className="text-stone-300 text-xs">Sin logo</span>}
                 </div>
                 <input type="file" accept="image/*" ref={logoAppRef} className="hidden" onChange={e => handleImageUpload('logo_app_b64', e)} />
                 <button type="button" onClick={() => logoAppRef.current?.click()} className="text-xs font-bold text-[#d9777f] bg-[#fdf2f3] px-4 py-2 rounded-lg hover:bg-[#f3c7cb] w-full">Cambiar Archivo</button>
              </div>

              {/* Logo PDF */}
              <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 flex flex-col items-start gap-4">
                 <div>
                   <label className="block text-sm font-bold text-stone-800 mb-1">Logotipo Documentos</label>
                   <p className="text-xs text-stone-400">Cabeceras de Facturas y PDF</p>
                 </div>
                 <div className="w-full h-32 bg-white border border-stone-200 border-dashed rounded-lg flex items-center justify-center p-2">
                    {settings.logo_pdf_b64 ? <img src={settings.logo_pdf_b64} alt="PDF Logo" className="max-h-full object-contain" /> : <span className="text-stone-300 text-xs">Sin logo</span>}
                 </div>
                 <input type="file" accept="image/*" ref={logoPdfRef} className="hidden" onChange={e => handleImageUpload('logo_pdf_b64', e)} />
                 <button type="button" onClick={() => logoPdfRef.current?.click()} className="text-xs font-bold text-[#d9777f] bg-[#fdf2f3] px-4 py-2 rounded-lg hover:bg-[#f3c7cb] w-full">Cambiar Archivo</button>
              </div>

              {/* Firma */}
              <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 flex flex-col items-start gap-4">
                 <div>
                   <label className="block text-sm font-bold text-stone-800 mb-1">Sello y Firma</label>
                   <p className="text-xs text-stone-400">Validez a pie de factura o Consentimiento</p>
                 </div>
                 <div className="w-full h-32 bg-white border border-stone-200 border-dashed rounded-lg flex items-center justify-center p-2">
                    {settings.signature_b64 ? <img src={settings.signature_b64} alt="Signature" className="max-h-full object-contain mix-blend-multiply" /> : <span className="text-stone-300 text-xs">Sin firma</span>}
                 </div>
                 <input type="file" accept="image/*" ref={sigRef} className="hidden" onChange={e => handleImageUpload('signature_b64', e)} />
                 <button type="button" onClick={() => sigRef.current?.click()} className="text-xs font-bold text-[#d9777f] bg-[#fdf2f3] px-4 py-2 rounded-lg hover:bg-[#f3c7cb] w-full">Cambiar Archivo</button>
              </div>

           </div>
        </div>


        {/* Numeración */}
        <div className="bg-white rounded-[2.5rem] border border-stone-100 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
            <span className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
              <Hash size={18} strokeWidth={1.5} />
            </span>
            <h3 className="text-2xl font-serif font-semibold text-stone-800">Agenda y Numeración</h3>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 p-4 bg-orange-50/50 border border-orange-100 rounded-xl mb-2">
                <label className="block text-xs font-bold text-orange-700 mb-2">Margen de antelación para hoy (Horas)</label>
                <input type="number" min="0" step="0.5" value={settings.booking_margin_hours ?? 2.0} onChange={e => setSettings({...settings, booking_margin_hours: parseFloat(e.target.value) || 0})} className="w-full md:w-1/2 p-4 bg-white border border-orange-200 rounded-xl focus:border-orange-400 font-mono font-bold text-orange-800" />
                <p className="text-[10px] text-orange-600/80 mt-2">Ejemplo: Si pones 2, y un cliente entra a las 10:00 a reservar para hoy, solo le saldrán horas a partir de las 12:00.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">Prefijo de Factura</label>
                <div className="relative">
                   <input type="text" value={settings.invoice_prefix} onChange={e => setSettings({...settings, invoice_prefix: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] font-mono text-sm" />
                </div>
                <p className="text-[10px] text-stone-400 mt-2">Usa &#123;YY&#125; para año, &#123;YYYY&#125; para año completo, &#123;MM&#125; para mes.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-2">Sig. Nº Factura</label>
                  <input type="number" min="1" value={settings.invoice_next_number} onChange={e => setSettings({...settings, invoice_next_number: parseInt(e.target.value)})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] font-mono font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-2">IVA por defecto (%)</label>
                  <input type="number" min="0" step="0.5" value={settings.default_tax_rate || 21} onChange={e => setSettings({...settings, default_tax_rate: parseFloat(e.target.value)})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] font-mono font-bold" />
                </div>
              </div>
              <div className="md:col-span-2 mt-2">
                <p className="text-[10px] text-emerald-500 italic font-medium">Ejemplo final auto-generado: <span className="font-bold">{settings.invoice_prefix.replace('{YY}', new Date().getFullYear().toString().slice(-2)).replace('{YYYY}', new Date().getFullYear().toString()).replace('{MM}', (new Date().getMonth()+1).toString().padStart(2,'0'))}{String(settings.invoice_next_number).padStart(4, '0')}</span></p>
              </div>
           </div>
        </div>

      </form>

      {/* Modal Añadir Ausencia */}
      <Dialog open={showBlockModal} onOpenChange={setShowBlockModal}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-[#fdf2f3] p-6 pb-4">
             <DialogHeader>
                <DialogTitle className="text-2xl font-serif text-[#d9777f]">Añadir Nueva Ausencia</DialogTitle>
                <DialogDescription className="text-stone-600 font-medium pt-1 border-opacity-30">
                  Bloquea la agenda para festivos o vacaciones.
                </DialogDescription>
             </DialogHeader>
          </div>
          <form onSubmit={handleAddBlock} className="p-6 pt-4 bg-white grid gap-5">
            <div className="grid gap-2">
              <label className="text-xs font-bold text-stone-500">Motivo (Ej. Vacaciones de Verano)</label>
              <input required type="text" value={newBlock.reason} onChange={e => setNewBlock({...newBlock, reason: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] transition-all" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-xs font-bold text-stone-500">Día de Inicio</label>
                <input required type="date" value={newBlock.start_time} onChange={e => setNewBlock({...newBlock, start_time: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] font-mono text-sm" />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-stone-500">Día de Fin</label>
                <input required type="date" value={newBlock.end_time} onChange={e => setNewBlock({...newBlock, end_time: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] font-mono text-sm" />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer mt-2 p-3 bg-stone-50 rounded-xl border border-stone-100">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={newBlock.is_annual_holiday} 
                    onChange={e => setNewBlock({...newBlock, is_annual_holiday: e.target.checked})} 
                    className="sr-only" 
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${newBlock.is_annual_holiday ? 'bg-[#d9777f]' : 'bg-stone-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${newBlock.is_annual_holiday ? 'translate-x-4' : ''}`}></div>
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-700 block">Este es un festivo que se repite anualmente</span>
                  <span className="text-[10px] text-stone-400 block leading-tight mt-0.5">Ej: 25 de diciembre o fecha nacional fija.</span>
                </div>
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
