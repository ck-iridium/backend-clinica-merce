'use client';

import React from 'react';
import { ShoppingCart, X, Trash2, Edit2, Check, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { CartItem, Client, PaymentMethod } from './types';
import { POSClientSelector } from './POSClientSelector';
import { POSPaymentAndDate } from './POSPaymentAndDate';

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
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-[#d4af37]" />
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
              {t('dashboard.pos.ticket_summary') || 'Resumen del Ticket'}
            </h3>
          </div>
          {onCloseDrawer && (
            <button
              onClick={onCloseDrawer}
              className="p-1.5 text-white/40 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {/* Lista de Servicios en el Ticket */}
      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
        {cart.length > 0 ? (
          cart.map((item, idx) => {
            const isModified = Number(item.price) !== Number(item.original_price);
            return (
              <div
                key={`${item.id}-${idx}`}
                className="flex justify-between items-center p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all group animate-in slide-in-from-right-3 duration-200 gap-2"
              >
                <div className="flex flex-col min-w-0 flex-1 pr-1">
                  <span className="font-semibold text-xs text-white/90 truncate">{item.name}</span>

                  {editingIndex === idx ? (
                    <div className="flex items-center gap-1.5 mt-1.5">
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
                        className="w-20 bg-stone-900 border border-[#d4af37]/60 rounded-lg px-2 py-1 text-xs text-[#d4af37] font-mono outline-none font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => updateItemPrice(idx, tempItemPrice)}
                        className="p-1 bg-[#d4af37] text-stone-950 rounded-lg hover:bg-amber-400 transition-colors"
                        title="Guardar precio"
                      >
                        <Check size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingIndex(null)}
                        className="p-1 bg-white/10 text-white/60 hover:text-white rounded-lg transition-colors"
                        title="Cancelar"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[#d4af37] font-bold font-mono">
                        {Number(item.price).toFixed(2)}€
                      </span>
                      {isModified && (
                        <span className="text-[9px] text-white/40 font-mono line-through">
                          {Number(item.original_price).toFixed(2)}€
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingIndex(idx);
                          setTempItemPrice(String(item.price));
                        }}
                        className="p-1 text-white/40 hover:text-[#d4af37] hover:bg-white/10 rounded-md transition-colors"
                        title={t('dashboard.pos.edit_price') || 'Editar precio'}
                      >
                        <Edit2 size={12} />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => removeFromCart(idx)}
                  className="p-1.5 text-white/40 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors shrink-0"
                  title={t('dashboard.pos.remove_service') || 'Quitar tratamiento'}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        ) : (
          <div className="py-12 border-2 border-dashed border-white/10 rounded-2xl text-center space-y-2">
            <p className="text-xs text-white/40 font-medium">
              {t('dashboard.pos.empty_ticket') || 'El ticket está vacío'}
            </p>
            <p className="text-[10px] text-white/30">
              {t('dashboard.pos.empty_ticket_desc') || 'Selecciona servicios en la columna izquierda'}
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

      {/* Botón para restablecer precios si se han modificado */}
      {isPriceModified && (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleResetPrices}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/15 border border-white/10 text-[#d4af37] text-[10px] font-bold rounded-full transition-all"
          >
            <RotateCcw size={11} />
            <span>{t('dashboard.pos.reset_catalog') || 'Restablecer catálogo'}</span>
          </button>
        </div>
      )}

      {/* Sección de Totales e Impuestos */}
      <div className="pt-4 border-t border-white/10 space-y-3 font-serif">
        <div className="flex justify-between text-xs text-white/60 font-sans">
          <span>{t('dashboard.pos.subtotal') || 'Subtotal'}</span>
          <span className="font-mono">{subtotal.toFixed(2)}€</span>
        </div>
        <div className="flex justify-between text-xs text-white/40 font-sans">
          <span>{t('dashboard.pos.tax_included') || 'IVA Incluido (21%)'}</span>
          <span className="font-mono">{taxAmount.toFixed(2)}€</span>
        </div>

        <div className="pt-2 font-sans">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              <span className="text-base text-white/95 font-medium font-serif">
                {t('dashboard.pos.total_to_charge') || 'Total a Cobrar'}
              </span>
              {customTotal !== null && (
                <span className="px-2 py-0.5 bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-[9px] font-bold rounded-full uppercase tracking-wider">
                  {t('dashboard.pos.custom_total_active') || 'Personalizado'}
                </span>
              )}
            </div>

            {!isEditingTotal && (
              <button
                type="button"
                onClick={() => {
                  setIsEditingTotal(true);
                  setCustomTotalInput(totalAmount.toFixed(2));
                }}
                className="flex items-center gap-1 text border border-white/10 bg-white/5 hover:bg-white/10 text-[#d4af37] text-xs font-semibold px-2.5 py-1 rounded-xl transition-all"
                title={t('dashboard.pos.edit_total') || 'Editar Total'}
              >
                <Edit2 size={12} />
                <span>{t('dashboard.pos.edit_total') || 'Editar Total'}</span>
              </button>
            )}
          </div>

          {isEditingTotal ? (
            <div className="flex items-center gap-2 mt-2 bg-stone-900 border border-[#d4af37] p-2 rounded-2xl animate-in fade-in duration-200">
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
                className="w-full bg-transparent text-2xl font-bold font-mono text-[#d4af37] outline-none px-2"
              />
              <button
                type="button"
                onClick={handleApplyCustomTotal}
                className="px-3.5 py-2 bg-[#d4af37] text-stone-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors uppercase tracking-wider shrink-0"
              >
                <Check size={14} />
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
                className="text-4xl font-semibold text-[#d4af37] font-mono leading-none tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
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
        <button
          id="pos-submit-btn"
          onClick={handleProcessSale}
          disabled={cart.length === 0 || (!isSimplified && !selectedClientId) || isProcessing}
          className="w-full bg-white text-stone-950 hover:bg-stone-50 px-8 py-5 rounded-2xl font-bold text-sm transition-all disabled:opacity-20 active:scale-[0.98] shadow-lg hover:shadow-white/5 tracking-wider uppercase"
        >
          {isProcessing
            ? t('dashboard.pos.processing') || 'Procesando...'
            : t('dashboard.pos.confirm_and_charge') || 'Confirmar y Cobrar'}
        </button>

        {!isSimplified && !selectedClientId && clientSearch && (
          <p className="text-[10px] text-red-400 mt-3 text-center animate-pulse">
            {t('dashboard.pos.must_select_client') || 'Selecciona un cliente de la lista para continuar'}
          </p>
        )}
      </div>
    </div>
  );
}
