"use client"

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Shield, FileText, CreditCard, Sparkles, ChevronRight, Check, X, Loader2, Bot, Volume2, BookOpen, User, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface Sector {
  id: string;
  badge: string;
  title: string;
  copy: string;
  videoUrl: string;
  placeholderGradient: string;
}

export default function MarketingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'basic' | 'pro' | 'gold'>('pro');
  
  // Hover states for sectors to play/pause videos
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    tenant_name: '',
    tenant_slug: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'tenant_slug') {
      const cleanSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
      setFormData(prev => ({ ...prev, [name]: cleanSlug }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tenant_name || !formData.tenant_slug || !formData.admin_name || !formData.admin_email || !formData.admin_password) {
      toast.error('Por favor, rellena todos los campos obligatorios.');
      return;
    }

    if (formData.tenant_slug.length < 2) {
      toast.error('El subdominio debe tener al menos 2 caracteres.');
      return;
    }

    if (formData.admin_password.length < 6) {
      toast.error('La contraseña del administrador debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const isFree = selectedPlan === 'free';
    const loadingMessage = isFree 
      ? 'Creando tu base de datos aislada y cuenta gratuita...'
      : 'Creando base de datos segura y conectando pasarela...';
    
    const loadingToast = toast.loading(loadingMessage);

    try {
      const response = await fetch(`${API_URL}/stripe/create-onboarding-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          plan_type: selectedPlan
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Error al iniciar la sesión de onboarding.');
      }

      const data = await response.json();
      
      const successMessage = isFree
        ? '¡Entorno ProBookia inicializado con éxito!'
        : '¡Aprovisionamiento listo! Redirigiendo a Stripe...';
        
      toast.success(successMessage, { id: loadingToast });
      
      setTimeout(() => {
        window.location.href = data.url;
      }, 1000);

    } catch (err: any) {
      toast.error(err.message || 'Error al conectar con el servidor. Inténtalo de nuevo.', { id: loadingToast });
      setLoading(false);
    }
  };

  const fallbackSectors: Sector[] = [
    {
      id: 'clinicas',
      badge: 'Clínicas Estéticas',
      title: 'Clínicas & Wellness',
      copy: 'Aislamiento total de expedientes clínicos en base de datos, firmas manuscritas Base64 y branding de lujo.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dermatologist-examining-a-patients-face-with-magnifier-40545-large.mp4',
      placeholderGradient: 'from-blue-50 to-blue-100/30'
    },
    {
      id: 'barberias',
      badge: 'Barberías Selectas',
      title: 'Barberías Premium',
      copy: 'Gestión ágil de especialistas en tiempo real, venta de bonos express y protección total contra incomparecencias.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-barber-shaving-a-man-with-a-razor-41223-large.mp4',
      placeholderGradient: 'from-amber-50 to-amber-100/30'
    },
    {
      id: 'dentistas',
      badge: 'Odontología Avanzada',
      title: 'Consultorios Dentales',
      copy: 'Calendarios dinámicos asimétricos, cobros rápidos en POS y recordatorios automáticos por SMTP privado.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dentist-adjusting-a-surgical-light-in-clinic-40549-large.mp4',
      placeholderGradient: 'from-emerald-50 to-emerald-100/30'
    },
    {
      id: 'peluquerias',
      badge: 'Salones de Alta Costura',
      title: 'Salones de Belleza',
      copy: 'Portal de reserva en 3 pasos con colores y logotipos propios, adaptable a dominio exclusivo corporativo.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hairdresser-cutting-hair-of-a-woman-in-salon-40552-large.mp4',
      placeholderGradient: 'from-purple-50 to-purple-100/30'
    }
  ];

  const [sectors, setSectors] = useState<Sector[]>([]);
  const [heroTitle, setHeroTitle] = useState('La elegancia de tu negocio traducida en un SaaS de Lujo');
  const [heroSubtitle, setHeroSubtitle] = useState('Diseñado exclusivamente para centros de estética, wellness, spas y salones premium independientes. Agendas fluidas, expedientes médicos asimétricos y reservas de doble opt-in integradas en una experiencia sublime.');

  useEffect(() => {
    async function loadMarketingContent() {
      try {
        const response = await fetch(`${API_URL}/super-admin/marketing/public`);
        if (!response.ok) throw new Error('Error loading marketing content');
        const data = await response.json();
        
        if (data.settings) {
          if (data.settings.hero_title) setHeroTitle(data.settings.hero_title);
          if (data.settings.hero_subtitle) setHeroSubtitle(data.settings.hero_subtitle);
        }
        
        if (data.sectors && data.sectors.length > 0) {
          const mappedSectors = data.sectors.map((s: any) => {
            let gradient = 'from-blue-50 to-blue-100/30';
            if (s.slug === 'barberias' || s.order_index === 1) gradient = 'from-amber-50 to-amber-100/30';
            else if (s.slug === 'dentistas' || s.order_index === 2) gradient = 'from-emerald-50 to-emerald-100/30';
            else if (s.slug === 'peluquerias' || s.order_index === 3) gradient = 'from-purple-50 to-purple-100/30';
            
            let copy = 'Configura tu plataforma en marca blanca de alta gama con subdominio exclusivo y RLS a nivel de base de datos.';
            if (s.slug === 'clinicas') copy = 'Aislamiento total de expedientes clínicos en base de datos, firmas manuscritas Base64 y branding de lujo.';
            else if (s.slug === 'barberias') copy = 'Gestión ágil de especialistas en tiempo real, venta de bonos express y protección total contra incomparecencias.';
            else if (s.slug === 'dentistas') copy = 'Calendarios dinámicos asimétricos, cobros rápidos en POS y recordatorios automáticos por SMTP privado.';
            else if (s.slug === 'peluquerias') copy = 'Portal de reserva en 3 pasos con colores y logotipos propios, adaptable a dominio exclusivo corporativo.';
            
            return {
              id: s.id,
              badge: s.badge_text || 'Especialidad',
              title: s.title,
              copy: copy,
              videoUrl: s.video_url || 'https://assets.mixkit.co/videos/preview/mixkit-hairdresser-cutting-hair-of-a-woman-in-salon-40552-large.mp4',
              placeholderGradient: gradient
            };
          });
          setSectors(mappedSectors);
        } else {
          setSectors(fallbackSectors);
        }
      } catch (err) {
        console.error('Error fetching CMS content, falling back to static lists', err);
        setSectors(fallbackSectors);
      }
    }
    loadMarketingContent();
  }, []);

  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans selection:bg-[#d4af37]/20 overflow-x-hidden relative transition-colors duration-300">
      
      {/* 1. STICKY HEADER EDITORIAL */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-100 py-1 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl md:text-2.5xl font-serif tracking-widest text-stone-950 font-semibold select-none">
              PROBOOKIA <span className="text-blue-600 font-sans text-[10px] font-black tracking-[0.25em] uppercase ml-1">SaaS</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              href="/docs"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-stone-500 hover:text-stone-950 text-xs font-bold transition-colors"
            >
              <BookOpen size={14} />
              <span>SaaS Blueprint</span>
            </Link>
            <Link 
              href="/login" 
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-stone-50 text-stone-700 border border-stone-200/60 hover:text-stone-950 hover:bg-stone-100 transition-all duration-300 active:scale-95 shadow-sm"
            >
              Acceso Profesional
            </Link>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-stone-950 hover:bg-stone-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Comenzar Ahora
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION - BOUTIQUE BLANCA */}
      <section className="relative pt-20 pb-20 md:pt-36 md:pb-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="inline-flex items-center gap-2 bg-stone-50 border border-stone-200/60 text-stone-500 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-8 shadow-sm">
            <Sparkles className="w-3 h-3 text-blue-600" /> EL NUEVO ESTÁNDAR PARA CENTROS Y SALONES DE LUJO
          </div>
          
          <h1 
            className="text-4xl md:text-7xl font-serif font-semibold text-stone-950 tracking-tight leading-[1.1] max-w-5xl mx-auto mb-8"
            dangerouslySetInnerHTML={{ __html: heroTitle.replace(/\n/g, '<br/>') }}
          />
          
          <p className="text-base md:text-lg text-stone-500 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
            {heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto bg-stone-950 hover:bg-stone-900 text-white px-8 py-4 rounded-xl text-xs font-bold shadow-md transition-all duration-300 flex items-center justify-center gap-2 group active:scale-95"
            >
              Comenzar Prueba Gratuita <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="#sectors" 
              className="w-full sm:w-auto bg-white border border-stone-200/80 hover:bg-stone-50 text-stone-700 px-8 py-4 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center"
            >
              Ver Sectores de Especialidad
            </a>
          </div>
        </div>
      </section>

      {/* 3. SECCIÓN DE SECTORES DINÁMICA (REJILLA CON VIDEOS EN BUCLE CORTO Y 3D PARALLAX) */}
      <section id="sectors" className="py-24 bg-stone-50/50 border-y border-stone-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.25em] block mb-3">Especialidades</span>
            <h2 className="text-3xl md:text-5xl font-serif font-semibold tracking-tight text-stone-950">
              Sectores de Alta Gama
            </h2>
            <p className="text-stone-500 text-sm md:text-base mt-3 font-medium">
              ProBookia se integra con naturalidad en negocios selectos de alta ocupación proporcionando las herramientas técnicas específicas para cada perfil.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 [perspective:1500px] [transform-style:preserve-3d]">
            {sectors.map(sector => (
              <div 
                key={sector.id}
                onMouseEnter={() => setHoveredSector(sector.id)}
                onMouseLeave={() => setHoveredSector(null)}
                className="group bg-white rounded-[2rem] border border-stone-200/50 p-6 flex flex-col justify-between transition-all duration-700 ease-out h-[530px] relative overflow-hidden [transform-style:preserve-3d] [perspective:1000px] hover:[transform:rotateY(-6deg)_rotateX(4deg)_translateZ(40px)] hover:shadow-2xl hover:border-blue-600/20"
              >
                {/* Contenedor del Vídeo / Visual conceptual en proporción vertical */}
                <div className="h-[270px] w-full rounded-2xl overflow-hidden relative bg-stone-50 border border-stone-100 shrink-0 shadow-sm transition-transform duration-700 group-hover:[transform:translateZ(20px)] group-hover:shadow-md">
                  <div className={`absolute inset-0 bg-gradient-to-br ${sector.placeholderGradient} transition-opacity duration-500`}></div>
                  
                  {/* Vídeo en bucle vertical */}
                  <video
                    src={sector.videoUrl}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${hoveredSector === sector.id ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                  
                  {/* Badges Flotantes */}
                  <div className="absolute top-4 left-4 z-10 transition-transform duration-700 group-hover:[transform:translateZ(10px)]">
                    <span className="border border-stone-200/60 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-black text-blue-600 tracking-wider shadow-sm uppercase">
                      {sector.badge}
                    </span>
                  </div>
                </div>

                {/* Copys e Información con paralaje en eje Z */}
                <div className="mt-6 flex-1 flex flex-col justify-between [transform-style:preserve-3d]">
                  <div>
                    <h3 className="font-serif text-lg md:text-xl font-medium text-stone-900 mb-2 transition-transform duration-700 group-hover:[transform:translateZ(15px)]">
                      {sector.title}
                    </h3>
                    <p className="text-stone-500 text-[13px] leading-relaxed font-medium transition-transform duration-700 group-hover:[transform:translateZ(10px)]">
                      {sector.copy}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setSelectedPlan('pro');
                      setIsModalOpen(true);
                    }}
                    className="w-full py-2.5 mt-4 border border-stone-200 hover:border-stone-900 rounded-xl text-stone-700 hover:text-stone-950 text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95 transition-transform duration-700 group-hover:[transform:translateZ(5px)]"
                  >
                    <span>Configurar Entorno</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. LOS 3 PUNTOS FUERTES (BENTO REFACTORIZADO A LA ALTA GAMA) */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-24">
            <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.25em] block mb-3">La Diferencia ProBookia</span>
            <h2 className="text-3xl md:text-5xl font-serif font-semibold tracking-tight text-stone-950">
              ¿Por qué ProBookia?
            </h2>
            <p className="text-stone-500 text-sm md:text-base mt-3 font-medium">
              Dejamos obsoletas las agendas analógicas y los listados genéricos. Tres pilares técnicos blindados para proteger y proyectar tu negocio.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Beneficio 1: Multi-tenant Aislado */}
            <div className="p-8 rounded-3xl bg-stone-50/50 border border-stone-200/50 flex flex-col justify-between h-[360px] hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
              <div className="text-5xl font-serif font-medium text-stone-200/80 mb-6 group-hover:text-blue-600/10 transition-colors">01</div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h3 className="font-serif text-xl font-semibold text-stone-950">
                    Aislamiento Total RLS
                  </h3>
                </div>
                <p className="text-stone-500 text-[14px] leading-relaxed font-medium">
                  Seguridad a nivel bancario. Cada centro tiene su base de datos herméticamente aislada con Supabase RLS. Nadie ve los datos de nadie. Cumplimiento absoluto RGPD sin riesgos.
                </p>
              </div>
              <Link href="/docs?tab=aislamiento-multi-tenant" className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 mt-4">
                <span>Ver plano de arquitectura</span>
                <ChevronRight size={12} />
              </Link>
            </div>

            {/* Beneficio 2: Marca Blanca Lujo */}
            <div className="p-8 rounded-3xl bg-stone-50/50 border border-stone-200/50 flex flex-col justify-between h-[360px] hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
              <div className="text-5xl font-serif font-medium text-stone-200/80 mb-6 group-hover:text-blue-600/10 transition-colors">02</div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-serif text-xl font-semibold text-stone-950">
                    Branding Invisible de Lujo
                  </h3>
                </div>
                <p className="text-stone-500 text-[14px] leading-relaxed font-medium">
                  No vendemos ProBookia a tu paciente. Mostramos tu logotipo digitalizado, tus colores corporativos, tipografías y tu subdominio exclusivo. ProBookia es el motor oculto que te hace lucir gigante.
                </p>
              </div>
              <Link href="/docs?tab=estructura-catalogo" className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 mt-4">
                <span>Ver control de marca blanca</span>
                <ChevronRight size={12} />
              </Link>
            </div>

            {/* Beneficio 3: Copiloto por Voz */}
            <div className="p-8 rounded-3xl bg-stone-50/50 border border-stone-200/50 flex flex-col justify-between h-[360px] hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
              <div className="text-5xl font-serif font-medium text-stone-200/80 mb-6 group-hover:text-blue-600/10 transition-colors">03</div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <h3 className="font-serif text-xl font-semibold text-stone-950">
                    Co-Piloto por Voz IA
                  </h3>
                </div>
                <p className="text-stone-500 text-[14px] leading-relaxed font-medium">
                  No pierdas el tiempo haciendo clics. Habla con el sistema como a un colega humano: *"Pon el color de acento primario en dorado"* o *"Genera el copy SEO en tono clínico"*, y la IA procesará la acción al instante.
                </p>
              </div>
              <Link href="/docs?tab=limites-conversacionales" className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 mt-4">
                <span>Ver límites conversacionales</span>
                <ChevronRight size={12} />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* 5. SUSCRIPCIÓN & PRECIOS EDITORIALES */}
      <section id="pricing" className="py-24 bg-stone-50/50 border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.25em] block mb-3">Suscripciones</span>
            <h2 className="text-3xl md:text-5xl font-serif font-semibold tracking-tight text-stone-950">
              Planes de Suscripción Flexibles
            </h2>
            <p className="text-stone-500 text-sm md:text-base mt-3 font-medium">
              Elige el nivel perfecto para elevar la gestión y las reservas de tu negocio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Card 0: Gratuito */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-stone-200/50 p-8 relative flex flex-col justify-between hover:shadow-lg transition-all duration-300">
              <div>
                <div className="mb-6">
                  <span className="text-stone-400 font-bold uppercase text-[9px] tracking-widest block mb-1.5">Para Autónomos</span>
                  <h3 className="text-xl font-serif font-semibold text-stone-900">Plan Inicial</h3>
                  <div className="flex items-baseline mt-3">
                    <span className="text-3xl font-serif font-semibold text-stone-950">0€</span>
                    <span className="text-stone-400 text-xs font-medium ml-1.5">/ siempre (sin tarjeta)</span>
                  </div>
                </div>

                <div className="space-y-3.5 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-xs font-semibold text-stone-600">1 especialista único</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-xs font-semibold text-stone-600">Hasta 3 servicios</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-xs font-semibold text-stone-600">Agenda interactiva</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedPlan('free');
                  setIsModalOpen(true);
                }}
                className="w-full bg-stone-50 hover:bg-stone-100 text-stone-950 py-3.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1 active:scale-95 mt-auto border border-stone-200/50"
              >
                <span>Comenzar Gratis</span>
                <ChevronRight size={12} />
              </button>
            </div>

            {/* Card 1: Básico */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-stone-200/50 p-8 relative flex flex-col justify-between hover:shadow-lg transition-all duration-300">
              <div>
                <div className="mb-6">
                  <span className="text-stone-400 font-bold uppercase text-[9px] tracking-widest block mb-1.5">Centros Emergentes</span>
                  <h3 className="text-xl font-serif font-semibold text-stone-900">Plan Básico</h3>
                  <div className="flex items-baseline mt-3">
                    <span className="text-3xl font-serif font-semibold text-stone-950">29€</span>
                    <span className="text-stone-400 text-xs font-medium ml-1.5">/ mes (excl. IVA)</span>
                  </div>
                </div>

                <div className="space-y-3.5 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-xs font-semibold text-stone-600">Hasta 2 especialistas</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-xs font-semibold text-stone-600">Hasta 10 servicios</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-xs font-semibold text-stone-600">Agenda interactiva</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-xs font-semibold text-stone-600">TPV POS & Facturación</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedPlan('basic');
                  setIsModalOpen(true);
                }}
                className="w-full bg-stone-50 hover:bg-stone-100 text-stone-950 py-3.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1 active:scale-95 mt-auto border border-stone-200/50"
              >
                <span>Comenzar Ahora</span>
                <ChevronRight size={12} />
              </button>
            </div>

            {/* Card 2: Pro */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-600/30 p-8 relative flex flex-col justify-between hover:shadow-xl transition-all duration-300 lg:-translate-y-1">
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 rounded-bl-xl text-[8px] font-black uppercase tracking-widest">
                Recomendado
              </div>
              <div>
                <div className="mb-6">
                  <span className="text-blue-600 font-bold uppercase text-[9px] tracking-widest block mb-1.5">Clínicas en Crecimiento</span>
                  <h3 className="text-xl font-serif font-semibold text-stone-900">Plan Pro</h3>
                  <div className="flex items-baseline mt-3">
                    <span className="text-3xl font-serif font-semibold text-stone-950">59€</span>
                    <span className="text-stone-400 text-xs font-medium ml-1.5">/ mes (excl. IVA)</span>
                  </div>
                </div>

                <div className="space-y-3.5 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-xs font-semibold text-stone-600">Hasta 5 especialistas</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-xs font-semibold text-stone-600">Hasta 25 servicios</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-xs font-semibold text-stone-600">Agenda interactiva</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-xs font-semibold text-stone-600">Expedientes con firma</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-xs font-semibold text-stone-600">TPV POS & Facturación</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedPlan('pro');
                  setIsModalOpen(true);
                }}
                className="w-full bg-stone-950 hover:bg-stone-900 text-white py-3.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1 active:scale-95 mt-auto shadow-md"
              >
                <span>Comenzar Prueba</span>
                <ChevronRight size={12} />
              </button>
            </div>

            {/* Card 3: Gold */}
            <div className="bg-stone-950 text-white rounded-2xl shadow-sm overflow-hidden border border-stone-800 p-8 relative flex flex-col justify-between hover:shadow-lg transition-all duration-300">
              <div>
                <div className="mb-6">
                  <span className="text-[#d4af37] font-bold uppercase text-[9px] tracking-widest block mb-1.5">Rendimiento Máximo & IA</span>
                  <h3 className="text-xl font-serif font-semibold">Plan Gold</h3>
                  <div className="flex items-baseline mt-3">
                    <span className="text-3xl font-serif font-semibold">99€</span>
                    <span className="text-stone-500 text-xs font-medium ml-1.5">/ mes (excl. IVA)</span>
                  </div>
                </div>

                <div className="space-y-3.5 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center text-[#d4af37]">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-xs font-semibold text-stone-200">Especialistas ilimitados</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center text-[#d4af37]">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-xs font-semibold text-stone-200">Servicios ilimitados</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center text-[#d4af37]">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-xs font-semibold text-stone-200">Agenda interactiva</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center text-[#d4af37]">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-xs font-semibold text-stone-200">Expedientes con firma</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center text-[#d4af37]">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-xs font-semibold text-stone-200">POS & Facturación Deluxe</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-yellow-500/10 rounded-full flex items-center justify-center text-[#d4af37]">
                      <Sparkles className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-xs font-bold text-[#d4af37]">Acceso Co-piloto Voz IA</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedPlan('gold');
                  setIsModalOpen(true);
                }}
                className="w-full bg-white hover:bg-stone-100 text-stone-950 py-3.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1 active:scale-95 mt-auto shadow-md"
              >
                <span>Comenzar Ahora</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-stone-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 border-b border-stone-900 pb-12 mb-12">
          <div>
            <span className="text-xl font-serif tracking-widest text-white block mb-2">PROBOOKIA SaaS</span>
            <p className="text-stone-400 text-xs md:text-sm max-w-sm leading-relaxed font-medium">
              La plataforma invisible de alta gama para agendamiento, gestión de citas, facturación y TPV en centros selectos.
            </p>
          </div>
          <div className="flex gap-8 text-xs font-bold text-stone-400">
            <Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
            <Link href="/aviso-legal" className="hover:text-white transition-colors">Aviso Legal</Link>
            <Link href="/docs" className="hover:text-white transition-colors">VIP Blueprint Docs</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-stone-600 font-semibold">
          &copy; {new Date().getFullYear()} ProBookia. Todos los derechos reservados. SaaS Quiet Luxury B2B.
        </div>
      </footer>

      {/* 6. ONBOARDING REGISTRATION MODAL (BOUTIQUE BLANCA) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-stone-200/50 p-8 md:p-10 relative overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-stone-50 border border-stone-200/50 flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors shadow-sm active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-8">
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 block mb-2">
                {selectedPlan === 'free' ? 'Plan Inicial' : 'Registro de Cliente B2B'}
              </span>
              <h2 className="text-2.5xl font-serif font-semibold text-stone-900 leading-tight">
                {selectedPlan === 'free' && 'Configura tu Entorno de Citas'}
                {selectedPlan === 'basic' && 'Inicializa tu Plan Básico'}
                {selectedPlan === 'pro' && 'Inicializa tu Plan Pro'}
                {selectedPlan === 'gold' && 'Inicializa tu Plan Gold'}
              </h2>
              <p className="text-stone-500 text-xs md:text-sm mt-2 leading-relaxed font-medium">
                {selectedPlan === 'free' 
                  ? 'Aprovisiona tu base de datos dedicada y comienza con el Plan Inicial (1 especialista, 3 servicios) sin compromisos.'
                  : `Aprovisiona tu entorno de seguridad dedicado. Incluye una prueba gratuita de 14 días en el Plan ${selectedPlan.toUpperCase()}.`
                }
              </p>
            </div>

            <form onSubmit={handleOnboardingSubmit} className="space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 pb-1 border-b border-stone-100">Datos de la Organización</h3>
                
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">Nombre de la Clínica o Centro</label>
                  <input 
                    type="text" 
                    name="tenant_name"
                    required
                    placeholder="Ej. Clínica Mercè, Spazio Estético, Barbería Jade"
                    value={formData.tenant_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-xs font-semibold text-stone-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">Subdominio Dedicado</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="tenant_slug"
                      required
                      placeholder="clinica-merce"
                      value={formData.tenant_slug}
                      onChange={handleInputChange}
                      className="w-full pl-4 pr-32 py-3 bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-xs font-mono text-stone-700 font-semibold"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-stone-400 font-sans pointer-events-none">
                      .probookia.com
                    </span>
                  </div>
                  {formData.tenant_slug && (
                    <span className="block text-[9px] text-blue-600 mt-2 font-black tracking-wide">
                      Dirección única: <span className="font-mono text-stone-600 font-bold">https://{formData.tenant_slug}.probookia.com</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 pb-1 border-b border-stone-100">Cuenta de Administrador Principal</h3>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">Nombre del Director</label>
                  <input 
                    type="text" 
                    name="admin_name"
                    required
                    placeholder="Ej. Sofía Valenzuela"
                    value={formData.admin_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-xs font-semibold text-stone-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">Email Corporativo</label>
                  <input 
                    type="email" 
                    name="admin_email"
                    required
                    placeholder="directiva@clinicamerce.com"
                    value={formData.admin_email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-xs font-semibold text-stone-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">Contraseña del Sistema</label>
                  <input 
                    type="password" 
                    name="admin_password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={formData.admin_password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-xs font-semibold text-stone-700"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-stone-950 hover:bg-stone-900 text-white font-bold py-3.5 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> {selectedPlan === 'free' ? 'Configurando base de datos...' : 'Redirigiendo a pasarela...'}
                  </>
                ) : (
                  <>
                    <span>{selectedPlan === 'free' ? 'Inicializar Cuenta Gratis' : 'Aprovisionar Entorno y Pagar'}</span> 
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
