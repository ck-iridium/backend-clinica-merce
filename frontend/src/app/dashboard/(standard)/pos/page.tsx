'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { useRouter } from 'next/navigation';
import { useAuthRole } from '@/hooks/useAuthRole';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { createPortal } from 'react-dom';
import { 
  Search, 
  Plus, 
  Trash2, 
  Calendar, 
  Check, 
  CreditCard, 
  User, 
  Receipt, 
  X, 
  Tag, 
  ShoppingCart, 
  Sparkles,
  ChevronDown,
  ArrowUp
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  price: number;
  category_id?: string;
  is_active: boolean;
}

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface Category {
  id: string;
  name: string;
  slug?: string;
}

export default function POSPage() {
  const { t } = useLanguage();
  const { showFeedback } = useFeedback();
  const router = useRouter();
  const { role, loading: loadingRole } = useAuthRole();
  
  // Data State
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // UX State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [serviceSearch, setServiceSearch] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false); // Mobile Drawer state
  const [bounceCart, setBounceCart] = useState(false); // Visual feedback animation

  // Cart / Sale State
  const [cart, setCart] = useState<Service[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedClientName, setSelectedClientName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Tarjeta' | 'Efectivo'>('Tarjeta');
  const [isSimplified, setIsSimplified] = useState(true); // Default to Ticket Simplificado (Venta Rápida)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<any>(null);

  // Refs for dropdowns
  const clientDropdownRef = useRef<HTMLDivElement>(null);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loadingRole) {
      const currentRole = role?.toLowerCase();
      const hasAccess = currentRole === 'administrador' || currentRole === 'admin' || currentRole === 'recepción' || currentRole === 'recepcion';
      
      if (!hasAccess) {
        router.replace('/dashboard');
        toast.error(t('dashboard.pos.access_denied') || "Acceso denegado: No tienes permisos para realizar ventas.");
      } else {
        fetchData();
      }
    }
  }, [role, loadingRole, router, t]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setShowClientDropdown(false);
      }
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target as Node)) {
        setShowServiceDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [cRes, sRes, catRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-categories/`)
      ]);
      
      if (cRes.ok) setClients(await cRes.json());
      
      if (sRes.ok) {
        const servs = await sRes.json();
        setServices(servs.filter((s: any) => s.is_active));
      }

      if (catRes.ok) {
        setCategories(await catRes.json());
      }
    } catch (e) {
      console.error(e);
      toast.error("Error al cargar los datos del POS");
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = (service: Service) => {
    setCart((prev) => [...prev, service]);
    
    // Trigger bounce animation for mobile bottom bar
    setBounceCart(true);
    setTimeout(() => setBounceCart(false), 500);

    toast.success(`${service.name} añadido al ticket`);
    setServiceSearch('');
    setShowServiceDropdown(false);
  };

  // Remove item from cart
  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
    if (cart.length <= 1) {
      setIsCartDrawerOpen(false);
    }
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price), 0);
  const taxRate = 21; // 21% default IVA
  const taxAmount = (subtotal * taxRate) / 121;
  const totalAmount = subtotal;

  const handleProcessSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }
    if (!isSimplified && !selectedClientId) {
      toast.error("Debes seleccionar un cliente para una Factura Nominal");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/direct-sale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: isSimplified ? 'simplified' : selectedClientId,
          final_price: Number(totalAmount.toFixed(2)),
          payment_method: paymentMethod,
          is_simplified: isSimplified,
          date: selectedDate,
          services: cart.map(item => ({ service_id: item.id, price: Number(item.price) }))
        })
      });

      if (res.ok) {
        const invoice = await res.json();
        setLastInvoice(invoice);
        setIsCartDrawerOpen(false);
        toast.success("Venta realizada con éxito");
      } else {
        const err = await res.json();
        showFeedback({ 
          type: 'error', 
          title: 'Error al procesar cobro', 
          message: err?.detail || t('dashboard.pos.sale_error') || 'Error al procesar la venta' 
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Error de red al procesar la venta");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setLastInvoice(null);
    setCart([]);
    setSelectedClientId('');
    setSelectedClientName('');
    setClientSearch('');
    setServiceSearch('');
    setPaymentMethod('Tarjeta');
    setIsSimplified(true);
    const today = new Date();
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  // Filters
  const filteredClients = clients.filter(c => 
    c.email !== 'contado@generico.local' && !c.email?.endsWith('@generico.local') && (
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
      c.email?.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.phone?.includes(clientSearch)
    )
  ).slice(0, 5);

  const filteredServices = services.filter(s => {
    const matchesCategory = selectedCategory ? s.category_id === selectedCategory : true;
    const matchesSearch = s.name.toLowerCase().includes(serviceSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getFriendlyDateStr = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const currentRole = role?.toLowerCase();
  const hasAccess = currentRole === 'administrador' || currentRole === 'admin' || currentRole === 'recepción' || currentRole === 'recepcion';

  if (loading || loadingRole || !hasAccess) return (
    <div className="flex flex-col gap-4 justify-center items-center h-[60vh] bg-[#FAFAFA] animate-in fade-in duration-500">
      <Skeleton className="w-16 h-16 rounded-3xl bg-stone-200" />
      <Skeleton className="w-48 h-6 rounded-xl bg-stone-200" />
    </div>
  );

  // Renders the cart ticket details to share between desktop column and mobile slide-up drawer
  const renderTicketContent = (isInsideDrawer = false) => {
    return (
      <div className="space-y-6">
        {/* Drawer Header if inside mobile overlay drawer */}
        {isInsideDrawer && (
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-[#d4af37]" />
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                {t('dashboard.pos.ticket_summary') || 'Resumen del Ticket'}
              </h3>
            </div>
            <button 
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 text-white/40 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Cart items list */}
        <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
          {cart.length > 0 ? (
            cart.map((item, idx) => (
              <div 
                key={`${item.id}-${idx}`}
                className="flex justify-between items-center p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all group animate-in slide-in-from-right-3 duration-200"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="font-semibold text-xs text-white/90 truncate">{item.name}</span>
                  <span className="text-[9px] text-[#d4af37] font-bold font-mono mt-0.5">{Number(item.price).toFixed(2)}€</span>
                </div>
                <button
                  onClick={() => removeFromCart(idx)}
                  className="p-1.5 text-white/40 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors group-hover:opacity-100 focus:opacity-100 lg:opacity-100 opacity-100"
                  title={t('dashboard.pos.remove_service') || 'Quitar tratamiento'}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          ) : (
            <div className="py-12 border-2 border-dashed border-white/10 rounded-2xl text-center space-y-2">
              <p className="text-xs text-white/40 font-medium">{t('dashboard.pos.empty_ticket') || 'El ticket está vacío'}</p>
              <p className="text-[10px] text-white/30">{t('dashboard.pos.empty_ticket_desc') || 'Selecciona servicios en la columna izquierda'}</p>
            </div>
          )}
        </div>

        {/* Toggle Ticket/Factura Toggle */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-white/60">
              {t('dashboard.pos.invoice_type') || 'Tipo de Factura'}
            </label>
            
            {/* Sliding luxury toggle button */}
            <div className="bg-white/5 p-1 rounded-full border border-white/10 flex items-center w-full sm:w-60">
              <button
                type="button"
                onClick={() => { setIsSimplified(true); setSelectedClientId(''); setSelectedClientName(''); setClientSearch(''); }}
                className={`flex-1 text-center py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${
                  isSimplified 
                    ? 'bg-white text-stone-950 font-extrabold shadow-md' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {t('dashboard.pos.ticket_simplif') || 'Ticket Simplif.'}
              </button>
              <button
                type="button"
                onClick={() => setIsSimplified(false)}
                className={`flex-1 text-center py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${
                  !isSimplified 
                    ? 'bg-white text-stone-950 font-extrabold shadow-md' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {t('dashboard.pos.nominal') || 'Nominal'}
              </button>
            </div>
          </div>

          {/* Nominated Client Selection */}
          {!isSimplified && (
            <div className="relative animate-in slide-in-from-top-3 duration-300 pt-2" ref={clientDropdownRef}>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">
                {t('dashboard.pos.search_client') || 'Buscar Cliente'} *
              </label>
              {selectedClientId ? (
                <div className="flex items-center justify-between p-3.5 bg-white/10 border border-[#d4af37]/30 rounded-2xl animate-in zoom-in-95">
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-[#d4af37]" />
                    <span className="font-semibold text-xs text-white">{selectedClientName}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedClientId('');
                      setSelectedClientName('');
                      setClientSearch('');
                    }}
                    className="p-1 text-white/40 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                  <input
                    id="pos-client-search"
                    type="text"
                    placeholder={t('dashboard.pos.client_search_placeholder') || 'Nombre, email o teléfono del cliente...'}
                    value={clientSearch}
                    onChange={(e) => {
                      setClientSearch(e.target.value);
                      setShowClientDropdown(true);
                    }}
                    onFocus={() => setShowClientDropdown(true)}
                    className="w-full pl-11 pr-5 py-3.5 rounded-2xl border border-white/10 focus:border-white/30 bg-white/5 text-xs text-white placeholder-white/30 outline-none transition-all"
                  />
                  
                  {/* Clients Results Dropdown */}
                  {showClientDropdown && clientSearch && (
                    <div className="absolute z-30 w-full mt-2 bg-stone-900 border border-white/10 rounded-2xl shadow-2xl max-h-48 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                      {filteredClients.length > 0 ? (
                        <div className="p-1 space-y-0.5">
                          {filteredClients.map(c => (
                            <button
                               key={c.id}
                               id={`pos-client-result-${c.id}`}
                               onClick={() => {
                                 setSelectedClientId(c.id);
                                 setSelectedClientName(c.name);
                                 setShowClientDropdown(false);
                               }}
                               className="w-full text-left px-4 py-2.5 hover:bg-white/5 rounded-xl transition-colors flex flex-col"
                            >
                              <span className="font-semibold text-white text-xs">{c.name}</span>
                              <span className="text-[9px] text-white/40 mt-0.5">{c.email || c.phone}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-white/40 text-xs">
                          {t('dashboard.pos.no_clients_found') || 'No se encontraron clientes'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Datepicker & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Manual Custom Date */}
          {/* Manual Custom Date */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
              {t('dashboard.pos.registration_date') || 'Fecha del Registro'}
            </label>
            <div 
              onClick={(e) => {
                const input = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement;
                if (input && typeof input.showPicker === 'function') {
                  try {
                    input.showPicker();
                  } catch (err) {
                    console.error("Failed to open native date picker", err);
                  }
                }
              }}
              className="relative pointer-events-auto cursor-pointer"
            >
              {/* Visual Button displaying Spanish Selected Date */}
              <div className="bg-white/5 border border-white/10 text-white rounded-2xl px-4 py-3.5 text-xs font-semibold flex items-center justify-between gap-3 hover:bg-white/10 hover:border-white/20 transition-all">
                <Calendar size={16} className="text-[#d4af37] shrink-0" />
                <span className="truncate flex-1 text-center font-medium">
                  {getFriendlyDateStr(selectedDate)}
                </span>
                <ChevronDown size={14} className="text-white/40 shrink-0" />
              </div>
              {/* Hidden Native Date Input overlay */}
              <input 
                id="pos-datepicker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 pointer-events-none z-10"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
              {t('dashboard.pos.payment_method') || 'Método de Pago'}
            </label>
            <div className="bg-white/5 p-1 rounded-full border border-white/10 flex items-center w-full">
              {['Tarjeta', 'Efectivo'].map(method => (
                <button 
                  key={method}
                  type="button"
                  id={method === 'Tarjeta' ? 'pos-pay-card' : 'pos-pay-cash'}
                  onClick={() => setPaymentMethod(method as 'Tarjeta' | 'Efectivo')}
                  className={`flex-1 text-center py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                    paymentMethod === method 
                      ? 'bg-white text-stone-950 font-bold shadow-md' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {method === 'Tarjeta' ? t('dashboard.pos.pay_card') || '💳 Tarj.' : t('dashboard.pos.pay_cash') || '💵 Efect.'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Totals Section */}
        <div className="pt-6 border-t border-white/10 space-y-3 font-serif">
          <div className="flex justify-between text-xs text-white/60 font-sans">
            <span>{t('dashboard.pos.subtotal') || 'Subtotal'}</span>
            <span className="font-mono">{subtotal.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between text-xs text-white/40 font-sans">
            <span>{t('dashboard.pos.tax_included') || 'IVA Incluido (21%)'}</span>
            <span className="font-mono">{taxAmount.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between items-baseline pt-2">
            <span className="text-base text-white/95 font-medium">{t('dashboard.pos.total_to_charge') || 'Total a Cobrar'}</span>
            <span className="text-4xl font-semibold text-[#d4af37] font-mono leading-none tracking-tight">
              {totalAmount.toFixed(2)}€
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button 
            id="pos-submit-btn"
            onClick={handleProcessSale}
            disabled={cart.length === 0 || (!isSimplified && !selectedClientId) || isProcessing}
            className="w-full bg-white text-stone-950 hover:bg-stone-50 px-8 py-5 rounded-2xl font-bold text-sm transition-all disabled:opacity-20 active:scale-[0.98] shadow-lg hover:shadow-white/5 tracking-wider uppercase"
          >
            {isProcessing 
              ? (t('dashboard.pos.processing') || 'Procesando...') 
              : (t('dashboard.pos.confirm_and_charge') || 'Confirmar y Cobrar')}
          </button>
          
          {!isSimplified && !selectedClientId && clientSearch && (
            <p className="text-[10px] text-red-400 mt-3 text-center animate-pulse">
              {t('dashboard.pos.must_select_client') || 'Selecciona un cliente de la lista para continuar'}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 md:px-8 font-sans text-stone-800 animate-in fade-in duration-700 pb-32 lg:pb-12">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-stone-200/50 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-stone-900 text-white rounded-2xl flex items-center justify-center shadow-md">
                <Tag size={24} className="text-[#d4af37]" />
              </span>
              <h1 className="text-4xl font-serif text-stone-900 tracking-tight font-medium">
                {t('dashboard.pos.quick_sale') || 'Venta Rápida'}
              </h1>
            </div>
            <p className="text-stone-500 font-normal max-w-xl text-sm">
              {t('dashboard.pos.direct_billing_desc') || 'Terminal de cobro directo y facturación instantánea bajo demanda.'}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <span className="px-4 py-2 bg-[#F7F7F5] rounded-full text-xs font-semibold text-stone-600 border border-stone-200/40">
              Terminal POS activo
            </span>
          </div>
        </header>

        {lastInvoice ? (
          /* SUCCESS VIEW */
          <div className="bg-white rounded-[2.5rem] p-12 max-w-2xl mx-auto text-center border border-stone-100 shadow-luxury animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-stone-50 border border-[#d4af37]/30 text-[#d4af37] rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              <Sparkles size={36} />
            </div>
            <h2 className="text-3xl font-serif text-stone-900 mb-3">{t('dashboard.pos.sale_completed') || '¡Cobro Realizado!'}</h2>
            <p className="text-stone-500 mb-8 font-medium">
              {t('dashboard.pos.invoice_generated') || 'El registro fiscal '}
              <span className="text-stone-900 font-bold font-mono bg-stone-100 px-2 py-1 rounded">#{lastInvoice.id}</span>
              {t('dashboard.pos.generated_as_paid') || ' se ha procesado correctamente como PAGADO.'}
            </p>
            
            <div className="bg-stone-50 rounded-2xl p-6 mb-10 text-left border border-stone-200/40 max-w-md mx-auto space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Fecha:</span>
                <span className="font-semibold">{getFriendlyDateStr(lastInvoice.date)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Concepto:</span>
                <span className="font-semibold text-right max-w-[200px] truncate">{lastInvoice.concept}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Método de Pago:</span>
                <span className="font-semibold">{paymentMethod}</span>
              </div>
              <div className="border-t border-stone-200/60 pt-2 flex justify-between font-serif text-lg text-stone-900">
                <span>Importe Total:</span>
                <span className="font-bold text-[#d4af37]">{Number(lastInvoice.amount).toFixed(2)}€</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                id="pos-view-invoices-link"
                href={`/dashboard/invoices`} 
                className="bg-stone-900 text-white px-8 py-4 rounded-xl font-medium hover:bg-stone-800 transition-all shadow-md active:scale-[0.98] text-sm"
              >
                {t('dashboard.pos.view_all_invoices') || 'Ver Historial de Facturas'}
              </Link>
              <button 
                id="pos-new-sale-btn"
                onClick={resetForm}
                className="bg-stone-100 text-stone-700 px-8 py-4 rounded-xl font-medium hover:bg-stone-200 transition-all active:scale-[0.98] border border-stone-200/40 text-sm"
              >
                {t('dashboard.pos.new_sale') || 'Nueva Venta 🏷️'}
              </button>
            </div>
          </div>
        ) : (
          /* TWO COLUMN LAYOUT */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: SELECTION */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-stone-200/40 shadow-sm space-y-8 min-h-[550px] transition-all animate-in fade-in duration-300">
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[#d4af37] uppercase tracking-[0.2em]">{t('dashboard.pos.step_identification') || '1. Selección de Servicios'}</h3>
                <p className="text-stone-400 text-xs">{t('dashboard.pos.search_treatment_desc') || 'Busca y añade los tratamientos que deseas facturar al ticket.'}</p>
              </div>

              {/* Service Combobox / Autocomplete Search */}
              <div className="relative" ref={serviceDropdownRef}>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  {t('dashboard.pos.search_treatment') || 'Buscar Tratamiento'}
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input
                    id="pos-service-search"
                    type="text"
                    placeholder={t('dashboard.pos.search_treatment_placeholder') || 'Escribe el nombre del servicio...'}
                    value={serviceSearch}
                    onChange={(e) => {
                      setServiceSearch(e.target.value);
                      setShowServiceDropdown(true);
                    }}
                    onFocus={() => setShowServiceDropdown(true)}
                    className="w-full pl-12 pr-5 py-4 rounded-2xl border border-stone-200 focus:border-stone-500 focus:ring-1 focus:ring-stone-500 outline-none bg-stone-50/50 transition-all font-medium text-sm"
                  />
                  {serviceSearch && (
                    <button 
                      onClick={() => setServiceSearch('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Dropdown Results */}
                {showServiceDropdown && (
                  <div className="absolute z-30 w-full mt-2 bg-white border border-stone-200 rounded-2xl shadow-xl max-h-72 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {filteredServices.length > 0 ? (
                      <div className="p-2 space-y-1">
                        {filteredServices.map(s => (
                          <button
                            key={s.id}
                            id={`pos-service-result-${s.id}`}
                            onClick={() => addToCart(s)}
                            className="w-full text-left px-4 py-3 hover:bg-stone-50 rounded-xl transition-colors flex justify-between items-center group"
                          >
                            <div className="flex flex-col">
                              <span className="font-semibold text-stone-800 text-sm group-hover:text-stone-950">{s.name}</span>
                              {categories.find(c => c.id === s.category_id) && (
                                <span className="text-[10px] text-stone-400 uppercase tracking-wider mt-0.5">
                                  {categories.find(c => c.id === s.category_id)?.name}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-stone-700 font-mono text-sm">{Number(s.price).toFixed(2)}€</span>
                              <span className="p-1 bg-stone-100 text-stone-600 rounded-lg group-hover:bg-stone-900 group-hover:text-white transition-colors">
                                <Plus size={14} />
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-stone-400 text-sm">
                        {t('dashboard.pos.no_services_found') || 'No se encontraron servicios'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Category Quick Filters */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                  {t('dashboard.pos.category_filters') || 'Filtros por Categoría'}
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                      selectedCategory === null
                        ? 'bg-stone-950 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                    }`}
                  >
                    {t('dashboard.pos.all_categories') || 'Todos'}
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-stone-950 text-white border-transparent'
                          : 'bg-[#F7F7F5] text-stone-600 hover:bg-stone-200/50 border border-stone-200/20'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct List of Filtered Services for Easy Access */}
              <div className="space-y-4 pt-4 border-t border-stone-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    {t('dashboard.pos.fast_catalog') || 'Catálogo Rápido'}
                  </span>
                  <span className="text-xs text-stone-400 font-medium">
                    {t('dashboard.pos.services_available')?.replace('{count}', String(filteredServices.length)) || `${filteredServices.length} servicios disponibles`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
                  {filteredServices.map(s => (
                    <div
                      key={s.id}
                      onClick={() => addToCart(s)}
                      className="p-4 bg-white border border-stone-200/60 hover:border-stone-400/80 hover:bg-stone-50/30 rounded-2xl cursor-pointer transition-all duration-300 flex justify-between items-center group shadow-sm hover:shadow-md"
                    >
                      <div className="space-y-1 pr-2 max-w-[70%]">
                        <h4 className="font-semibold text-stone-800 text-xs truncate group-hover:text-stone-950">{s.name}</h4>
                        <span className="text-[10px] text-stone-400 font-medium font-mono">{Number(s.price).toFixed(2)}€</span>
                      </div>
                      <button 
                        className="w-8 h-8 rounded-full bg-stone-50 text-stone-500 border border-stone-100 flex items-center justify-center group-hover:bg-stone-950 group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-sm active:scale-90"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ))}
                  {filteredServices.length === 0 && (
                    <div className="col-span-2 py-10 text-center text-stone-400 text-xs">
                      {t('dashboard.pos.no_services_found') || 'Ningún servicio coincide con la categoría o búsqueda seleccionada.'}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: DESKTOP TICKET */}
            <div className="hidden lg:block lg:col-span-5 bg-stone-950 text-white rounded-3xl p-8 border border-stone-900 shadow-luxury space-y-8 relative overflow-hidden">
              <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={18} className="text-[#d4af37]" />
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                    {t('dashboard.pos.ticket_summary') || '2. Resumen & Ticket'}
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-white/10 text-white/80 rounded-full font-mono uppercase tracking-wider">
                  {cart.length === 1 
                    ? t('dashboard.pos.items_count_one')?.replace('{count}', String(cart.length)) || '1 ítem' 
                    : t('dashboard.pos.items_count')?.replace('{count}', String(cart.length)) || `${cart.length} ítems`}
                </span>
              </div>

              {renderTicketContent(false)}
            </div>

          </div>
        )}

        {/* Disclaimer / Informative block */}
        <footer className="p-6 bg-stone-50 border border-stone-200/50 rounded-3xl flex items-start gap-4 text-stone-500 max-w-4xl mx-auto shadow-sm">
          <span className="text-xl p-1 bg-stone-100 rounded-lg text-stone-600 shrink-0">ℹ️</span>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              {t('dashboard.pos.legal_disclaimer') || 'Aviso Legal y Fiscalidad'}
            </h4>
            <p className="text-[11px] leading-relaxed font-normal">
              {t('dashboard.pos.disclaimer') || 'Este módulo genera y registra de manera automática facturas de venta directa marcadas como cobradas y sujetas al tipo impositivo de IVA general. El documento resultante se almacena en el módulo fiscal y queda registrado para fines contables.'}
            </p>
          </div>
        </footer>

      </div>

      {/* MOBILE STICKY FLOATING CART BAR */}
      {cart.length > 0 && !lastInvoice && (
        <div className={`fixed bottom-20 left-4 right-4 md:left-[96px] md:right-8 lg:hidden bg-stone-950 border border-white/10 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between z-40 transition-all duration-300 ${
          bounceCart ? 'scale-105 border-[#d4af37]/50' : 'scale-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 bg-white/10 rounded-xl">
              <ShoppingCart size={16} className="text-[#d4af37]" />
              <span className="absolute -top-1 -right-1 bg-[#d4af37] text-stone-950 text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center leading-none font-mono">
                {cart.length}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">
                {t('dashboard.pos.total_to_charge') || 'Total a cobrar'}
              </span>
              <span className="text-lg font-bold font-mono text-[#d4af37]">{totalAmount.toFixed(2)}€</span>
            </div>
          </div>

          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="bg-white hover:bg-stone-100 text-stone-950 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors uppercase tracking-wider"
          >
            <span>{t('dashboard.pos.view_ticket') || 'Ver Ticket'}</span>
            <ArrowUp size={14} className="animate-bounce" />
          </button>
        </div>
      )}

      {/* MOBILE FULL-SCREEN CART OVERLAY (PORTAL TO document.body FOR MAXIMUM STACKING CONTEXT DOMINANCE) */}
      {isCartDrawerOpen && mounted && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-stone-950 text-white lg:hidden overflow-y-auto p-6 space-y-6 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-md mx-auto">
            {renderTicketContent(true)}
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
