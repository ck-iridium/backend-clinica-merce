'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Plus, 
  Trash2, 
  Sparkles, 
  Package, 
  Search, 
  Check, 
  RotateCw,
  Receipt,
  UserCheck,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import ActiveCounterOperatorPill from '@/components/dashboard/ActiveCounterOperatorPill';

interface CartItem {
  id: string;
  name: string;
  price: number;
  is_product?: boolean;
  quantity: number;
}

interface AppointmentPOSPanelProps {
  selectedAppt: any;
  client: any;
  initialService: any;
  allServices: any[];
  onPaymentComplete: () => Promise<void> | void;
  onClose?: () => void;
  isEmbedded?: boolean;
}

export function AppointmentPOSPanel({
  selectedAppt,
  client,
  initialService,
  allServices = [],
  onPaymentComplete,
  onClose,
  isEmbedded = false,
}: AppointmentPOSPanelProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Tarjeta' | 'Efectivo' | 'Bizum'>('Tarjeta');
  const [isSimplified, setIsSimplified] = useState(false);
  const [searchCatalog, setSearchCatalog] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Inicializar carrito con el servicio de la cita
  useEffect(() => {
    if (initialService) {
      setCart([
        {
          id: initialService.id,
          name: initialService.name,
          price: Number(initialService.price) || 0,
          is_product: Boolean(initialService.is_product),
          quantity: 1,
        }
      ]);
    } else {
      setCart([]);
    }
  }, [initialService]);

  // Total
  const totalAmount = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cart]);

  // Filtrar catálogo para añadir más servicios o productos
  const filteredCatalog = useMemo(() => {
    if (!searchCatalog.trim()) return [];
    const term = searchCatalog.toLowerCase();
    return allServices
      .filter(s => s.name?.toLowerCase().includes(term) || s.sku?.toLowerCase().includes(term))
      .slice(0, 6);
  }, [allServices, searchCatalog]);

  const handleAddItem = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: Number(item.price) || 0,
          is_product: Boolean(item.is_product),
          quantity: 1,
        }
      ];
    });
    setSearchCatalog('');
  };

  const handleRemoveItem = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQ = i.quantity + delta;
        return newQ > 0 ? { ...i, quantity: newQ } : i;
      }
      return i;
    }));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('El carrito de cobro está vacío');
      return;
    }

    const clientIdToSend = isSimplified ? 'simplified' : (client?.id || selectedAppt?.client_id || 'simplified');

    setIsProcessing(true);
    try {
      // Expand items by quantity for the backend direct-sale format
      const expandedServices: { service_id: string; price: number }[] = [];
      cart.forEach(item => {
        for (let i = 0; i < item.quantity; i++) {
          expandedServices.push({ service_id: item.id, price: item.price });
        }
      });

      const todayStr = new Date().toISOString().split('T')[0];

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/direct-sale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientIdToSend,
          final_price: Number(totalAmount.toFixed(2)),
          payment_method: paymentMethod,
          is_simplified: isSimplified,
          date: todayStr,
          services: expandedServices,
        }),
      });

      if (res.ok) {
        const invoice = await res.json();
        toast.success(`Cobro registrado (${totalAmount.toFixed(2)} €). Ticket #${invoice.invoice_number || 'OK'}`);
        await onPaymentComplete();
        onClose?.();
      } else {
        const err = await res.json();
        toast.error(err?.detail || 'Error al registrar el cobro en el TPV');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de red al procesar el cobro');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="shrink-0 p-5 border-b border-stone-100 bg-stone-50/80">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-200/60">
                <Receipt size={12} className="text-emerald-700" />
                Cobro en Mostrador (TPV)
              </span>
              <ActiveCounterOperatorPill />
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
              Cobrar Cita: {client?.name || 'Cliente'}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Genera el ticket y marca la cita como realizada automáticamente.
            </p>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Cerrar cobro"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Cart & Items */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {/* Tipo de Facturación / Cliente */}
        <div className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl border border-stone-200/70 text-xs">
          <span className="font-semibold text-stone-700 flex items-center gap-2">
            <UserCheck size={14} className="text-[#FF6B00]" />
            {isSimplified ? 'Ticket de Contado (Anónimo)' : `Cliente: ${client?.name || 'Registrado'}`}
          </span>
          <button
            type="button"
            onClick={() => setIsSimplified(!isSimplified)}
            className="text-[11px] font-bold text-[#FF6B00] hover:underline cursor-pointer"
          >
            {isSimplified ? 'Cambiar a Factura Nominal' : 'Cambiar a Ticket Anónimo'}
          </button>
        </div>

        {/* Líneas del Carrito */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center justify-between">
            <span>Conceptos a Cobrar ({cart.length})</span>
          </label>

          {cart.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-stone-200 rounded-2xl text-stone-400 text-xs">
              El carrito está vacío. Agrega un servicio o producto abajo.
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-3.5 bg-white border border-stone-200/80 rounded-2xl shadow-2xs hover:border-stone-300 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      item.is_product ? 'bg-stone-100 text-stone-700' : 'bg-orange-100/70 text-[#FF6B00]'
                    }`}>
                      {item.is_product ? <Package size={14} /> : <Sparkles size={14} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-stone-900 truncate">{item.name}</p>
                      <p className="text-[11px] text-stone-500 font-medium">
                        {item.price.toFixed(2)} € / ud.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Quantity control */}
                    <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        disabled={item.quantity <= 1}
                        className="px-2 py-0.5 text-xs font-bold hover:bg-stone-200 disabled:opacity-30 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-bold text-stone-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="px-2 py-0.5 text-xs font-bold hover:bg-stone-200 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <span className="w-16 text-right font-bold text-xs text-stone-900">
                      {(item.price * item.quantity).toFixed(2)} €
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-stone-300 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Añadir Producto o Servicio Adicional al Ticket */}
        <div className="space-y-2">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchCatalog}
              onChange={(e) => setSearchCatalog(e.target.value)}
              placeholder="Añadir artículo o tratamiento adicional (ej: champú, ampolla, mechas)..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 bg-stone-50/50 focus:bg-white focus:border-[#FF6B00] outline-none shadow-2xs"
            />
          </div>

          {filteredCatalog.length > 0 && (
            <div className="p-1.5 bg-white border border-stone-200 rounded-xl shadow-lg space-y-1">
              {filteredCatalog.map((catItem) => (
                <button
                  key={catItem.id}
                  type="button"
                  onClick={() => handleAddItem(catItem)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 text-left transition-colors text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    {catItem.is_product ? (
                      <Package size={13} className="text-stone-600 shrink-0" />
                    ) : (
                      <Sparkles size={13} className="text-[#FF6B00] shrink-0" />
                    )}
                    <span className="font-semibold text-stone-800 truncate">{catItem.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-stone-900">{Number(catItem.price || 0).toFixed(2)} €</span>
                    <Plus size={13} className="text-[#FF6B00]" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Método de Pago */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Método de Pago
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setPaymentMethod('Tarjeta')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-xs font-bold gap-1.5 cursor-pointer ${
                paymentMethod === 'Tarjeta'
                  ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                  : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
              }`}
            >
              <CreditCard size={18} />
              <span>Tarjeta</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('Efectivo')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-xs font-bold gap-1.5 cursor-pointer ${
                paymentMethod === 'Efectivo'
                  ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                  : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Banknote size={18} />
              <span>Efectivo</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('Bizum')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-xs font-bold gap-1.5 cursor-pointer ${
                paymentMethod === 'Bizum'
                  ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                  : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Smartphone size={18} />
              <span>Bizum</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer con Total y Botón de Cobro */}
      <div className="shrink-0 p-5 border-t border-stone-100 bg-stone-50/80 flex items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400 block">Total a Cobrar</span>
          <span className="text-2xl font-serif font-black text-stone-900">
            {totalAmount.toFixed(2)} €
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="rounded-xl border-stone-300 text-stone-600 font-bold text-xs cursor-pointer"
            >
              Cancelar
            </Button>
          )}

          <Button
            type="button"
            onClick={handleCheckout}
            disabled={isProcessing || cart.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl px-5 py-2.5 shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RotateCw size={14} className="animate-spin" /> Procesando...
              </>
            ) : (
              <>
                <Check size={16} /> Cobrar y Finalizar ({totalAmount.toFixed(2)} €)
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
