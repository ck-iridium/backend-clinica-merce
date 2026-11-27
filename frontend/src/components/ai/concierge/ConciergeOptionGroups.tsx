'use client';

import React from 'react';
import { 
  Clock, 
  MapPin, 
  Home, 
  Sparkles, 
  Check, 
  ChevronRight, 
  ArrowRight, 
  Phone, 
  MessageCircle, 
  ExternalLink 
} from 'lucide-react';
import { ConciergeAction, ConciergeOptionItem } from './types';

interface ConciergeOptionGroupsProps {
  action?: ConciergeAction;
  msgIndex: number;
  multiSelections: Record<number, Record<string, string>>;
  setMultiSelections: React.Dispatch<React.SetStateAction<Record<number, Record<string, string>>>>;
  onOptionClick: (opt: ConciergeOptionItem) => void;
  onSend: (text: string) => void;
}

export default function ConciergeOptionGroups({
  action,
  msgIndex,
  multiSelections,
  setMultiSelections,
  onOptionClick,
  onSend,
}: ConciergeOptionGroupsProps) {
  const baseOpts: ConciergeOptionItem[] = action?.rich_options && action.rich_options.length > 0
    ? action.rich_options
    : (action?.options || []).map((opt) => {
        const cleanOpt = opt.trim();
        const isTime = /^\d{1,2}:\d{2}/.test(cleanOpt);
        return {
          title: cleanOpt,
          action_value: isTime ? (cleanOpt.toLowerCase().startsWith('a las') ? cleanOpt : `A las ${cleanOpt}`) : cleanOpt,
          category: isTime ? 'time' : /sede|cl[ií]nica|centro|sal[oó]n|calle|avda/i.test(cleanOpt) ? 'location' : /domicilio/i.test(cleanOpt) ? 'modality' : 'service',
          group: isTime ? 'Horarios disponibles' : /sede|cl[ií]nica|centro|sal[oó]n|calle|avda|domicilio/i.test(cleanOpt) ? 'Lugar de la cita' : 'Tratamiento'
        };
      });

  // Normalizar grupos: "Lugar de la cita", "Horarios disponibles", etc.
  const richOpts: ConciergeOptionItem[] = baseOpts.map((opt) => {
    const isTime = opt.category === 'time' || /^\d{1,2}:\d{2}/.test(opt.title.trim());
    const isLocation = opt.category === 'location' || opt.category === 'modality' || /sede|ubicaci[oó]n|lugar|domicilio/i.test(opt.group || '');

    return {
      ...opt,
      category: isTime ? 'time' : opt.category,
      group: isTime
        ? (opt.group && opt.group !== 'Opciones' ? opt.group : 'Horarios disponibles')
        : isLocation
          ? 'Lugar de la cita'
          : (opt.group || 'Opciones')
    };
  });

  if (richOpts.length === 0) return null;

  const distinctGroups = Array.from(new Set(richOpts.map((o) => o.group || 'Opciones')));
  const isAllTimeGroups = distinctGroups.every((grpName) => {
    const items = richOpts.filter((o) => (o.group || 'Opciones') === grpName);
    return items.some((o) => o.category === 'time' || /^\d{1,2}:\d{2}/.test(o.title.trim()));
  });
  const isMultiGroup = distinctGroups.length > 1 && !isAllTimeGroups;
  const currentMsgSelections = multiSelections[msgIndex] || {};

  return (
    <div className="mt-3.5 space-y-3.5 w-full">
      {distinctGroups.map((grpName, grpIdx) => {
        const itemsInGroup = richOpts.filter((o) => (o.group || 'Opciones') === grpName);
        const isTimeGroup = itemsInGroup.some((o) => o.category === 'time' || /^\d{1,2}:\d{2}/.test(o.title.trim()));

        return (
          <div key={grpIdx} className="space-y-2 w-full">
            {(isMultiGroup || isTimeGroup || distinctGroups.length > 1) && (
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#b08e23] dark:text-[#d4af37] flex items-center gap-1.5 pl-0.5">
                {isTimeGroup ? (
                  <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                ) : isMultiGroup ? (
                  <span className="w-4 h-4 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-[10px] font-black">
                    {grpIdx + 1}
                  </span>
                ) : null}
                <span>{grpName}</span>
              </p>
            )}

            {isTimeGroup ? (
              /* Grid de Pastillas Horarias (Time Chips / Pills) */
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 w-full pt-0.5">
                {itemsInGroup.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => {
                      onSend(opt.action_value || `A las ${opt.title}`);
                    }}
                    className="px-2.5 py-2.5 rounded-xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-950/90 hover:border-[#d4af37] hover:bg-[#d4af37]/10 dark:hover:bg-[#d4af37]/15 hover:shadow-sm text-stone-800 dark:text-stone-100 font-sans font-semibold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 group shadow-2xs"
                  >
                    <Clock className="w-3 h-3 text-[#d4af37] shrink-0 transition-transform group-hover:scale-110" />
                    <span>{opt.title}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                {itemsInGroup.map((opt, optIdx) => {
                  const isSelected = isMultiGroup
                    ? currentMsgSelections[grpName] === opt.action_value
                    : false;

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => {
                        if (isMultiGroup) {
                          setMultiSelections((prev) => {
                            const currentMap = prev[msgIndex] || {};
                            const currentVal = currentMap[grpName];
                            const nextMap = { ...currentMap };
                            if (currentVal === opt.action_value) {
                              delete nextMap[grpName];
                            } else {
                              nextMap[grpName] = opt.action_value;
                            }
                            return {
                              ...prev,
                              [msgIndex]: nextMap,
                            };
                          });
                        } else {
                          onOptionClick(opt);
                        }
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all duration-200 flex items-center justify-between group active:scale-[0.99] ${
                        isSelected
                          ? 'bg-[#d4af37]/15 dark:bg-[#d4af37]/25 border-[#d4af37] shadow-sm ring-1 ring-[#d4af37]'
                          : 'bg-white dark:bg-stone-950/90 border-stone-200/80 dark:border-stone-800 hover:border-[#d4af37]/70 hover:shadow-sm hover:bg-stone-50/70 dark:hover:bg-stone-900/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-[#d4af37] text-stone-950'
                              : 'bg-[#d4af37]/10 text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-stone-950'
                          }`}
                        >
                          {opt.category === 'location' ? (
                            <MapPin className="w-3.5 h-3.5" />
                          ) : opt.category === 'modality' ? (
                            <Home className="w-3.5 h-3.5" />
                          ) : (opt.action_value || '').startsWith('tel:') ? (
                            <Phone className="w-3.5 h-3.5" />
                          ) : (opt.action_value || '').includes('wa.me') ? (
                            <MessageCircle className="w-3.5 h-3.5" />
                          ) : (opt.action_value || '').startsWith('/') ? (
                            <ExternalLink className="w-3.5 h-3.5" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-serif font-bold text-xs md:text-sm text-stone-900 dark:text-stone-100 truncate">
                            {opt.title}
                          </p>
                          {opt.subtitle && (
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                              {opt.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {opt.badge && (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg shrink-0 bg-[#d4af37]/15 text-[#916f19] dark:text-[#f3d36b] border border-[#d4af37]/35 tracking-tight shadow-xs">
                            {opt.badge}
                          </span>
                        )}
                        {isMultiGroup ? (
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-[#d4af37] border-[#d4af37] text-stone-950 scale-110'
                                : 'border-stone-300 dark:border-stone-700 group-hover:border-[#d4af37]'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#d4af37] group-hover:translate-x-0.5 transition-all" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Botón de Confirmación para Selección Múltiple */}
      {isMultiGroup && (
        <div className="pt-2">
          {Object.keys(currentMsgSelections).length === distinctGroups.length ? (
            <button
              type="button"
              onClick={() => {
                const chosen = distinctGroups
                  .map((g) => currentMsgSelections[g])
                  .filter(Boolean);
                if (chosen.length > 0) {
                  onSend(chosen.join(' en '));
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#d4af37] hover:bg-[#bfa030] text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 animate-in fade-in"
            >
              <span>Confirmar selección y continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-full py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-stone-500 dark:text-stone-400 text-center text-[11px] font-medium">
              Selecciona 1 opción de cada categoría ({Object.keys(currentMsgSelections).length}/{distinctGroups.length})
            </div>
          )}
        </div>
      )}
    </div>
  );
}
