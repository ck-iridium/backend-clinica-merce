'use client';

import React from 'react';
import { Search, User, X } from 'lucide-react';
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
}: POSClientSelectorProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-3 pt-4 border-t border-white/10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-white/60">
          {t('dashboard.pos.invoice_type') || 'Tipo de Factura'}
        </label>

        {/* Botón de alternancia deslizante */}
        <div className="bg-white/5 p-1 rounded-full border border-white/10 flex items-center w-full sm:w-60">
          <button
            type="button"
            onClick={() => {
              setIsSimplified(true);
              onClearClient();
            }}
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

      {/* Selector de Cliente para Factura Nominal */}
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
                onClick={onClearClient}
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

              {/* Menú de resultados de clientes */}
              {showClientDropdown && clientSearch && (
                <div className="absolute z-30 w-full mt-2 bg-stone-900 border border-white/10 rounded-2xl shadow-2xl max-h-48 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                  {filteredClients.length > 0 ? (
                    <div className="p-1 space-y-0.5">
                      {filteredClients.map((c) => (
                        <button
                          key={c.id}
                          id={`pos-client-result-${c.id}`}
                          onClick={() => {
                            onSelectClient(c.id, c.name);
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
  );
}
