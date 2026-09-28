'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, ShoppingCart, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useAuthRole } from '@/hooks/useAuthRole';

import { Client, Service, Category, PaymentMethod } from './components/types';
import { usePOSCart } from './hooks/usePOSCart';
import { POSCatalog } from './components/POSCatalog';
import { POSTicket } from './components/POSTicket';
import { POSSuccessView } from './components/POSSuccessView';
import { POSMobileBar } from './components/POSMobileBar';

export default function POSPage() {
  const { t, language } = useLanguage();
  const { showFeedback } = useFeedback();
  const router = useRouter();
  const { role, loading: loadingRole } = useAuthRole();

  // Estado del Carrito y Precios
  const cartHook = usePOSCart();

  // Estado de Datos
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Estados de Búsqueda y Navegación
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [serviceSearch, setServiceSearch] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Estados de la Facturación
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedClientName, setSelectedClientName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tarjeta');
  const [isSimplified, setIsSimplified] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<any>(null);

  // Referencias para detección de clics fuera
  const clientDropdownRef = useRef<HTMLDivElement>(null);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Control RBAC
  useEffect(() => {
    if (!loadingRole) {
      const currentRole = role?.toLowerCase();
      const hasAccess =
        currentRole === 'administrador' ||
        currentRole === 'admin' ||
        currentRole === 'recepción' ||
        currentRole === 'recepcion';

      if (!hasAccess) {
        router.replace('/dashboard');
        toast.error(t('dashboard.pos.access_denied') || 'Acceso denegado: No tienes permisos para realizar ventas.');
      } else {
        fetchData();
      }
    }
  }, [role, loadingRole, router, t]);

  // Cerrar desplegables al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setShowClientDropdown(false);
      }
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target as Node)) {
        setShowServiceDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Carga de catálogo y clientes
  const fetchData = async () => {
    try {
      const [cRes, sRes, catRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-categories/`),
      ]);

      if (cRes.ok) {
        const clientsData = await cRes.json();
        const filteredClients = Array.isArray(clientsData)
          ? clientsData.filter((c: any) => {
              if (!c.email) return true;
              const lower = c.email.toLowerCase();
              return !(lower.endsWith('@generico.local') || lower.startsWith('contado@') || lower.startsWith('contado_'));
            })
          : [];
        setClients(filteredClients);
      }

      if (sRes.ok) {
        const servs = await sRes.json();
        setServices(servs.filter((s: any) => s.is_active));
      }

      if (catRes.ok) {
        setCategories(await catRes.json());
      }
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar los datos del POS');
    } finally {
      setLoading(false);
    }
  };

  // Procesar cobro y emitir factura
  const handleProcessSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartHook.cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }
    if (!isSimplified && !selectedClientId) {
      toast.error('Debes seleccionar un cliente para una Factura Nominal');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/direct-sale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: isSimplified ? 'simplified' : selectedClientId,
          final_price: Number(cartHook.totalAmount.toFixed(2)),
          payment_method: paymentMethod,
          is_simplified: isSimplified,
          date: selectedDate,
          services: cartHook.cart.map((item) => ({ service_id: item.id, price: Number(item.price) })),
        }),
      });

      if (res.ok) {
        const invoice = await res.json();
        setLastInvoice(invoice);
        setIsCartDrawerOpen(false);
        toast.success('Venta realizada con éxito');
      } else {
        const err = await res.json();
        showFeedback({
          type: 'error',
          title: 'Error al procesar cobro',
          message: err?.detail || t('dashboard.pos.sale_error') || 'Error al procesar la venta',
        });
      }
    } catch (e) {
      console.error(e);
      toast.error('Error de red al procesar la venta');
    } finally {
      setIsProcessing(false);
    }
  };

  // Limpiar formulario y empezar nueva venta
  const resetForm = () => {
    setLastInvoice(null);
    cartHook.resetCart();
    setSelectedClientId('');
    setSelectedClientName('');
    setClientSearch('');
    setServiceSearch('');
    setPaymentMethod('Tarjeta');
    setIsSimplified(true);
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Filtro de clientes para el desplegable nominal
  const filteredClients = clients
    .filter(
      (c) =>
        c.email !== 'contado@generico.local' &&
        !c.email?.endsWith('@generico.local') &&
        (c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
          c.email?.toLowerCase().includes(clientSearch.toLowerCase()) ||
          c.phone?.includes(clientSearch))
    )
    .slice(0, 5);

  const getFriendlyDateStr = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const locale = language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'es-ES';
      return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const currentRole = role?.toLowerCase();
  const hasAccess =
    currentRole === 'administrador' ||
    currentRole === 'admin' ||
    currentRole === 'recepción' ||
    currentRole === 'recepcion';

  if (loading || loadingRole || !hasAccess) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center h-[60vh] bg-[#FAFAFA] animate-in fade-in duration-500">
        <Skeleton className="w-16 h-16 rounded-3xl bg-stone-200" />
        <Skeleton className="w-48 h-6 rounded-xl bg-stone-200" />
      </div>
    );
  }

  // Props compartidas del ticket para evitar duplicación entre Desktop y Móvil
  const ticketProps = {
    cart: cartHook.cart,
    editingIndex: cartHook.editingIndex,
    setEditingIndex: cartHook.setEditingIndex,
    tempItemPrice: cartHook.tempItemPrice,
    setTempItemPrice: cartHook.setTempItemPrice,
    updateItemPrice: cartHook.updateItemPrice,
    removeFromCart: (idx: number) => {
      cartHook.removeFromCart(idx);
      if (cartHook.cart.length <= 1) {
        setIsCartDrawerOpen(false);
      }
    },
    isSimplified,
    setIsSimplified,
    selectedClientId,
    selectedClientName,
    onSelectClient: (id: string, name: string) => {
      setSelectedClientId(id);
      setSelectedClientName(name);
    },
    onClearClient: () => {
      setSelectedClientId('');
      setSelectedClientName('');
      setClientSearch('');
    },
    clientSearch,
    setClientSearch,
    showClientDropdown,
    setShowClientDropdown,
    filteredClients,
    clientDropdownRef,
    selectedDate,
    setSelectedDate,
    getFriendlyDateStr,
    paymentMethod,
    setPaymentMethod,
    isPriceModified: cartHook.isPriceModified,
    handleResetPrices: cartHook.handleResetPrices,
    subtotal: cartHook.subtotal,
    taxAmount: cartHook.taxAmount,
    totalAmount: cartHook.totalAmount,
    customTotal: cartHook.customTotal,
    isEditingTotal: cartHook.isEditingTotal,
    setIsEditingTotal: cartHook.setIsEditingTotal,
    customTotalInput: cartHook.customTotalInput,
    setCustomTotalInput: cartHook.setCustomTotalInput,
    handleApplyCustomTotal: cartHook.handleApplyCustomTotal,
    handleProcessSale,
    isProcessing,
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 md:px-8 font-sans text-stone-800 animate-in fade-in duration-700 pb-32 lg:pb-12">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Cabecera Principal */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-stone-200/60 pb-8 relative">
          <div className="space-y-2">
            <div className="flex items-center gap-3.5">
              <span className="w-12 h-12 rounded-2xl bg-stone-900 border border-amber-400/20 text-[#D4AF37] flex items-center justify-center shadow-md shrink-0">
                <Tag size={22} className="text-[#D4AF37]" />
              </span>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
                    {t('dashboard.pos.quick_sale') || 'Caja & Venta Rápida'}
                  </h1>
                  <Badge variant="luxury" className="text-[10px] hidden sm:inline-flex py-0.5 px-2.5">
                    TPV Directo
                  </Badge>
                </div>
                <p className="text-stone-500 font-normal text-xs sm:text-sm mt-0.5">
                  {t('dashboard.pos.direct_billing_desc') ||
                    'Terminal de cobro directo y emisión instantánea de ticket unificado.'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white/90 backdrop-blur-md rounded-full border border-stone-200/80 shadow-2xs text-xs font-semibold text-stone-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Terminal Activo</span>
            </div>
          </div>
        </header>

        {lastInvoice ? (
          /* Vista de Factura Emitida y Cobrada */
          <POSSuccessView
            lastInvoice={lastInvoice}
            paymentMethod={paymentMethod}
            getFriendlyDateStr={getFriendlyDateStr}
            onNewSale={resetForm}
          />
        ) : (
          /* Cuadrícula de Dos Columnas */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Columna Izquierda: Catálogo y Búsqueda */}
            <POSCatalog
              services={services}
              categories={categories}
              onAddToCart={cartHook.addToCart}
              serviceSearch={serviceSearch}
              setServiceSearch={setServiceSearch}
              showServiceDropdown={showServiceDropdown}
              setShowServiceDropdown={setShowServiceDropdown}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              serviceDropdownRef={serviceDropdownRef}
            />

            {/* Columna Derecha: Ticket de Escritorio */}
            <div className="hidden lg:block lg:col-span-5 bg-[#141416] text-white rounded-[2rem] p-7 sm:p-8 border border-stone-800/80 shadow-luxury space-y-6 relative overflow-hidden backdrop-blur-2xl">
              <div className="absolute top-[-60px] right-[-60px] w-72 h-72 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                    <ShoppingCart size={16} />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                    {t('dashboard.pos.ticket_summary') || '2. Resumen & Ticket'}
                  </h3>
                </div>
                <span className="text-[11px] font-bold px-3 py-1 bg-white/10 text-white/90 rounded-full font-mono uppercase tracking-wider border border-white/10">
                  {cartHook.cart.length === 1
                    ? t('dashboard.pos.items_count_one')?.replace('{count}', String(cartHook.cart.length)) || '1 ítem'
                    : t('dashboard.pos.items_count')?.replace('{count}', String(cartHook.cart.length)) ||
                      `${cartHook.cart.length} ítems`}
                </span>
              </div>

              <POSTicket isInsideDrawer={false} {...ticketProps} />
            </div>
          </div>
        )}

        {/* Aviso Legal y Fiscalidad */}
        <footer className="p-6 bg-white/80 backdrop-blur-xl border border-stone-200/70 rounded-3xl flex items-start gap-4 text-stone-500 max-w-4xl mx-auto shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-300/30 flex items-center justify-center text-[#B38F26] shrink-0 font-serif font-bold text-sm">
            §
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              {t('dashboard.pos.legal_disclaimer') || 'Aviso Legal y Fiscalidad'}
            </h4>
            <p className="text-xs leading-relaxed text-stone-500 font-normal">
              {t('dashboard.pos.disclaimer') ||
                'Este módulo genera y registra de manera automática facturas de venta directa marcadas como cobradas y sujetas al tipo impositivo de IVA general. El documento resultante se almacena en el módulo fiscal y queda registrado para fines contables.'}
            </p>
          </div>
        </footer>
      </div>

      {/* Barra Flotante y Cajón Móvil */}
      {!lastInvoice && (
        <POSMobileBar
          cartCount={cartHook.cart.length}
          totalAmount={cartHook.totalAmount}
          bounceCart={cartHook.bounceCart}
          isCartDrawerOpen={isCartDrawerOpen}
          setIsCartDrawerOpen={setIsCartDrawerOpen}
          mounted={mounted}
        >
          <POSTicket
            isInsideDrawer={true}
            onCloseDrawer={() => setIsCartDrawerOpen(false)}
            {...ticketProps}
          />
        </POSMobileBar>
      )}
    </div>
  );
}
