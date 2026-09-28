"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SignaturePadModal } from '@/components/SignaturePadModal';
import { useAuthRole } from '@/hooks/useAuthRole';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft,
  User,
  MapPin,
  CreditCard,
  AlertTriangle,
  CalendarDays,
  Edit3,
  Sparkles
} from "lucide-react";

// Import modular components
import { ClientFormFields } from '../components/ClientFormFields';
import { SectorMetadataInputs } from '../components/SectorMetadataInputs';
import { SectorMetadataDisplay } from '../components/SectorMetadataDisplay';
import { ClientActivityCards } from '../components/ClientActivityCards';
import { ClientTabsContent } from '../components/ClientTabsContent';

interface Client {
  id: string;
  name: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  dni: string | null;
  service_address: string | null;
  service_postal_code: string | null;
  service_city: string | null;
  billing_name: string | null;
  billing_nif: string | null;
  billing_address: string | null;
  billing_postal_code: string | null;
  billing_city: string | null;
  sector_metadata: any | null;
}

export default function ClientProfilePage({ params }: { params: { id: string } }) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { role } = useAuthRole();
  const isEspecialista = role?.toLowerCase() === 'especialista';
  
  // Data States
  const [client, setClient] = useState<Client | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [consents, setConsents] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isBillingDifferent, setIsBillingDifferent] = useState(false);
  const [sectorMetadata, setSectorMetadata] = useState<any>({});
  const [businessSector, setBusinessSector] = useState<string>('general');
  const [enableConsents, setEnableConsents] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [clinicName, setClinicName] = useState<string>('');

  // Pay Debt Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [payVoucherId, setPayVoucherId] = useState('');
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [paying, setPaying] = useState(false);
  const [currentDebt, setCurrentDebt] = useState(0);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'vouchers' | 'consents'>('overview');

  useEffect(() => {
    fetchClient();
  }, [params.id]);

  const fetchClient = async () => {
    try {
      const [cRes, aRes, vRes, sRes, conRes, settingsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${params.id}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/vouchers/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${params.id}/consents`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/settings/`)
      ]);
      
      let clientSector = 'general';
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        clientSector = settingsData.business_sector || 'general';
        setBusinessSector(clientSector);
        setEnableConsents(settingsData.enable_consents ?? true);
        setClinicName(settingsData.clinic_name || '');
      }
      
      if (cRes.ok) {
        const data = await cRes.json();
        
        // Redirigir si es el cliente genérico de contado
        const isSystem = (email?: string | null) => {
          if (!email) return false;
          const lower = email.toLowerCase();
          return lower.endsWith('@generico.local') || lower.startsWith('contado@') || lower.startsWith('contado_');
        };
        if (isSystem(data.email)) {
          router.push('/dashboard/clients');
          toast.error(t('dashboard.clients.protected_client_error') || 'Acceso denegado: Cliente del sistema protegido');
          return;
        }

        setClient(data);
        setFormData({
          first_name: data.first_name || data.name.split(' ')[0],
          last_name: data.last_name || data.name.split(' ').slice(1).join(' ') || '',
          email: data.email,
          phone: data.phone || '',
          dni: data.dni || '',
          service_address: data.service_address || data.address || '',
          service_postal_code: data.service_postal_code || data.client_postal_code || '',
          service_city: data.service_city || data.client_city || '',
          billing_name: data.billing_name || '',
          billing_nif: data.billing_nif || '',
          billing_address: data.billing_address || '',
          billing_postal_code: data.billing_postal_code || '',
          billing_city: data.billing_city || ''
        });
        
        setIsBillingDifferent(
          !!data.billing_address && data.billing_address !== (data.service_address || data.address)
        );
        
        setSectorMetadata(data.sector_metadata || {});
      }
      
      if (aRes.ok) {
        const appts = await aRes.json();
        setAppointments(appts.filter((a: any) => a.client_id === params.id).sort((a: any, b: any) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()));
      }
      if (vRes.ok) {
        const vchrs = await vRes.json();
        setVouchers(vchrs.filter((v: any) => v.client_id === params.id));
      }
      if (sRes.ok) setServices(await sRes.json());
      if (conRes.ok) setConsents(await conRes.json());
    } catch (err) {
      console.error("Error fetching client details", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name || null,
        email: formData.email,
        phone: formData.phone === '' ? null : formData.phone,
        dni: formData.dni === '' ? null : formData.dni,
        address: formData.service_address === '' ? null : formData.service_address,
        
        service_address: formData.service_address === '' ? null : formData.service_address,
        service_postal_code: formData.service_postal_code === '' ? null : formData.service_postal_code,
        service_city: formData.service_city === '' ? null : formData.service_city,
        
        billing_name: isBillingDifferent ? formData.billing_name : `${formData.first_name} ${formData.last_name || ''}`.trim(),
        billing_nif: isBillingDifferent ? formData.billing_nif : (formData.dni === '' ? null : formData.dni),
        billing_address: isBillingDifferent ? formData.billing_address : (formData.service_address === '' ? null : formData.service_address),
        billing_postal_code: isBillingDifferent ? formData.billing_postal_code : (formData.service_postal_code === '' ? null : formData.service_postal_code),
        billing_city: isBillingDifferent ? formData.billing_city : (formData.service_city === '' ? null : formData.service_city),
        
        sector_metadata: sectorMetadata
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const updated = await res.json();
        setClient(updated);
        setIsEditing(false);
        toast.success(t('dashboard.clients.client_updated') || 'Ficha de cliente actualizada correctamente');
      } else {
        toast.error(t('dashboard.clients.error_saving') || 'Error al guardar los cambios');
      }
    } catch (err) {
      toast.error(t('dashboard.clients.connection_failed') || 'Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSignature = async (signatureB64: string, docType: string) => {
    try {
      const docTitles: any = {
        'rgpd_general': 'Tratamiento de Datos Personales (Ley General RGPD)',
        'laser_hair_removal': 'Consentimiento: Depilación Láser',
        'botulinum_toxin': 'Consentimiento: Toxina Botulínica',
        'facial_fillers': 'Consentimiento: Rellenos Faciales'
      };
      const title = docTitles[docType] || 'Consentimiento Legal';
      const fakeBody = `DECLARACIÓN DEL PACIENTE:\n\nPor la presente confirmo que he sido informado de los riesgos y condiciones legales del tratamiento contratado, aceptando la custodia y gestión de mis datos personales según los protocolos vigentes de ProBookia.`;

      const payload = {
        client_id: params.id,
        document_type: docType,
        document_title: title,
        document_body: fakeBody,
        signature_b64: signatureB64
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${params.id}/consents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newConsent = await res.json();
        setConsents([newConsent, ...consents]);
        setIsSignatureModalOpen(false);
        toast.success(t('dashboard.clients.consent_signed') || 'Consentimiento firmado correctamente');
      } else {
        toast.error(t('dashboard.clients.consent_error') || 'Error al guardar la firma');
      }
    } catch (e) {
      console.error(e);
      toast.error(t('dashboard.clients.server_connection_error') || 'Error de conexión');
    }
  };

  const handleOpenPayModal = (v: any) => {
    setPayVoucherId(v.id);
    const debt = v.total_price - v.amount_paid;
    setCurrentDebt(debt);
    setPayAmount(debt);
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
        fetchClient();
        toast.success(t('dashboard.clients.payment_registered') || 'Pago registrado');
      } else {
        toast.error(t('dashboard.clients.payment_register_error') || 'Error al procesar pago');
      }
    } catch (e) {
      toast.error(t('dashboard.clients.connection_error') || 'Error de conexión');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center justify-center min-h-[50vh]">
      <Skeleton className="w-16 h-16 rounded-full mb-4" />
      <Skeleton className="h-4 w-48 mb-2" />
      <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest">{t('dashboard.clients.loading_medical_history') || 'Cargando datos del cliente...'}</p>
    </div>
  );
  
  if (!client) return (
    <div className="p-10 text-stone-500 text-center font-bold text-xl">
      {t('dashboard.clients.client_not_found') || 'Cliente no encontrado'}
    </div>
  );

  const dateLocale = language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR';
  const totalDebt = vouchers
    .filter(v => v.payment_status === 'partial' || v.payment_status === 'pending')
    .reduce((sum, v) => sum + (v.total_price - v.amount_paid), 0);

  return (
    <div className="animate-in fade-in duration-500 bg-[#FAFAFA] min-h-screen pb-12">
      {/* Back Button */}
      <Link 
        id="back-to-directory-link" 
        href="/dashboard/clients" 
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-400 hover:text-stone-800 mb-6 transition-colors group"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        <span>{t('dashboard.clients.back_to_directory') || 'Volver al directorio'}</span>
      </Link>

      {/* Main Profile Showcase Card */}
      <Card className="rounded-[2rem] border border-stone-200/70 bg-white/80 backdrop-blur-xl p-6 md:p-8 shadow-sm mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/10 via-amber-400/5 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative z-10">
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="w-16 h-16 rounded-2xl bg-stone-100/90 border border-stone-200/70 flex items-center justify-center text-stone-800 font-serif text-3xl shadow-xs shrink-0 font-bold uppercase">
              {client.first_name ? client.first_name.charAt(0) : client.name.charAt(0)}
            </div>
            
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight leading-none">
                {client.first_name} {client.last_name || ''}
              </h1>
              <p className="text-stone-400 text-xs sm:text-sm font-sans font-medium flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>{client.email}</span>
                {client.phone && <span className="text-stone-300">•</span>}
                {client.phone && <span className="font-mono">{client.phone}</span>}
                {client.dni && <span className="text-stone-300">•</span>}
                {client.dni && <span className="font-mono text-stone-500">DNI: {client.dni}</span>}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-stone-100">
            <Button 
              id="book-appointment-link" 
              variant="luxury" 
              size="default" 
              asChild 
              className="gap-2 shadow-luxury h-11 px-5"
            >
              <Link href={`/dashboard/calendar?client_id=${params.id}`}>
                <CalendarDays className="w-4 h-4" strokeWidth={2} />
                <span>{t('dashboard.clients.book_appointment') || 'Reservar Cita'}</span>
              </Link>
            </Button>
            <Button 
              id="edit-client-profile-btn" 
              variant="outline" 
              size="default" 
              onClick={() => setIsEditing(true)} 
              className="gap-2 h-11 px-5 bg-white/90 border-stone-200/80 hover:bg-stone-50 text-stone-700 font-semibold"
            >
              <Edit3 className="w-4 h-4 text-stone-500" strokeWidth={2} />
              <span>Editar Ficha</span>
            </Button>
          </div>
        </div>

        {/* Subinfo Grid */}
        {(client.service_address || (isBillingDifferent && client.billing_address)) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-4 border-t border-stone-100 text-stone-500 text-xs font-medium">
            {client.service_address && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="truncate">Domicilio: <strong className="text-stone-800 font-semibold">{client.service_address}</strong> {(client.service_postal_code || client.service_city) && `(${client.service_postal_code} ${client.service_city})`}</span>
              </div>
            )}

            {isBillingDifferent && client.billing_address && (
              <div className="flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="truncate">Facturación: <strong className="text-stone-750 font-mono text-[10px]">NIF {client.billing_nif}</strong> - <strong className="text-stone-800 font-semibold">{client.billing_address}</strong></span>
              </div>
            )}
          </div>
        )}

        {/* Banner de Alerta de Alergias */}
        {(() => {
          const clientAllergies = 
            businessSector === 'clinical' ? sectorMetadata.allergies :
            businessSector === 'beauty' ? sectorMetadata.cosmetic_sensitivities :
            businessSector === 'barber' ? sectorMetadata.chemical_sensitivities : null;

          if (!clientAllergies) return null;

          const allergyList = clientAllergies
            .split(',')
            .map((t: string) => t.trim())
            .filter((t: string) => t.length > 0);

          if (allergyList.length === 0) return null;

          return (
            <div className="mt-5 p-4 bg-rose-50/70 border border-rose-200/60 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-rose-800 animate-in fade-in duration-300">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="text-rose-600 shrink-0 animate-pulse w-4 h-4" />
                <div>
                  <strong className="block text-rose-950 font-bold uppercase tracking-wide text-[10px]">
                    {t('dashboard.clients.allergy_alert_title') || 'ALERTA DE ALERGIAS / INCOMPATIBILIDADES:'}
                  </strong>
                  <span className="font-semibold text-rose-700 text-xs">
                    {t('dashboard.clients.allergy_alert_desc') || 'Este paciente presenta sensibilidades o riesgos registrados.'}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 md:justify-end">
                {allergyList.map((tag: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 bg-white text-rose-800 border border-rose-200 rounded-full font-bold uppercase tracking-wider text-[9px] shadow-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })()}
      </Card>

      {/* Tabs Menu (Segmented Controls Styling) */}
      <div className="bg-stone-100/80 p-1.5 rounded-2xl flex border border-stone-200/60 mb-6 max-w-max overflow-x-auto gap-1 shadow-xs">
        <button 
          id="tab-overview-btn"
          onClick={() => setActiveTab('overview')} 
          className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${activeTab === 'overview' ? 'bg-white text-stone-900 shadow-sm border border-stone-200/50' : 'text-stone-500 hover:text-stone-900'}`}
        >
          Resumen & Ficha
        </button>
        <button 
          id="tab-appointments-btn"
          onClick={() => setActiveTab('appointments')} 
          className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${activeTab === 'appointments' ? 'bg-white text-stone-900 shadow-sm border border-stone-200/50' : 'text-stone-500 hover:text-stone-900'}`}
        >
          Servicios ({appointments.length})
        </button>
        <button 
          id="tab-vouchers-btn"
          onClick={() => setActiveTab('vouchers')} 
          className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${activeTab === 'vouchers' ? 'bg-white text-stone-900 shadow-sm border border-stone-200/50' : 'text-stone-500 hover:text-stone-900'}`}
        >
          Bonos ({vouchers.length})
        </button>
        {(businessSector === 'clinical' || businessSector === 'beauty') && enableConsents && (
          <button 
            id="tab-consents-btn"
            onClick={() => setActiveTab('consents')} 
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${activeTab === 'consents' ? 'bg-white text-stone-900 shadow-sm border border-stone-200/50' : 'text-stone-500 hover:text-stone-900'}`}
          >
            Consentimientos ({consents.length})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Alerts, Debt and Sector Specific Profile */}
        <div className="md:col-span-1 space-y-6">
          <ClientActivityCards
            appointments={appointments}
            vouchers={vouchers}
            services={services}
            dateLocale={dateLocale}
            totalDebt={totalDebt}
          />
        </div>

        {/* Right Column: Dynamic Tabs Content */}
        <div className="md:col-span-2">
          <ClientTabsContent
            activeTab={activeTab}
            appointments={appointments}
            vouchers={vouchers}
            consents={consents}
            services={services}
            isEspecialista={isEspecialista}
            onOpenPayModal={handleOpenPayModal}
            dateLocale={dateLocale}
            onNewConsentClick={() => setIsSignatureModalOpen(true)}
            clientId={params.id}
            businessSector={businessSector}
            sectorMetadata={sectorMetadata}
          />
        </div>
      </div>

      {/* Signature Pad Modal */}
      <SignaturePadModal 
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSave={handleSaveSignature}
        clientName={client.first_name + ' ' + (client.last_name || '')}
        clinicName={clinicName}
      />

      {/* Dialogo de Edición de Ficha de Cliente */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl p-0 border-none">
          <DialogHeader className="p-6 border-b border-stone-100 bg-white">
            <DialogTitle className="text-xl font-serif font-semibold text-stone-800">
              Editar Ficha de Cliente
            </DialogTitle>
            <DialogDescription className="text-stone-400 text-xs mt-0.5">
              Modifica los datos personales y campos específicos del sector del cliente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="flex flex-col">
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
              {/* Form fields with specialist permission disable check */}
              <ClientFormFields
                formData={formData}
                onChange={handleFormFieldChange}
                isBillingDifferent={isBillingDifferent}
                onBillingDifferentChange={setIsBillingDifferent}
                disabled={isEspecialista}
              />

              {/* Dynamic sector metadata inputs */}
              <div className="border-t border-stone-100 pt-6">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-stone-500 mb-4">
                  Campos Específicos del Sector
                </h4>
                <SectorMetadataInputs
                  sector={businessSector}
                  value={sectorMetadata}
                  onChange={setSectorMetadata}
                />
              </div>
            </div>

            <DialogFooter className="p-6 border-t border-stone-100 bg-white/95 backdrop-blur-md flex gap-3">
              <Button 
                id="cancel-edit-client-btn"
                type="button" 
                variant="ghost"
                onClick={() => { setIsEditing(false); fetchClient(); }} 
                className="flex-1 text-stone-600 hover:text-stone-900"
              >
                Cancelar
              </Button>
              <Button 
                id="submit-edit-client-btn"
                type="submit" 
                disabled={saving} 
                variant="luxury"
                className="flex-1 shadow-luxury"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Collect Debt Dialog */}
      <Dialog open={showPayModal} onOpenChange={setShowPayModal}>
        <DialogContent className="p-0 border border-stone-200/80 max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 border-b border-stone-100 bg-white rounded-t-3xl">
            <DialogTitle className="text-xl font-serif font-bold text-stone-900">
              Registrar Cobro
            </DialogTitle>
            <DialogDescription className="text-stone-400 text-xs mt-0.5 font-sans">
              Abonar importe a la deuda de bono.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 pb-6 bg-white space-y-4">
            <form id="pay-debt-form-profile" onSubmit={handlePayDebt} className="space-y-4">
              <p className="text-xs text-stone-600 bg-stone-50 p-3.5 rounded-xl border border-stone-100 leading-relaxed">
                La deuda pendiente es de: <strong className="text-rose-600 font-mono font-bold">{currentDebt}€</strong>.
              </p>
              
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Monto Abonado (€)</label>
                <Input 
                  id="pay-debt-amount-input"
                  required 
                  type="number" 
                  step="0.01" 
                  max={currentDebt}
                  value={payAmount} 
                  onChange={e => setPayAmount(Number(e.target.value))} 
                  className="h-12 text-lg font-bold font-mono focus-visible:ring-1 focus-visible:ring-[#D4AF37]" 
                />
              </div>
            </form>
          </div>
 
          <DialogFooter className="p-6 border-t border-stone-100 bg-white/95 backdrop-blur-md flex gap-3 rounded-b-3xl">
             <Button id="cancel-pay-debt-btn" type="button" variant="ghost" onClick={() => setShowPayModal(false)} className="flex-1 text-stone-600">
                Cancelar
             </Button>
             <Button id="submit-pay-debt-btn" form="pay-debt-form-profile" type="submit" disabled={paying} variant="luxury" className="flex-1 shadow-luxury">
               {paying ? 'Procesando...' : 'Confirmar'}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
