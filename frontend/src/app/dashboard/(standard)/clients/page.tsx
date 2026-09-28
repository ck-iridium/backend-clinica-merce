"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Eye, UserPlus, Search, X, Users, Sparkles, Phone, Mail, ArrowUpRight } from "lucide-react";
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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
  const [searchQuery, setSearchQuery] = useState('');
  
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

  const filteredClients = clients.filter((c: Client) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const fullName = `${c.first_name || ''} ${c.last_name || ''} ${c.name || ''}`.toLowerCase();
    const email = (c.email || '').toLowerCase();
    const phone = (c.phone || '').toLowerCase();
    const dni = (c.dni || '').toLowerCase();
    return fullName.includes(q) || email.includes(q) || phone.includes(q) || dni.includes(q);
  });

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
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
            {meta.allergies}
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs">
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
    <div className="animate-in fade-in duration-500 space-y-6">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-2">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100/80 border border-stone-200/60 text-[10px] font-bold uppercase tracking-widest text-stone-500">
            <Users className="w-3 h-3 text-[#D4AF37]" />
            <span>Fichas & Clientes</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight">
            {t('dashboard.clients.directory_title') || 'Directorio de Clientes'}
          </h1>
          <p className="text-stone-400 text-xs sm:text-sm font-sans font-medium">
            {businessSector === 'clinical' && 'Gestión de expedientes médicos e historiales clínicos'}
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
            <Button 
              id="add-client-btn" 
              variant="luxury" 
              size="default" 
              className="gap-2 shadow-luxury h-11 px-6 shrink-0"
            >
              <UserPlus className="w-4 h-4" strokeWidth={2} />
              <span>{t('dashboard.clients.add_client') || 'Añadir Cliente'}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0 border border-stone-200/80 max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl">
            <DialogHeader className="p-7 sm:p-9 pb-5 border-b border-stone-100 bg-white relative z-10">
              <DialogTitle className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                {t('dashboard.clients.new_medical_record') || 'Registrar Ficha de Cliente'}
              </DialogTitle>
              <DialogDescription className="text-stone-400 text-xs sm:text-sm mt-1 font-sans">
                Completa los datos del cliente. Los campos obligatorios están marcados con (*).
              </DialogDescription>
            </DialogHeader>

            <form id="client-form" onSubmit={handleSubmit} className="flex flex-col bg-white">
              <div className="px-7 sm:px-9 py-6 max-h-[60vh] overflow-y-auto space-y-6">
                {/* Contact and address form fields */}
                <ClientFormFields
                  formData={formData}
                  onChange={handleFormFieldChange}
                  errors={errors}
                  isBillingDifferent={isBillingDifferent}
                  onBillingDifferentChange={setIsBillingDifferent}
                />

                {/* Sector dynamic fields inputs */}
                <div className="border-t border-stone-100 pt-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4">
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

              <div className="sticky bottom-0 left-0 w-full flex justify-end items-center gap-3 p-6 sm:p-8 border-t border-stone-100 bg-white/95 backdrop-blur-md rounded-b-3xl z-20">
                <Button 
                  id="cancel-add-client-btn"
                  type="button" 
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="text-stone-500 hover:text-stone-800"
                >
                  {t('dashboard.clients.cancel') || 'Cancelar'}
                </Button>
                <Button 
                  id="submit-client-form-btn"
                  disabled={saving} 
                  type="submit" 
                  variant="luxury"
                  className="shadow-luxury px-8 h-11"
                >
                  {saving ? (t('dashboard.clients.registering') || 'Registrando...') : (t('dashboard.clients.register_record') || 'Registrar Ficha')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, email, teléfono o DNI..."
            className="pl-10 pr-9 h-11 bg-white/90 border-stone-200/80 rounded-xl focus-visible:ring-1 focus-visible:ring-[#D4AF37] text-xs sm:text-sm font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 rounded-full hover:bg-stone-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs font-mono font-bold text-stone-500 bg-stone-100/90 px-3 py-1.5 rounded-full border border-stone-200/60 shadow-xs">
            {filteredClients.length} {filteredClients.length === 1 ? 'cliente' : 'clientes'}
            {searchQuery && ` (de ${clients.length})`}
          </span>
        </div>
      </div>

      {/* ── Clients Table Card (Quiet Luxury Island) ── */}
      <Card className="rounded-[2rem] border border-stone-200/70 bg-white/80 backdrop-blur-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="bg-stone-50/70 border-b border-stone-100 text-stone-400 text-[10px] font-bold tracking-widest uppercase">
                <th className="px-6 sm:px-8 py-4 font-semibold">{t('dashboard.clients.client') || 'Cliente'}</th>
                <th className="px-6 sm:px-8 py-4 font-semibold">{t('dashboard.clients.contact') || 'Contacto'}</th>
                <th className="px-6 sm:px-8 py-4 font-semibold">{getDynamicColumnHeader()}</th>
                <th className="px-6 sm:px-8 py-4 font-semibold text-right">{t('dashboard.clients.actions') || 'Acciones'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100/80">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 sm:px-8 py-5">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-2xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32 rounded-lg" />
                          <Skeleton className="h-3 w-16 rounded-md" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 sm:px-8 py-5">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40 rounded-lg" />
                        <Skeleton className="h-3 w-24 rounded-md" />
                      </div>
                    </td>
                    <td className="px-6 sm:px-8 py-5"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="px-6 sm:px-8 py-5"><Skeleton className="h-8 w-8 ml-auto rounded-xl" /></td>
                  </tr>
                ))
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-20 text-stone-400 font-medium text-sm">
                    {searchQuery ? (
                      <div className="space-y-2">
                        <p className="font-serif font-bold text-stone-700 text-base">No se encontraron resultados</p>
                        <p className="text-xs text-stone-400">Ningún cliente coincide con la búsqueda &ldquo;{searchQuery}&rdquo;</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchQuery('')}
                          className="mt-2 text-xs"
                        >
                          Limpiar filtro
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="font-serif font-bold text-stone-700 text-base">Sin clientes registrados</p>
                        <p className="text-xs text-stone-400">{t('dashboard.clients.no_clients') || 'Aún no hay clientes registrados en el sistema.'}</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredClients.map((client, index) => {
                  const initial = client.first_name ? client.first_name.charAt(0).toUpperCase() : client.name.charAt(0).toUpperCase();
                  return (
                    <tr 
                      key={client.id} 
                      className="hover:bg-stone-50/70 group transition-colors border-b border-stone-100/70 last:border-b-0"
                    >
                      <td className="px-6 sm:px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-stone-100/90 border border-stone-200/60 flex items-center justify-center text-stone-700 font-serif font-bold text-base shadow-xs group-hover:border-[#D4AF37]/50 group-hover:bg-amber-500/10 group-hover:text-[#B38F26] transition-colors shrink-0">
                            {initial}
                          </div>
                          <div>
                            <div className="font-semibold text-stone-900 text-sm sm:text-base group-hover:text-stone-950 transition-colors">
                              {client.first_name} {client.last_name || ''}
                            </div>
                            <div className="text-[11px] text-stone-400 mt-1 font-mono tracking-wide">ID: {client.id.split('-')[0]}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 sm:px-8 py-6">
                        <div className="text-stone-800 font-medium text-xs sm:text-sm flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </div>
                        <div className="text-stone-400 text-xs mt-1.5 font-medium flex items-center gap-2 font-mono">
                          <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                          <span>{client.phone || (t('dashboard.clients.no_phone') || 'Sin teléfono')}</span>
                        </div>
                      </td>
                      <td className="px-6 sm:px-8 py-6">
                        {getDynamicColumnValue(client)}
                      </td>
                      <td className="px-6 sm:px-8 py-6 text-right">
                        <Button
                          id={`view-client-details-btn-${index}`}
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-9 px-3.5 rounded-xl hover:bg-amber-500/10 hover:text-[#B38F26] gap-2 text-stone-500 font-medium group/eye transition-all"
                        >
                          <Link href={`/dashboard/clients/${client.id}`}>
                            <span className="hidden sm:inline text-xs font-semibold">Ver ficha</span>
                            <Eye className="w-4 h-4 text-stone-400 group-hover/eye:text-[#D4AF37] transition-colors" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
