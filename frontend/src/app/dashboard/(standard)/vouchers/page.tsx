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

import { useLanguage } from '@/app/contexts/LanguageContext';

import ActiveVouchersList from './components/ActiveVouchersList';
import TemplatesCatalog from './components/TemplatesCatalog';
import AssignVoucherModal from './components/AssignVoucherModal';
import CreateTemplateModal from './components/CreateTemplateModal';
import PayDebtModal from './components/PayDebtModal';

export default function VouchersPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
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
        toast.error(t('dashboard.vouchers.access_denied') || "Acceso denegado: No tienes permisos para gestionar bonos.");
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
        toast.success(t('dashboard.vouchers.template_created') || 'Plantilla de bono creada');
      } else {
        toast.error(t('dashboard.vouchers.error_creating_template') || 'Error al crear plantilla');
      }
    } catch (e) {
      toast.error(t('dashboard.vouchers.connection_error') || 'Error de conexión');
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
      title: t('dashboard.vouchers.delete_template_title') || 'Eliminar plantilla',
      message: t('dashboard.vouchers.delete_template_desc') || '¿Seguro que deseas eliminar esta plantilla?',
      onConfirm: async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voucher_templates/${id}`, { method: 'DELETE' });
          if (res.ok) {
              fetchData();
              toast.success(t('dashboard.vouchers.template_deleted') || 'Plantilla eliminada correctamente');
          } else {
              toast.error(t('dashboard.vouchers.error_deleting_template') || 'Error al eliminar plantilla');
          }
        } catch (e) {
          toast.error(t('dashboard.vouchers.connection_error') || 'Error de conexión');
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
        toast.success(t('dashboard.vouchers.payment_registered') || 'Pago registrado correctamente');
      } else {
        toast.error(t('dashboard.vouchers.error_registering_payment') || 'Error al registrar el pago');
      }
    } catch (e) {
      toast.error(t('dashboard.vouchers.connection_error') || 'Error de conexión');
    } finally {
      setPaying(false);
    }
  };

  const handleAssignVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateId) {
       toast.error(t('dashboard.vouchers.must_select_template') || 'Debes seleccionar una plantilla');
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
        toast.success(t('dashboard.vouchers.voucher_assigned') || 'Bono emitido y asignado');
      } else {
        toast.error(t('dashboard.vouchers.error_assigning_voucher') || 'Error emitiendo el bono');
      }
    } catch (e) {
      toast.error(t('dashboard.vouchers.connection_error') || 'Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    showFeedback({
      type: 'confirm',
      title: t('dashboard.vouchers.annul_voucher_title') || 'Anular Bono',
      message: t('dashboard.vouchers.annul_voucher_desc') || '¿Seguro que deseas anular este bono? Se perderán las sesiones restantes.',
      onConfirm: async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vouchers/${id}`, { method: 'DELETE' });
          if (res.ok) {
              fetchData();
              toast.success(t('dashboard.vouchers.voucher_annulled') || 'Bono anulado correctamente');
          } else {
              toast.error(t('dashboard.vouchers.error_annulling_voucher') || 'Error al anular el bono');
          }
        } catch (e) {
          toast.error(t('dashboard.vouchers.connection_error') || 'Error de conexión');
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
  if (loading) {
    return (
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
  }

  return (
    <div className="animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-800">{t('dashboard.vouchers.title') || 'Dirección de Bonos'}</h1>
          <p className="text-stone-500 mt-1 font-medium">{t('dashboard.vouchers.subtitle') || 'Control de tratamientos emitidos y catálogo de bonos base'}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-stone-200 p-1 rounded-xl shadow-sm">
            <button 
              onClick={() => setActiveTab('vendidos')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${activeTab === 'vendidos' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
               {t('dashboard.vouchers.tab_issued') || 'Emitidos'}
            </button>
            <button 
              onClick={() => setActiveTab('catalogo')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${activeTab === 'catalogo' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
               {t('dashboard.vouchers.tab_catalog') || 'Catálogo'}
            </button>
          </div>
          <button 
            onClick={() => activeTab === 'vendidos' ? setShowAssignModal(true) : setShowTemplateModal(true)}
            className="px-6 py-3 rounded-xl bg-[#d4af37] hover:bg-[#b08e23] border border-transparent text-white font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <span className="text-lg">+</span> {activeTab === 'vendidos' ? (t('dashboard.vouchers.emit_voucher') || 'Emitir Bono') : (t('dashboard.vouchers.new_template') || 'Nueva Plantilla')}
          </button>
        </div>
      </div>

      {/* ======================= TAB: BONOS VENDIDOS ======================= */}
      {activeTab === 'vendidos' && (
        <ActiveVouchersList 
          vouchers={vouchers}
          getClientName={getClientName}
          getServiceName={getServiceName}
          isExpired={isExpired}
          handleOpenPayModal={handleOpenPayModal}
          handleDeleteVoucher={handleDeleteVoucher}
        />
      )}

      {/* ======================= TAB: CATÁLOGO PLANTILLAS ======================= */}
      {activeTab === 'catalogo' && (
        <TemplatesCatalog 
          templates={templates}
          getServiceName={getServiceName}
          handleDeleteTemplate={handleDeleteTemplate}
        />
      )}

      <AssignVoucherModal 
        showAssignModal={showAssignModal}
        setShowAssignModal={setShowAssignModal}
        handleAssignVoucher={handleAssignVoucher}
        selectedClientId={selectedClientId}
        setSelectedClientId={setSelectedClientId}
        clients={clients}
        selectedTemplateId={selectedTemplateId}
        setSelectedTemplateId={setSelectedTemplateId}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredTemplates={filteredTemplates}
        handleSelectTemplateForAssignment={handleSelectTemplateForAssignment}
        templates={templates}
        assignPrice={assignPrice}
        setAssignPrice={setAssignPrice}
        assignAmountPaid={assignAmountPaid}
        setAssignAmountPaid={setAssignAmountPaid}
        expirationMonths={expirationMonths}
        setExpirationMonths={setExpirationMonths}
        saving={saving}
      />

      <CreateTemplateModal 
        showTemplateModal={showTemplateModal}
        setShowTemplateModal={setShowTemplateModal}
        handleCreateTemplate={handleCreateTemplate}
        templateName={templateName}
        setTemplateName={setTemplateName}
        templateServiceId={templateServiceId}
        setTemplateServiceId={setTemplateServiceId}
        services={services}
        templateSessions={templateSessions}
        setTemplateSessions={setTemplateSessions}
        calculateTemplateDefaultPrice={calculateTemplateDefaultPrice}
        templatePrice={templatePrice}
        setTemplatePrice={setTemplatePrice}
        saving={saving}
      />

      <PayDebtModal 
        showPayModal={showPayModal}
        setShowPayModal={setShowPayModal}
        handlePayDebt={handlePayDebt}
        currentDebt={currentDebt}
        payAmount={payAmount}
        setPayAmount={setPayAmount}
        paying={paying}
      />
    </div>
  );
}
