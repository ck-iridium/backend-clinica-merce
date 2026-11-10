"use client";

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Check, X, Layers, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Location, LocationResource } from "./types";
import { getCookie } from "./locationUtils";

interface LocationResourcesModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  location: Location | null;
  onSuccess?: () => void;
}

export default function LocationResourcesModal({
  isOpen,
  onOpenChange,
  location,
  onSuccess
}: LocationResourcesModalProps) {
  const [resources, setResources] = useState<LocationResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Formulario nuevo recurso
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceQuantity, setNewResourceQuantity] = useState(1);

  const getAuthHeaders = () => {
    const userSession = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    let tenantId = getCookie('tenant_id') || '';
    let authToken = '';
    if (userSession) {
      try {
        const parsed = JSON.parse(userSession);
        if (!tenantId) tenantId = parsed.tenant_id || '';
        authToken = parsed.access_token || parsed.token || '';
      } catch (e) { /* ignore */ }
    }
    return {
      'X-Tenant-ID': tenantId,
      'Authorization': authToken ? `Bearer ${authToken}` : '',
      'Content-Type': 'application/json'
    };
  };

  const fetchResources = async () => {
    if (!location) return;
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations/${location.id}/resources`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setResources(data || []);
      }
    } catch (e) {
      console.error("Error fetching resources:", e);
      toast.error("Error al cargar los recursos de la sede");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && location) {
      fetchResources();
      setNewResourceName('');
      setNewResourceQuantity(1);
    }
  }, [isOpen, location]);

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !newResourceName.trim()) {
      toast.error("Indica el nombre de la cabina o recurso");
      return;
    }

    try {
      setCreating(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations/${location.id}/resources`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: newResourceName.trim(),
          quantity: Math.max(1, Number(newResourceQuantity) || 1),
          is_active: true
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Error al crear el recurso");
      }

      toast.success("Recurso añadido correctamente");
      setNewResourceName('');
      setNewResourceQuantity(1);
      fetchResources();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "Error al crear recurso");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleResource = async (resource: LocationResource) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations/resources/${resource.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          is_active: !resource.is_active
        })
      });

      if (!res.ok) throw new Error("Error al actualizar estado");
      toast.success(resource.is_active ? "Recurso pausado" : "Recurso activado");
      fetchResources();
      onSuccess?.();
    } catch (e: any) {
      toast.error(e.message || "Error al actualizar recurso");
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations/resources/${resourceId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!res.ok) throw new Error("Error al eliminar recurso");
      toast.success("Recurso eliminado");
      setResources(prev => prev.filter(r => r.id !== resourceId));
      onSuccess?.();
    } catch (e: any) {
      toast.error(e.message || "Error al eliminar recurso");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-[2rem] bg-white border border-stone-200/80 shadow-2xl">
        <DialogHeader className="p-7 pb-4 bg-gradient-to-b from-stone-50 to-white border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20">
              <Layers size={20} />
            </div>
            <div>
              <DialogTitle className="font-serif text-xl font-normal text-stone-900 tracking-tight">
                Cabinas y Recursos Físicos
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-500 font-medium">
                {location ? location.name : 'Sede'} • Equipamiento y salas con cupo limitado
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-7 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Explicación de arquitectura Cero Ruido */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900/90 leading-relaxed flex items-start gap-3">
            <Sparkles size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
            <p>
              Registra las <strong>cabinas</strong> o <strong>máquinas de tratamiento</strong> de esta sede que no admiten citas simultáneas (ej. Máquina Láser Sapphire o Cabina Estética 1). El sistema evitará automáticamente citas dobles en esos servicios.
            </p>
          </div>

          {/* Formulario para añadir nuevo recurso */}
          <form onSubmit={handleCreateResource} className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 space-y-3">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              Añadir Nuevo Recurso / Cabina
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="location-resource-name-input"
                type="text"
                placeholder="Ej. Máquina Láser Sapphire, Cabina 1..."
                value={newResourceName}
                onChange={(e) => setNewResourceName(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-900 focus:ring-1 focus:ring-[#D4AF37] outline-none"
              />
              <div className="flex items-center gap-2">
                <div className="w-24">
                  <input
                    id="location-resource-quantity-input"
                    type="number"
                    min={1}
                    max={50}
                    placeholder="Cant."
                    value={newResourceQuantity}
                    onChange={(e) => setNewResourceQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    title="Número de unidades disponibles simultáneamente"
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-center text-stone-900 focus:ring-1 focus:ring-[#D4AF37] outline-none"
                  />
                </div>
                <Button
                  id="location-resource-add-btn"
                  type="submit"
                  disabled={creating || !newResourceName.trim()}
                  className="bg-[#D4AF37] hover:bg-[#b08e23] text-stone-950 font-bold text-xs h-10 px-4 rounded-xl shadow-xs"
                >
                  <Plus size={14} className="mr-1" />
                  {creating ? 'Guardando...' : 'Añadir'}
                </Button>
              </div>
            </div>
          </form>

          {/* Lista de recursos actuales */}
          <div className="space-y-2.5">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              Recursos de esta sede ({resources.length})
            </p>

            {loading ? (
              <div className="py-8 text-center text-xs text-stone-400 animate-pulse">
                Cargando recursos...
              </div>
            ) : resources.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-stone-200 text-center">
                <p className="text-xs text-stone-500 font-medium">
                  No hay cabinas ni recursos físicos registrados en esta sede.
                </p>
                <p className="text-[11px] text-stone-400 mt-1">
                  Los especialistas podrán atender libremente citas a la misma hora sin restricción de maquinaria.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {resources.map((res) => (
                  <div
                    key={res.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                      res.is_active 
                        ? 'bg-white border-stone-200/80 shadow-2xs' 
                        : 'bg-stone-50/60 border-stone-100 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        res.is_active ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-stone-200 text-stone-400'
                      }`}>
                        <Layers size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-900">{res.name}</p>
                        <p className="text-[10px] text-stone-400 font-medium">
                          {res.quantity} {res.quantity === 1 ? 'unidad disponible' : 'unidades disponibles'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleResource(res)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                          res.is_active
                            ? 'border-stone-200 text-stone-600 hover:bg-stone-50'
                            : 'border-[#D4AF37]/30 text-[#bf9b30] hover:bg-[#D4AF37]/10'
                        }`}
                      >
                        {res.is_active ? 'Activo' : 'Pausado'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteResource(res.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        title="Eliminar recurso"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-5 bg-stone-50/80 border-t border-stone-100 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border-stone-200 text-stone-600 text-xs font-bold hover:bg-white"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

