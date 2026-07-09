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

// Import modular subcomponents
import { ClientFormFields } from './components/ClientFormFields';
import { SectorMetadataInputs } from './components/SectorMetadataInputs';

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

export default function ClientsPage() {
  const { t } = useLanguage();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [businessSector, setBusinessSector] = useState<string>('general');
  
  // Validation and Data States
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    dni: '',
    service_address: '',
    service_postal_code: '',
    service_city: '',
    billing_name: '',
    billing_nif: '',
    billing_address: '',
    billing_postal_code: '',
    billing_city: ''
  });
  const [isBillingDifferent, setIsBillingDifferent] = useState(false);
  const [sectorMetadata, setSectorMetadata] = useState<any>({});
  
  const [errors, setErrors] = useState({ first_name: '', email: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClients();
    fetchSettings();
  }, []);

  useEffect(() => {
    // Reset metadata based on sector
    if (businessSector === 'clinical') {
      setSectorMetadata({ allergies: '', clinical_notes: '', injury_history: '', medications: '', has_consents: false });
    } else if (businessSector === 'beauty') {
      setSectorMetadata({ color_formulas: '', skin_hair_type: '', product_sensitivities: '', gallery_before_after: [] });
    } else if (businessSector === 'veterinary') {
      setSectorMetadata({ pet_name: '', pet_species: '', pet_breed: '', pet_age: '', vaccination_record: '', temperament: '' });
    } else if (businessSector === 'automotive') {
      setSectorMetadata({ license_plate: '', brand: '', model: '', year: '', mileage: '', vin: '' });
    } else if (businessSector === 'home_services') {
      setSectorMetadata({ sq_meters: '', property_type: '', access_codes: '', dangerous_pets: false });
    } else if (businessSector === 'professional') {
      setSectorMetadata({ company_sector: '', website_url: '', cloud_folder_url: '' });
    } else {
      setSectorMetadata({ internal_notes: '' });
    }
  }, [businessSector]);

  const fetchClients = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/`);
      if (res.ok) {
        const data = await res.json();
        // Ocultar clientes genéricos de contado del listado
        const filtered = Array.isArray(data) 
          ? data.filter((c: Client) => {
              if (!c.email) return true;
              const lower = c.email.toLowerCase();
              return !(lower.endsWith('@generico.local') || lower.startsWith('contado@') || lower.startsWith('contado_'));
            }) 
          : [];
        setClients(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/settings/`);
      if (res.ok) {
        const data = await res.json();
        setBusinessSector(data.business_sector || 'general');
      }
    } catch (err) {
      console.error("Error fetching settings", err);
    }
  };

  const validate = () => {
    let valid = true;
    const newErrors = { first_name: '', email: '' };
    
    if (!formData.first_name.trim()) { 
      newErrors.first_name = t('dashboard.clients.first_name_required') || 'El nombre es obligatorio'; 
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

  const handleFormFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (field === 'first_name' || field === 'email') {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSaving(true);
    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name || null,
        email: formData.email,
        phone: formData.phone || null,
        dni: formData.dni || null,
        address: formData.service_address || null,
        
        service_address: formData.service_address || null,
        service_postal_code: formData.service_postal_code || null,
        service_city: formData.service_city || null,
        
        billing_name: isBillingDifferent ? formData.billing_name : `${formData.first_name} ${formData.last_name || ''}`.trim(),
        billing_nif: isBillingDifferent ? formData.billing_nif : (formData.dni || null),
        billing_address: isBillingDifferent ? formData.billing_address : (formData.service_address || null),
        billing_postal_code: isBillingDifferent ? formData.billing_postal_code : (formData.service_postal_code || null),
        billing_city: isBillingDifferent ? formData.billing_city : (formData.service_city || null),
        
        sector_metadata: sectorMetadata
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error(t('dashboard.clients.server_error') || "Error en el servidor al guardar");
      
      await fetchClients();
      setIsModalOpen(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        dni: '',
        service_address: '',
        service_postal_code: '',
        service_city: '',
        billing_name: '',
        billing_nif: '',
        billing_address: '',
        billing_postal_code: '',
        billing_city: ''
      });
      setIsBillingDifferent(false);
      toast.success(t('dashboard.clients.client_registered') || 'Cliente registrado correctamente');
    } catch (err) {
      toast.error(t('dashboard.clients.save_error') || "No se pudo guardar la ficha. Verifica la conexión.");
    } finally {
      setSaving(false);
    }
  };

  const getDynamicColumnHeader = () => {
    switch (businessSector) {
      case 'clinical': return 'Alertas Clínicas';
      case 'beauty': return 'Tipo de Piel';
      case 'barber': return 'Tipo de Cabello';
      case 'veterinary': return 'Mascota';
      case 'automotive': return 'Vehículo';
      case 'home_services': return 'Propiedad';
      case 'professional': return 'Empresa / Sector';
      default: return 'Notas Internas';
    }
  };

  const getDynamicColumnValue = (client: Client) => {
    const meta = client.sector_metadata || {};
    switch (businessSector) {
      case 'clinical':
        return meta.allergies ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive mr-1.5"></span>
            {meta.allergies}
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
            Ninguna
          </span>
        );
      case 'beauty':
        return <span className="text-stone-700 font-medium text-xs">{meta.skin_type || 'No registrado'}</span>;
      case 'barber':
        return <span className="text-stone-700 font-medium text-xs">{meta.hair_type || 'No registrado'}</span>;
      case 'veterinary':
        return meta.pet_name ? (
          <span className="text-stone-700 font-medium text-xs font-mono">{meta.pet_name} {meta.pet_species ? `(${meta.pet_species})` : ''}</span>
        ) : (
          <span className="text-stone-400 italic text-xs">Sin mascota</span>
        );
      case 'automotive':
        return meta.brand ? (
          <span className="text-stone-700 font-medium text-xs font-mono">{meta.brand} {meta.model} {meta.license_plate ? `[${meta.license_plate}]` : ''}</span>
        ) : (
          <span className="text-stone-400 italic text-xs">Sin vehículo</span>
        );
      case 'home_services':
        return meta.property_type ? (
          <span className="text-stone-700 font-medium text-xs">{meta.property_type} {meta.sq_meters ? `(${meta.sq_meters}m²)` : ''}</span>
        ) : (
          <span className="text-stone-400 italic text-xs">No registrado</span>
        );
      case 'professional':
        return <span className="text-stone-700 font-medium text-xs">{meta.company_sector || 'No registrado'}</span>;
      default:
        return <span className="text-stone-500 text-xs truncate max-w-[150px] inline-block">{meta.internal_notes || 'Sin observaciones'}</span>;
    }
  };

  return (
    <div className="animate-in fade-in duration-500 bg-[#FAFAFA] min-h-screen p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-serif font-light text-stone-800 tracking-tight">
            {t('dashboard.clients.directory_title') || 'Directorio de Clientes'}
          </h1>
          <p className="text-stone-400 mt-1.5 text-sm font-medium">
            {businessSector === 'clinical' && 'Gestión de fichas médicas e historiales clínicos'}
            {businessSector === 'beauty' && 'Fichas de cuidado facial, corporal y bienestar'}
            {businessSector === 'barber' && 'Fichas de cuidado personal, estilo y color'}
            {businessSector === 'veterinary' && 'Directorio de propietarios y mascotas'}
            {businessSector === 'automotive' && 'Control de vehículos e historiales de taller'}
            {businessSector === 'home_services' && 'Gestión de clientes y servicios a domicilio'}
            {businessSector === 'professional' && 'Directorio corporativo y consultoría'}
            {businessSector === 'general' && 'Gestión y directorio general de clientes'}
          </p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <button id="add-client-btn" className="bg-stone-900 text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-[#D4AF37] hover:text-stone-950 transition-all active:scale-95 shadow-lg shadow-stone-200 flex items-center gap-2 group">
              <UserPlus size={18} className="group-hover:rotate-12 transition-transform" />
              {t('dashboard.clients.add_client') || 'Añadir Cliente'}
            </button>
          </DialogTrigger>
          <DialogContent className="p-0 border-none max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl">
            <DialogHeader className="p-8 md:p-10 pb-6 border-b border-stone-100 bg-white relative z-10 rounded-t-xl">
              <DialogTitle className="text-3xl font-serif font-light text-stone-800 tracking-tight">
                {t('dashboard.clients.new_medical_record') || 'Registrar Ficha de Cliente'}
              </DialogTitle>
              <DialogDescription className="text-stone-400 text-sm mt-1">
                Completa los datos del cliente. Los campos obligatorios están marcados con (*).
              </DialogDescription>
            </DialogHeader>

            <form id="client-form" onSubmit={handleSubmit} className="flex flex-col bg-white">
              <div className="px-8 md:px-10 py-6 pb-20 max-h-[60vh] overflow-y-auto">
                {/* Contact and address form fields */}
                <ClientFormFields
                  formData={formData}
                  onChange={handleFormFieldChange}
                  errors={errors}
                  isBillingDifferent={isBillingDifferent}
                  onBillingDifferentChange={setIsBillingDifferent}
                />

                {/* Sector dynamic fields inputs */}
                <div className="border-t border-stone-100 pt-6 mt-6">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-stone-500 mb-4">
                    {businessSector === 'clinical' && 'Información Clínica / Médica'}
                    {businessSector === 'beauty' && 'Ficha de Estética & Bienestar'}
                    {businessSector === 'barber' && 'Ficha de Estilo & Belleza'}
                    {businessSector === 'veterinary' && 'Datos de la Mascota'}
                    {businessSector === 'automotive' && 'Ficha del Vehículo'}
                    {businessSector === 'home_services' && 'Detalles del Servicio a Domicilio'}
                    {businessSector === 'professional' && 'Información Profesional / Consultoría'}
                    {businessSector === 'general' && 'Observaciones Generales'}
                  </h4>
                  <SectorMetadataInputs
                    sector={businessSector}
                    value={sectorMetadata}
                    onChange={setSectorMetadata}
                  />
                </div>
              </div>

              <div className="sticky bottom-0 left-0 w-full flex justify-end gap-3 p-8 md:p-10 py-6 border-t border-stone-100 bg-white rounded-b-2xl z-20">
                <button 
                  id="cancel-add-client-btn"
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-4 rounded-full text-xs font-bold text-stone-400 hover:text-stone-600 transition-all"
                >
                  {t('dashboard.clients.cancel') || 'Cancelar'}
                </button>
                <button 
                  id="submit-client-form-btn"
                  disabled={saving} 
                  type="submit" 
                  className="bg-[#D4AF37] text-stone-950 hover:bg-[#c49f27] disabled:opacity-50 px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95 animate-in fade-in"
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
                <th className="px-8 py-4 font-semibold">{getDynamicColumnHeader()}</th>
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
                  .filter(c => {
                    if (!c.email) return true;
                    const lower = c.email.toLowerCase();
                    return !(lower.endsWith('@generico.local') || lower.startsWith('contado@') || lower.startsWith('contado_'));
                  })
                  .map((client, index) => (
                  <tr 
                    key={client.id} 
                    className="hover:bg-muted/30 group transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-serif font-bold shadow-sm border border-stone-200">
                          {client.first_name ? client.first_name.charAt(0).toUpperCase() : client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-stone-800 text-sm">
                            {client.first_name} {client.last_name || ''}
                          </div>
                          <div className="text-[11px] text-stone-400 mt-0.5 font-mono">ID: {client.id.split('-')[0]}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-stone-700 font-medium text-sm">{client.email}</div>
                      <div className="text-stone-400 text-xs mt-0.5 font-medium">
                        {client.phone || (t('dashboard.clients.no_phone') || 'Sin teléfono')}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {getDynamicColumnValue(client)}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link 
                        id={`view-client-details-btn-${index}`}
                        href={`/dashboard/clients/${client.id}`}
                        className="p-2.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-[#D4AF37] transition-all border border-transparent hover:border-stone-100 inline-flex items-center justify-center group/eye"
                        title={t('dashboard.clients.view_full_record') || "Ver ficha completa"}
                      >
                        <Eye size={18} strokeWidth={1.5} className="group-hover/eye:scale-110 transition-transform" />
                      </Link>
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
