'use client';

import React from 'react';
import { ShoppingCart, X, Trash2, Edit2, Check, RotateCcw, Receipt, Sparkles, Loader2 } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { CartItem, Client, PaymentMethod } from './types';
import { POSClientSelector } from './POSClientSelector';
import { POSPaymentAndDate } from './POSPaymentAndDate';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface POSTicketProps {
  isInsideDrawer?: boolean;
  onCloseDrawer?: () => void;
  cart: CartItem[];
  editingIndex: number | null;
  setEditingIndex: (idx: number | null) => void;
  tempItemPrice: string;
  setTempItemPrice: (val: string) => void;
  updateItemPrice: (index: number, priceStr: string) => void;
  removeFromCart: (index: number) => void;
  isSimplified: boolean;
  setIsSimplified: (val: boolean) => void;
  selectedClientId: string;
  selectedClientName: string;
  onSelectClient: (id: string, name: string) => void;
  onClearClient: () => void;
  clientSearch: string;
  setClientSearch: (val: string) => void;
  showClientDropdown: boolean;
  setShowClientDropdown: (val: boolean) => void;
  filteredClients: Client[];
  clientDropdownRef: React.RefObject<HTMLDivElement>;
  selectedDate: string;
  setSelectedDate: (val: string) => void;
  getFriendlyDateStr: (dateStr: string) => string;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (val: PaymentMethod) => void;
  isPriceModified: boolean;
  handleResetPrices: () => void;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  customTotal: number | null;
  isEditingTotal: boolean;
  setIsEditingTotal: (val: boolean) => void;
  customTotalInput: string;
  setCustomTotalInput: (val: string) => void;
  handleApplyCustomTotal: () => void;
  handleProcessSale: (e: React.FormEvent) => void;
  isProcessing: boolean;
}

