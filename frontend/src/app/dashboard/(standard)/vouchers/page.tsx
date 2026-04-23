"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuthRole } from '@/hooks/useAuthRole';
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function VouchersPage() {
  const router = useRouter();
  const { role, loading: loadingRole } = useAuthRole();
  const { showFeedback } = useFeedback();
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
    if (!loadingRole) {
      const currentRole = role?.toLowerCase();
      if (currentRole === 'especialista') {
        toast.error("Acceso denegado: No tienes permisos para gestionar bonos.");
        router.replace('/dashboard');
      } else {
        fetchData();
      }
    }
  }, [role, loadingRole, router]);

  if (loadingRole) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center h-[60vh] animate-in fade-in duration-500">
        <Skeleton className="w-16 h-16 rounded-2xl" />
        <Skeleton className="w-48 h-6 rounded-xl" />
      </div>
    );
  }

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
      if (sRes.ok) {
        const allServices = await sRes.json();
        setServices(allServices);
      }
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
        toast.success('Plantilla de bono creada');
      } else {
        toast.error('Error al crear plantilla');
      }
    } catch (e) {
      toast.error('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const calculateTemplateDefaultPrice = (srvId: string, sessions: number) => {
      const s = services.find(srv => srv.id === srvId);
      if (s) setTemplatePrice(s.price * sessions);
  };

  const handleDeleteTemplate = async (id: string) => {
    showFeedback({
      type: 'confirm',
      title: 'Eliminar plantilla',
      message: '¿Seguro que deseas eliminar esta plantilla?',
      onConfirm: async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voucher_templates/${id}`, { method: 'DELETE' });
          if (res.ok) {
              fetchData();
              toast.success('Plantilla eliminada correctamente');
          } else {
              toast.error('Error al eliminar plantilla');
          }
        } catch (e) {
          toast.error('Error de conexión');
        }
      }
    });
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
        toast.success('Pago registrado correctamente');
      } else {
        toast.error('Error al registrar el pago');
      }
    } catch (e) {
      toast.error('Error de conexión');
    } finally {
      setPaying(false);
    }
  };

  const handleAssignVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateId) {
       toast.error('Debes seleccionar una plantilla');
       return;
    }
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
        toast.success('Bono emitido y asignado');
      } else {
        toast.error('Error emitiendo el bono');
      }
    } catch (e) {
      toast.error('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    showFeedback({
      type: 'confirm',
      title: 'Anular Bono',
      message: '¿Seguro que deseas anular este bono? Se perderán las sesiones restantes.',
      onConfirm: async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vouchers/${id}`, { method: 'DELETE' });
          if (res.ok) {
              fetchData();
              toast.success('Bono anulado correctamente');
          } else {
              toast.error('Error al anular el bono');
          }
        } catch (e) {
          toast.error('Error de conexión');
        }
      }
    });
  };

  const isExpired = (expDate: string) => new Date(expDate) < new Date();

  // Search filter for templates combo - ONLY SHOW ACTIVE SERVICES TEMPLATES
  const filteredTemplates = templates.filter(t => {
    const service = services.find(s => s.id === t.service_id);
    const isServiceActive = service ? service.is_active : true;
    return isServiceActive && t.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) return (
    <div className="space-y-10 animate-pulse">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-stone-100 pb-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-12 w-48 rounded-xl" />
      </div>

      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-stone-100 space-y-4">
            <div className="flex justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-6 w-16 rounded-lg" />
            </div>
            <Skeleton className="h-14 w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2.5 w-full rounded-full" />
            </div>
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-800">Dirección de Bonos</h1>
          <p className="text-stone-500 mt-1 font-medium">Control de tratamientos emitidos y catálogo de bonos base</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-stone-200 p-1 rounded-xl shadow-sm">
            <button 
              onClick={() => setActiveTab('vendidos')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${activeTab === 'vendidos' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
               Emitidos
            </button>
            <button 
              onClick={() => setActiveTab('catalogo')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${activeTab === 'catalogo' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
               Catálogo
            </button>
          </div>
          <button 
            onClick={() => activeTab === 'vendidos' ? setShowAssignModal(true) : setShowTemplateModal(true)}
            className="px-6 py-3 rounded-xl bg-[#d4af37] hover:bg-[#b08e23] border border-transparent text-white font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <span className="text-lg">+</span> {activeTab === 'vendidos' ? 'Emitir Bono' : 'Nueva Plantilla'}
          </button>
        </div>
      </div>

      {/* ======================= TAB: BONOS VENDIDOS ======================= */}
      {activeTab === 'vendidos' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-stone-700 ml-1">Bonos activos en pacientes</h2>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {vouchers.map(v => {
              const expired = isExpired(v.expiration_date);
              const isEmpty = v.used_sessions >= v.total_sessions;
              const active = !expired && !isEmpty;

              return (
                <motion.div 
                  key={v.id} 
                  variants={itemVariants}
                  className={`bg-white rounded-[2rem] p-7 border transition-all relative overflow-hidden ${active ? 'border-primary/10 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] hover:scale-[1.01] group' : 'border-stone-100 opacity-60'}`}
                >
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h3 className="font-extrabold text-stone-900 text-lg leading-tight">{getClientName(v.client_id)}</h3>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1.5">{getServiceName(v.service_id)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {active ? (
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black border border-emerald-100 uppercase tracking-widest">
                          Activo
                        </span>
                      ) : (
                        <span className="bg-stone-50 text-stone-400 px-3 py-1 rounded-full text-[10px] font-black border border-stone-100 uppercase tracking-widest">
                          {isEmpty ? 'Agotado' : 'Caducado'}
                        </span>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-8 h-8 rounded-full border border-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-all focus:outline-none">
                            <span className="text-lg leading-none mb-1">...</span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Acciones del Bono</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/clients/${v.client_id}`} className="cursor-pointer">
                              Ver Ficha Cliente
                            </Link>
                          </DropdownMenuItem>
                          {v.payment_status !== 'paid' && (
                            <DropdownMenuItem onClick={() => handleOpenPayModal(v)} className="text-amber-600 font-bold">
                              Cobrar Pendiente
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteVoucher(v.id)} className="text-rose-600">
                            Anular Bono
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  {/* Financial Status Indicator */}
                  <div className={`mb-6 p-4 rounded-2xl border flex justify-between items-center ${
                    v.payment_status === 'paid' ? 'bg-emerald-50/30 border-emerald-100/50' : 
                    v.payment_status === 'partial' ? 'bg-amber-50/30 border-amber-100/50' : 
                    'bg-rose-50/30 border-rose-100/50'
                  }`}>
                    <div>
                      <p className="text-[9px] uppercase font-black text-stone-400 tracking-wider mb-0.5">Estado Financiero</p>
                      <div className="text-xs font-bold">
                        {v.payment_status === 'paid' && <span className="text-emerald-700">✓ Completado</span>}
                        {v.payment_status === 'partial' && (
                          <span className="text-amber-600">⚠️ Deuda: {v.total_price - v.amount_paid}€</span>
                        )}
                        {v.payment_status === 'pending' && (
                          <span className="text-rose-600">✕ Sin Cobrar</span>
                        )}
                      </div>
                    </div>
                     <div className="text-right">
                       <p className="text-[9px] uppercase font-black text-stone-400 tracking-wider mb-0.5">Inversión</p>
                       <p className="text-base font-black text-stone-800">{v.total_price}€</p>
                     </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-2">
                      <span className="text-stone-400">Progreso Sesiones</span>
                      <span className="text-stone-900">{v.used_sessions} / {v.total_sessions}</span>
                    </div>
                    <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200/30 p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((v.used_sessions / v.total_sessions) * 100, 100)}%` }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className={`h-full rounded-full ${active ? 'bg-gradient-to-r from-primary/80 to-primary' : 'bg-stone-300'}`} 
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-200"></span>
                    <span>Vence el {new Date(v.expiration_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  </div>
                </motion.div>
              );
            })}
            
            {vouchers.length === 0 && (
              <div className="col-span-full py-24 text-center border-2 border-dashed border-stone-200 rounded-[2.5rem] bg-stone-50/30">
                <span className="text-4xl block mb-4 opacity-20">🎟️</span>
                <p className="text-stone-400 font-bold">No hay bonos activos asignados a clientes.</p>
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* ======================= TAB: CATÁLOGO PLANTILLAS ======================= */}
      {activeTab === 'catalogo' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-stone-700 ml-1">Modelos de bonos configurados</h2>
          </div>
          
          <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-stone-50/50 border-b border-stone-100 text-[10px] uppercase tracking-[0.15em] font-black text-stone-400">
                      <th className="px-8 py-5">Nombre de la Plantilla</th>
                      <th className="px-8 py-5">Tratamiento Válido</th>
                      <th className="px-8 py-5 text-center">Nº Sesiones</th>
                      <th className="px-8 py-5">Precio Sugerido</th>
                      <th className="px-8 py-5 text-right">Acciones</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                   {templates.length === 0 ? (
                      <tr><td colSpan={5} className="p-16 text-center text-stone-400 font-bold">El catálogo está vacío. Crea tu primer bono base.</td></tr>
                   ) : templates.map(t => (
                      <tr key={t.id} className="hover:bg-stone-50/80 transition-colors group">
                         <td className="px-8 py-6 font-extrabold text-stone-900">{t.name}</td>
                         <td className="px-8 py-6 font-medium text-stone-500 text-sm">{getServiceName(t.service_id)}</td>
                         <td className="px-8 py-6 text-center">
                            <span className="inline-block bg-primary/5 text-primary font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-tighter">
                              {t.total_sessions} sesiones
                            </span>
                         </td>
                         <td className="px-8 py-6 font-black text-stone-900">{t.price} €</td>
                         <td className="px-8 py-6 text-right">
                            <button 
                              onClick={() => handleDeleteTemplate(t.id)}
                              className="w-10 h-10 rounded-xl bg-white border border-stone-100 flex items-center justify-center text-stone-400 hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50 transition-all ml-auto opacity-0 group-hover:opacity-100 active:scale-95 shadow-sm"
                              title="Eliminar plantilla"
                            >
                              <span className="text-xl leading-none">×</span>
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
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent className="p-0 border-none max-w-lg">
          <DialogHeader className="p-8 border-b border-stone-100 bg-stone-50 rounded-t-xl">
            <DialogTitle className="text-xl font-extrabold text-stone-800">Emitir / Vender Bono</DialogTitle>
            <DialogDescription className="text-stone-400 text-sm">
              Asigna un bono del catálogo a un cliente y define las condiciones de pago.
            </DialogDescription>
          </DialogHeader>

          <div className="p-8">
            <form id="assign-voucher-form" onSubmit={handleAssignVoucher}>
              {/* 1. Seleccionar Cliente */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Cliente Receptor</label>
                <Select required value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger className="w-full bg-stone-50 border-stone-200 uppercase tracking-tighter shadow-sm font-bold">
                    <SelectValue placeholder="Selecciona cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients
                      .filter(c => c.email !== 'contado@clinica-mercedes.com')
                      .map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
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
                      <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
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

              {/* 3. Condiciones Financieras */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 transition-all duration-300 ${selectedTemplateId ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5 ml-1">Precio Final Pactado (€)</label>
                  <input 
                    type="number" step="0.01" required 
                    value={assignPrice} onChange={e => setAssignPrice(Number(e.target.value))}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-extrabold text-[#b08e23] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-600 tracking-wide mb-1">Pago Inicial Hoy (€)</label>
                  <input 
                    type="number" step="0.01" required min="0" max={Number(assignPrice)}
                    value={assignAmountPaid} onChange={e => setAssignAmountPaid(Number(e.target.value))}
                    className="w-full p-3 bg-white border border-stone-200 border-l-4 border-l-emerald-400 rounded-xl font-extrabold text-stone-800 outline-none focus:border-l-emerald-600 focus:bg-emerald-50/30"
                  />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Caducidad del Bono</label>
                    <Select value={expirationMonths.toString()} onValueChange={(val) => setExpirationMonths(Number(val))}>
                      <SelectTrigger className="w-full bg-white border border-stone-200 rounded-xl font-semibold text-stone-700">
                        <SelectValue placeholder="Selecciona caducidad..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 meses desde la compra</SelectItem>
                        <SelectItem value="6">6 meses desde la compra</SelectItem>
                        <SelectItem value="12">12 meses desde la compra</SelectItem>
                        <SelectItem value="24">2 años desde la compra</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
              </div>
            </form>
          </div>

          <DialogFooter className="sticky bottom-0 left-0 w-full p-8 border-t border-stone-100 bg-gradient-to-t from-white via-white to-white/0 rounded-b-2xl z-20">
            <button 
              form="assign-voucher-form"
              type="submit" 
              disabled={saving || !selectedTemplateId} 
              className="w-full py-4 bg-stone-800 text-white font-extrabold rounded-xl hover:bg-stone-900 transition-all flex justify-center items-center shadow-lg disabled:opacity-50"
            >
              {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Crear y Asignar Bono"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================= MODAL: CREAR PLANTILLA ======================= */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="p-0 border-none max-w-sm">
          <DialogHeader className="p-6 border-b border-stone-50 bg-white rounded-t-xl">
            <DialogTitle className="text-xl font-extrabold text-stone-800">Crear Plantilla</DialogTitle>
            <DialogDescription className="text-stone-400 text-xs mt-1">
              Define los parámetros básicos para una nueva plantilla de bono.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 pb-32">
            <form id="template-form" onSubmit={handleCreateTemplate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Nombre (Ej: Bono 5 Ses. Axilas)</label>
                  <input required type="text" value={templateName} onChange={e => setTemplateName(e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Servicio / Tratamiento base</label>
                  <Select value={templateServiceId} onValueChange={(val) => {
                    setTemplateServiceId(val);
                    calculateTemplateDefaultPrice(val, templateSessions);
                  }}>
                    <SelectTrigger className="w-full bg-stone-50 border-stone-200 font-bold">
                      <SelectValue placeholder="-- Elige técnica --" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.filter(s => s.is_active).map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.price}€/sesión)</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Nº de Sesiones / Usos</label>
                  <input 
                    required type="number" min="1"
                    value={templateSessions} 
                    onChange={e => {
                      const sess = Number(e.target.value);
                      setTemplateSessions(sess);
                      calculateTemplateDefaultPrice(templateServiceId, sess);
                    }} 
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-800" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Precio de Venta Sugerido (€)</label>
                  <input required type="number" step="0.01" value={templatePrice} onChange={e => setTemplatePrice(Number(e.target.value))} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold text-[#b08e23]" />
                </div>
              </div>
            </form>
          </div>

          <DialogFooter className="sticky bottom-0 left-0 w-full p-6 border-t border-stone-50 bg-gradient-to-t from-white via-white to-white/0 rounded-b-2xl z-20">
            <button form="template-form" type="submit" disabled={saving} className="w-full py-4 bg-[#bf7d6b] text-white font-extrabold rounded-xl hover:bg-[#a66a5a] transition-all flex justify-center items-center shadow-lg shadow-[#bf7d6b]/20 active:scale-95">
              {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Guardar Plantilla"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================= MODAL: SALDAR DEUDA ======================= */}
      <Dialog open={showPayModal} onOpenChange={setShowPayModal}>
        <DialogContent className="p-0 border-none max-w-sm">
          <DialogHeader className="p-6 border-b border-stone-50 bg-white rounded-t-xl">
            <DialogTitle className="text-xl font-extrabold text-stone-800">Añadir Pago</DialogTitle>
            <DialogDescription className="text-stone-400 text-xs mt-1">
              Registra un cobro parcial o total sobre la deuda del bono.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 pb-32">
            <form id="pay-debt-form" onSubmit={handlePayDebt}>
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
                  className="w-full p-4 bg-stone-50 border border-stone-200 border-l-4 border-l-[#d9777f] rounded-xl font-extrabold text-stone-800 outline-none text-xl" 
                />
                <p className="text-[10px] text-stone-400 mt-1">Este importe se sumará al saldo pagado.</p>
              </div>
            </form>
          </div>

          <DialogFooter className="sticky bottom-0 left-0 w-full p-6 border-t border-stone-100 bg-gradient-to-t from-white via-white to-white/0 flex gap-3 rounded-b-2xl z-20">
            <button type="button" onClick={() => setShowPayModal(false)} className="flex-1 py-3 text-stone-600 font-bold border border-stone-200 rounded-xl hover:bg-stone-50 bg-white">Cancelar</button>
            <button form="pay-debt-form" type="submit" disabled={paying} className="flex-1 py-3 text-white bg-[#d9777f] font-bold rounded-xl hover:bg-[#c6646b] shadow-md flex justify-center items-center">
              {paying ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Confirmar'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
