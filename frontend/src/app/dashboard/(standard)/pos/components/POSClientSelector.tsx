'use client';

import React from 'react';
import { Search, User, X, FileCheck2, FileText, CheckCircle2, Receipt } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Client } from './types';

interface POSClientSelectorProps {
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
  nextInvoiceNumber?: string;
}

export function POSClientSelector({
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
  nextInvoiceNumber,
}: POSClientSelectorProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-3.5 pt-4 border-t border-white/10">
      {/* Casilla de control visual de Próxima Factura */}
      {nextInvoiceNumber && (
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-amber-500/15 via-white/5 to-transparent border border-[#D4AF37]/35 rounded-2xl shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Receipt size={13} strokeWidth={2.2} />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200/90 font-sans">
              Próxima Factura:
            </span>
          </div>
          <span className="font-mono text-xs font-bold text-white bg-stone-900/90 px-3 py-1 rounded-xl border border-amber-400/40 shadow-xs tracking-wider">
            {nextInvoiceNumber}
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
          <FileText size={13} className="text-[#D4AF37]" />
          <span>{t('dashboard.pos.invoice_type') || 'Modalidad de Facturación'}</span>
        </label>

        {/* Toggle deslizante de lujo */}
        <div className="bg-white/5 p-1 rounded-full border border-white/10 flex items-center w-full sm:w-64 backdrop-blur-md">
          <button
            type="button"
            onClick={() => {
              setIsSimplified(true);
              onClearClient();
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
              isSimplified
                ? 'bg-white text-stone-950 shadow-md font-extrabold'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <span>{t('dashboard.pos.ticket_simplif') || 'Ticket Simplificado'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsSimplified(false)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
              !isSimplified
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38F26] text-stone-950 shadow-md font-extrabold'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <FileCheck2 size={12} className={!isSimplified ? 'text-stone-950' : 'text-stone-400'} />
            <span>{t('dashboard.pos.nominal') || 'Nominal'}</span>
          </button>
        </div>
      </div>

      {/* Selector de Cliente para Factura Nominal */}
      {!isSimplified && (
        <div className="relative animate-in slide-in-from-top-2 duration-300 pt-1" ref={clientDropdownRef}>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">
            {t('dashboard.pos.search_client') || 'Vincular Cliente Titular'} <span className="text-amber-400">*</span>
          </label>
          
          {selectedClientId ? (
            <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-white/10 to-white/5 border border-[#D4AF37]/50 rounded-2xl shadow-sm animate-in zoom-in-95">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0 font-bold text-xs">
                  {selectedClientName.charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-white truncate">{selectedClientName}</span>
                    <CheckCircle2 size={13} className="text-[#D4AF37] shrink-0" />
                  </div>
                  <span className="text-[10px] text-white/40 block">Cliente asignado a la factura</span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClearClient}
                className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-white/10 rounded-xl transition-colors ml-2"
                title="Cambiar cliente"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
              <input
                id="pos-client-search"
                type="text"
                placeholder={t('dashboard.pos.client_search_placeholder') || 'Buscar por nombre, email o teléfono...'}
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setShowClientDropdown(true);
                }}
                onFocus={() => setShowClientDropdown(true)}
                className="w-full pl-11 pr-5 py-3 rounded-2xl border border-white/10 focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/30 bg-white/5 text-xs text-white placeholder-white/30 outline-none transition-all"
              />

              {/* Menú de resultados de clientes */}
              {showClientDropdown && clientSearch && (
                <div className="absolute z-30 w-full mt-2 bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl max-h-52 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                  {filteredClients.length > 0 ? (
                    <div className="p-1.5 space-y-1">
                      {filteredClients.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          id={`pos-client-result-${c.id}`}
                          onClick={() => {
                            onSelectClient(c.id, c.name);
                            setShowClientDropdown(false);
                          }}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-white/10 rounded-xl transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-6 h-6 rounded-lg bg-white/10 text-white/70 group-hover:text-[#D4AF37] group-hover:bg-[#D4AF37]/20 flex items-center justify-center text-[10px] font-bold">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="truncate">
                              <span className="font-semibold text-white text-xs group-hover:text-amber-200 block truncate">{c.name}</span>
                              <span className="text-[10px] text-white/40 block truncate">{c.email || c.phone || 'Sin contacto'}</span>
                            </div>
                          </div>
                          <span className="text-[9px] text-white/40 font-mono uppercase bg-white/5 px-2 py-0.5 rounded-md group-hover:bg-[#D4AF37]/20 group-hover:text-[#D4AF37]">
                            Seleccionar
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-white/40 text-xs">
                      {t('dashboard.pos.no_clients_found') || 'No se encontraron clientes coincidentes'}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