export function POSTicket({
  isInsideDrawer = false,
  onCloseDrawer,
  cart,
  editingIndex,
  setEditingIndex,
  tempItemPrice,
  setTempItemPrice,
  updateItemPrice,
  removeFromCart,
  isSimplified,
  setIsSimplified,
  selectedClientId,
  selectedClientName,
  onSelectClient,
  onClearClient,
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
  isPriceModified,
  handleResetPrices,
  subtotal,
  taxAmount,
  totalAmount,
  customTotal,
  isEditingTotal,
  setIsEditingTotal,
  customTotalInput,
  setCustomTotalInput,
  handleApplyCustomTotal,
  handleProcessSale,
  isProcessing,
}: POSTicketProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Cabecera si está dentro del Drawer móvil */}
      {isInsideDrawer && (
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <ShoppingCart size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                {t('dashboard.pos.ticket_summary') || 'Ticket de Venta'}
              </h3>
              <p className="text-[11px] text-white/50">{cart.length} líneas en ticket</p>
            </div>
          </div>
          {onCloseDrawer && (
            <button
              onClick={onCloseDrawer}
              className="p-2 text-white/40 hover:text-white bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {/* Lista de Servicios en el Ticket */}
      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
        {cart.length > 0 ? (
          cart.map((item, idx) => {
            const isModified = Number(item.price) !== Number(item.original_price);
            return (
              <div
                key={`${item.id}-${idx}`}
                className="flex justify-between items-center p-3 bg-white/5 hover:bg-white/8 border border-white/8 rounded-2xl transition-all group animate-in slide-in-from-right-2 duration-200 gap-2.5"
              >
                <div className="flex flex-col min-w-0 flex-1 pr-1">
                  <span className="font-medium text-xs text-white/95 truncate">{item.name}</span>

                  {editingIndex === idx ? (
                    <div className="flex items-center gap-1.5 mt-2 animate-in fade-in">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={tempItemPrice}
                        onChange={(e) => setTempItemPrice(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') updateItemPrice(idx, tempItemPrice);
                          if (e.key === 'Escape') setEditingIndex(null);
                        }}
                        autoFocus
                        className="w-20 bg-stone-900 border border-[#D4AF37] rounded-lg px-2 py-1 text-xs text-[#D4AF37] font-mono outline-none font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => updateItemPrice(idx, tempItemPrice)}
                        className="p-1.5 bg-[#D4AF37] text-stone-950 rounded-lg hover:bg-amber-400 transition-colors"
                        title="Guardar precio"
                      >
                        <Check size={12} strokeWidth={3} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingIndex(null)}
                        className="p-1.5 bg-white/10 text-white/60 hover:text-white rounded-lg transition-colors"
                        title="Cancelar"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[#D4AF37] font-bold font-mono">
                        {Number(item.price).toFixed(2)}€
                      </span>
                      {isModified && (
                        <span className="text-[10px] text-white/35 font-mono line-through">
                          {Number(item.original_price).toFixed(2)}€
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingIndex(idx);
                          setTempItemPrice(String(item.price));
                        }}
                        className="p-1 text-white/30 hover:text-[#D4AF37] hover:bg-white/10 rounded-md transition-colors"
                        title={t('dashboard.pos.edit_price') || 'Editar precio'}
                      >
                        <Edit2 size={11} />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(idx)}
                  className="p-2 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors shrink-0"
                  title={t('dashboard.pos.remove_service') || 'Quitar tratamiento'}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        ) : (
          <div className="py-10 border-2 border-dashed border-white/10 rounded-2xl text-center space-y-2 bg-white/2">
            <Receipt className="w-8 h-8 text-white/20 mx-auto" />
            <p className="text-xs text-white/50 font-medium">
              {t('dashboard.pos.empty_ticket') || 'El ticket está vacío'}
            </p>
            <p className="text-[10px] text-white/30">
              {t('dashboard.pos.empty_ticket_desc') || 'Haz clic en los servicios del catálogo para agregarlos.'}
            </p>
          </div>
        )}
      </div>

      {/* Selector de Cliente y Factura Nominal */}
      <POSClientSelector
        isSimplified={isSimplified}
        setIsSimplified={setIsSimplified}
        selectedClientId={selectedClientId}
        selectedClientName={selectedClientName}
        onSelectClient={onSelectClient}
        onClearClient={onClearClient}
        clientSearch={clientSearch}
        setClientSearch={setClientSearch}
        showClientDropdown={showClientDropdown}
        setShowClientDropdown={setShowClientDropdown}
        filteredClients={filteredClients}
        clientDropdownRef={clientDropdownRef}
      />

      {/* Selector de Fecha y Método de Pago */}
      <POSPaymentAndDate
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        getFriendlyDateStr={getFriendlyDateStr}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
      />

      {/* Restablecer precios si fueron editados */}
      {isPriceModified && (
        <div className="flex justify-end pt-0.5">
          <button
            type="button"
            onClick={handleResetPrices}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/15 border border-white/10 text-[#D4AF37] text-[10px] font-bold rounded-full transition-all"
          >
            <RotateCcw size={11} />
            <span>{t('dashboard.pos.reset_catalog') || 'Restablecer precios'}</span>
          </button>
        </div>
      )}

      {/* Línea de Puntos Estilo Ticket Físico */}
      <div className="border-t border-dashed border-white/15 pt-4 space-y-2.5">
        <div className="flex justify-between text-xs text-white/60 font-sans">
          <span>{t('dashboard.pos.subtotal') || 'Base Imponible'}</span>
          <span className="font-mono text-white/80">{subtotal.toFixed(2)}€</span>
        </div>
        <div className="flex justify-between text-xs text-white/45 font-sans">
          <span>{t('dashboard.pos.tax_included') || 'IVA General (21%)'}</span>
          <span className="font-mono">{taxAmount.toFixed(2)}€</span>
        </div>

        {/* Total a Cobrar */}
        <div className="pt-2 font-sans border-t border-white/10">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base text-white/90 font-serif font-semibold">
                {t('dashboard.pos.total_to_charge') || 'Total a Cobrar'}
              </span>
              {customTotal !== null && (
                <Badge variant="luxury" className="text-[9px] py-0.5 px-2">
                  {t('dashboard.pos.custom_total_active') || 'Ajustado'}
                </Badge>
              )}
            </div>

            {!isEditingTotal && (
              <button
                type="button"
                onClick={() => {
                  setIsEditingTotal(true);
                  setCustomTotalInput(totalAmount.toFixed(2));
                }}
                className="flex items-center gap-1 border border-white/10 bg-white/5 hover:bg-white/10 text-[#D4AF37] text-xs font-semibold px-2.5 py-1 rounded-xl transition-all"
                title={t('dashboard.pos.edit_total') || 'Modificar total'}
              >
                <Edit2 size={11} />
                <span>{t('dashboard.pos.edit_total') || 'Editar'}</span>
              </button>
            )}
          </div>

          {isEditingTotal ? (
            <div className="flex items-center gap-2 mt-2 bg-stone-900 border border-[#D4AF37] p-2 rounded-2xl animate-in fade-in duration-200">
              <input
                type="number"
                step="0.01"
                min="0"
                value={customTotalInput}
                onChange={(e) => setCustomTotalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyCustomTotal();
                  if (e.key === 'Escape') setIsEditingTotal(false);
                }}
                autoFocus
                placeholder="0.00"
                className="w-full bg-transparent text-2xl font-bold font-mono text-[#D4AF37] outline-none px-2"
              />
              <button
                type="button"
                onClick={handleApplyCustomTotal}
                className="px-3.5 py-2 bg-[#D4AF37] text-stone-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors uppercase tracking-wider shrink-0"
              >
                <Check size={14} strokeWidth={3} />
              </button>
              <button
                type="button"
                onClick={() => setIsEditingTotal(false)}
                className="p-2 bg-white/10 text-white/60 hover:text-white rounded-xl transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex justify-end items-baseline pt-1">
              <span
                onClick={() => {
                  setIsEditingTotal(true);
                  setCustomTotalInput(totalAmount.toFixed(2));
                }}
                className="text-4xl font-serif font-bold text-[#D4AF37] font-mono leading-none tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
                title="Haz clic para editar el total"
              >
                {totalAmount.toFixed(2)}€
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Botón de Confirmación y Cobro */}
      <div className="pt-2">
        <Button
          id="pos-submit-btn"
          onClick={handleProcessSale}
          disabled={cart.length === 0 || (!isSimplified && !selectedClientId) || isProcessing}
          variant="luxury"
          size="lg"
          className="w-full text-stone-950 font-bold uppercase tracking-wider h-14 rounded-2xl shadow-luxury text-sm disabled:opacity-30 disabled:pointer-events-none"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t('dashboard.pos.processing') || 'Emitiendo factura...'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles size={16} />
              <span>{t('dashboard.pos.confirm_and_charge') || 'Confirmar y Cobrar'}</span>
            </div>
          )}
        </Button>

        {!isSimplified && !selectedClientId && clientSearch && (
          <p className="text-[11px] text-amber-300 mt-2.5 text-center font-medium animate-pulse">
            {t('dashboard.pos.must_select_client') || '⚠️ Selecciona un cliente de la lista para emitir Factura Nominal'}
          </p>
        )}
      </div>
    </div>
  );
}
