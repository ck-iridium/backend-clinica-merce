"use client"
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Globe, FileText, X, ArrowUp, ArrowDown, Eye, EyeOff, Sparkles, Check, Link2, ExternalLink } from 'lucide-react';
import SmartLinkPickerModal from '@/components/cms/SmartLinkPickerModal';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  is_visible: boolean;
  order_index: number;
  is_custom?: boolean;
}

interface CustomPageOption {
  id: string;
  label: string;
  path: string;
}

interface NavigationEditorTabProps {
  navigationItems: NavigationItem[];
  loadingNav: boolean;
  onMoveNavItem: (index: number, direction: 'up' | 'down') => void;
  onUpdateNavItemLabel: (index: number, value: string) => void;
  onToggleNavItemVisibility: (index: number) => void;
  onAddNavItem?: (newItem: { label: string; path: string; is_visible: boolean }) => Promise<void>;
  onDeleteNavItem?: (id: string) => Promise<void>;
  categories?: any[];
  services?: any[];
}

export default function NavigationEditorTab({
  navigationItems,
  loadingNav,
  onMoveNavItem,
  onUpdateNavItemLabel,
  onToggleNavItemVisibility,
  onAddNavItem,
  onDeleteNavItem,
  categories = [],
  services = []
}: NavigationEditorTabProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Control del Selector Inteligente de Enlaces
  const [isSmartPickerOpen, setIsSmartPickerOpen] = useState(false);
  const [showConfirmAddModal, setShowConfirmAddModal] = useState(false);

  // Datos del nuevo enlace
  const [newLabel, setNewLabel] = useState('');
  const [newPath, setNewPath] = useState('');
  const [newVisible, setNewVisible] = useState(true);
  const [savingAdd, setSavingAdd] = useState(false);

  // Páginas del CMS cargadas dinámicamente
  const [availablePages, setAvailablePages] = useState<CustomPageOption[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);

  // Confirmar eliminación
  const [itemToDelete, setItemToDelete] = useState<NavigationItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Cargar páginas autónomas disponibles
  useEffect(() => {
    const fetchPages = async () => {
      setLoadingPages(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/cms/pages`);
        if (res.ok) {
          const data = await res.json();
          setAvailablePages(data);
        }
      } catch (err) {
        console.error("Error al cargar páginas para navegación", err);
      } finally {
        setLoadingPages(false);
      }
    };
    fetchPages();
  }, []);

  // Al seleccionar un destino en el Selector Inteligente
  const handleSelectSmartLink = (url: string, suggestedText?: string) => {
    setNewPath(url);
    setNewLabel(suggestedText || '');
    setNewVisible(true);
    setIsSmartPickerOpen(false);
    setShowConfirmAddModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newPath.trim() || !onAddNavItem) return;
    setSavingAdd(true);
    try {
      await onAddNavItem({
        label: newLabel.trim(),
        path: newPath.trim(),
        is_visible: newVisible
      });
      setShowConfirmAddModal(false);
      setNewLabel('');
      setNewPath('');
      setNewVisible(true);
    } finally {
      setSavingAdd(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete || !onDeleteNavItem) return;
    setDeleting(true);
    try {
      await onDeleteNavItem(itemToDelete.id);
      setItemToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Botón principal de añadir enlace */}
      {onAddNavItem && (
        <button
          onClick={() => setIsSmartPickerOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-stone-900 hover:bg-[#d4af37] text-white rounded-2xl text-xs font-bold transition-all duration-300 shadow-sm active:scale-[0.99] group"
        >
          <Sparkles className="w-4 h-4 text-[#d4af37] group-hover:text-white transition-colors" />
          <span>Añadir Enlace al Menú</span>
        </button>
      )}

      <p className="text-xs text-stone-400 font-medium px-1 leading-relaxed">
        Ordena y renombra los apartados del menú. Puedes ocultar elementos con el ojo o añadir nuevos accesos usando el Selector Inteligente.
      </p>
      
      {loadingNav ? (
        <div className="space-y-4 pt-2">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-3">
          {navigationItems.map((item, index) => (
            <div 
              key={item.id} 
              className={`flex items-center gap-3 bg-white p-4 rounded-2xl border transition-all duration-300 ${
                item.is_visible 
                  ? 'border-stone-100 shadow-[0_4px_12px_rgba(0,0,0,0.01)]' 
                  : 'border-stone-100 opacity-60 bg-stone-50/50'
              }`}
            >
              {/* Flechas de ordenamiento */}
              <div className="flex flex-col gap-1 shrink-0">
                <button 
                  onClick={() => onMoveNavItem(index, 'up')}
                  disabled={index === 0}
                  className="text-stone-300 hover:text-stone-600 disabled:opacity-20 p-0.5 rounded transition-all"
                  title="Subir posición"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => onMoveNavItem(index, 'down')}
                  disabled={index === navigationItems.length - 1}
                  className="text-stone-300 hover:text-stone-600 disabled:opacity-20 p-0.5 rounded transition-all"
                  title="Bajar posición"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Label Editable */}
              <div className="flex-1 min-w-0">
                <input 
                  type="text" 
                  value={item.label}
                  onChange={(e) => onUpdateNavItemLabel(index, e.target.value)}
                  className="w-full bg-transparent border-b border-transparent hover:border-stone-200 focus:border-[#d4af37] focus:outline-none py-1 text-sm text-stone-800 font-bold tracking-tight transition-colors"
                  placeholder="Nombre visible en el menú"
                />
                <span className="text-[10px] text-stone-400 font-bold flex items-center gap-1.5 mt-0.5">
                  <span>Ruta:</span>
                  <code className="bg-stone-50 px-1.5 py-0.5 rounded font-mono text-[9px] text-stone-600 border border-stone-100">
                    {item.path}
                  </code>
                  {item.is_custom && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-50 text-[#d4af37] font-semibold border border-amber-100">
                      Personalizado
                    </span>
                  )}
                </span>
              </div>

              {/* Ojo de Visibilidad */}
              <button 
                onClick={() => onToggleNavItemVisibility(index)}
                className={`p-2 rounded-xl transition-all border shrink-0 ${
                  item.is_visible 
                    ? 'text-[#d4af37] bg-amber-50/50 border-amber-100 hover:bg-amber-50' 
                    : 'text-stone-400 bg-stone-50 border-stone-200 hover:bg-stone-100'
                }`}
                title={item.is_visible ? "Ocultar en web pública" : "Mostrar en web pública"}
              >
                {item.is_visible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>

              {/* Botón eliminar para enlaces personalizados */}
              {onDeleteNavItem && item.is_custom && (
                <button
                  onClick={() => setItemToDelete(item)}
                  className="p-2 rounded-xl text-stone-300 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all shrink-0"
                  title="Eliminar enlace del menú"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── SELECTOR INTELIGENTE DE ENLACES (PORTALIZADO Z-[9999]) ── */}
      <SmartLinkPickerModal
        isOpen={isSmartPickerOpen}
        onClose={() => setIsSmartPickerOpen(false)}
        onSelect={handleSelectSmartLink}
        currentValue={newPath}
        categories={categories}
        services={services}
        customPages={availablePages}
      />

      {/* ── MODAL LUXURY DE CONFIRMACIÓN / CONFIGURACIÓN DE ENLACE (PORTALIZADO Z-[9999]) ── */}
      {showConfirmAddModal && mounted && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200/80 dark:border-stone-800 w-full max-w-md p-7 animate-in zoom-in-95 duration-300">
            
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37] block mb-1">
                  Navegación Web
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-[#d4af37]" />
                  <span>Añadir al Menú Superior</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmAddModal(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tarjeta de Destino Seleccionado */}
            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200/70 dark:border-stone-700/60 mb-5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                  Destino Seleccionado
                </span>
                <p className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200 truncate mt-0.5">
                  {newPath}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmAddModal(false);
                  setIsSmartPickerOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-[11px] font-bold text-[#b8952b] hover:bg-[#d4af37]/10 transition-colors shrink-0"
              >
                Cambiar
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Texto visible */}
              <div>
                <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1.5 uppercase tracking-wider">
                  Texto visible en el menú
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Ej: Ofertas, Contacto, Tratamientos..."
                  className="w-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 dark:text-stone-100 font-medium focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition-all"
                  required
                  autoFocus
                />
              </div>

              {/* URL o Ruta editable */}
              <div>
                <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1.5 uppercase tracking-wider">
                  Ruta o URL Destino
                </label>
                <input
                  type="text"
                  value={newPath}
                  onChange={(e) => setNewPath(e.target.value)}
                  placeholder="/ruta o https://..."
                  className="w-full border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/80 rounded-xl px-3.5 py-2.5 text-xs font-mono text-stone-700 dark:text-stone-300 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition-all"
                  required
                />
              </div>

              {/* Visible en menú */}
              <div className="flex items-center justify-between py-2.5 px-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-100 dark:border-stone-700">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300">Mostrar de inmediato en la web pública</span>
                <button
                  type="button"
                  onClick={() => setNewVisible(!newVisible)}
                  className={`relative w-10 h-5 rounded-full transition-all duration-300 shrink-0 ${
                    newVisible ? 'bg-[#d4af37]' : 'bg-stone-200 dark:bg-stone-700'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                    newVisible ? 'translate-x-5' : ''
                  }`} />
                </button>
              </div>

              {/* Botones */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingAdd || !newLabel.trim() || !newPath.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-[#d4af37] text-white text-xs font-bold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-[0.99]"
                >
                  {savingAdd ? 'Añadiendo...' : 'Añadir al Menú'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── MODAL CONFIRMAR ELIMINACIÓN DE ENLACE (PORTALIZADO Z-[9999]) ── */}
      {itemToDelete && mounted && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200/80 dark:border-stone-800 w-full max-w-sm p-6 animate-in zoom-in-95 duration-300 text-center">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-lg font-bold text-stone-800 dark:text-stone-100 mb-1.5">
              ¿Eliminar enlace del menú?
            </h4>
            <p className="text-stone-400 text-xs mb-5">
              Se quitará <strong className="text-stone-700 dark:text-stone-200">"{itemToDelete.label}"</strong> del menú superior. (Si es una página autónoma, su contenido seguirá existiendo en Páginas del Sitio).
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all disabled:opacity-40"
              >
                {deleting ? 'Eliminando...' : 'Sí, quitar'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
