'use client';

import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  FileCheck,
  Store,
  Globe,
  SlidersHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function getTenantHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  if (typeof window === 'undefined') return headers;

  const cookieTenant = getCookie('tenant_id');
  if (cookieTenant) headers['X-Tenant-ID'] = cookieTenant;

  const userSession = localStorage.getItem('user');
  if (userSession) {
    try {
      const parsed = JSON.parse(userSession);
      if (!headers['X-Tenant-ID'] && parsed.tenant_id) {
        headers['X-Tenant-ID'] = parsed.tenant_id;
      }
      const token = parsed.access_token || parsed.token;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error parsing user session in UniversalExcelImportModal:', e);
    }
  }

  return headers;
}

interface FieldDefinition {
  key: string;
  label: string;
  required?: boolean;
  description: string;
  hintSynonyms: string[];
}

const CLIENT_FIELDS: FieldDefinition[] = [
  { 
    key: 'name', 
    label: 'Nombre Completo / Razón Social', 
    required: true, 
    description: 'Nombre del cliente',
    hintSynonyms: ['nombre', 'cliente', 'name', 'titular', 'paciente', 'apellidos'] 
  },
  { 
    key: 'phone', 
    label: 'Teléfono Principal (Móvil)', 
    description: 'Número de contacto principal para WhatsApp o llamadas',
    hintSynonyms: ['teléfono1', 'telefono1', 'teléfono', 'telefono', 'móvil', 'movil', 'phone', 'celular'] 
  },
  { 
    key: 'phone2', 
    label: '2º Teléfono (Adicional / Fijo)', 
    description: 'Segundo teléfono de contacto si existe',
    hintSynonyms: ['teléfono2', 'telefono2', 'fijo', 'casa', 'trabajo'] 
  },
  { 
    key: 'raw_history', 
    label: 'Historial Técnico / Trabajos Realizados', 
    description: 'Notas históricas, tintes, decoloraciones o bitácora de tratamientos (se analizarán fechas y mezclas automáticamente)',
    hintSynonyms: ['histórico', 'historico', 'fórmula', 'formula', 'color', 'tinte', 'técnico', 'tecnico', 'notas técnicas', 'observaci histórico'] 
  },
  { 
    key: 'address', 
    label: 'Dirección / Domicilio', 
    description: 'Calle, número o población de residencia',
    hintSynonyms: ['dirección', 'direccion', 'calle', 'domicilio', 'address', 'población', 'poblacion'] 
  },
  { 
    key: 'gender', 
    label: 'Sexo / Género', 
    description: 'Hombre / Mujer / Otro',
    hintSynonyms: ['sexo', 'género', 'genero', 'gender'] 
  },
  { 
    key: 'birth_date', 
    label: 'Fecha de Nacimiento', 
    description: 'Fecha o cumpleaños del cliente',
    hintSynonyms: ['nacimiento', 'cumpleaños', 'cumple', 'f. nacimiento', 'birth'] 
  },
  { 
    key: 'notes', 
    label: 'Observaciones / Alergias', 
    description: 'Alergias a cosméticos, sensibilidades o comentarios generales',
    hintSynonyms: ['observaciones', 'observacion', 'notas', 'alergias', 'comentarios'] 
  },
  { 
    key: 'email', 
    label: 'Correo Electrónico (Email)', 
    description: 'Email del cliente (opcional)',
    hintSynonyms: ['email', 'correo', 'mail', 'e-mail'] 
  },
];

const SERVICE_FIELDS: FieldDefinition[] = [
  { 
    key: 'name', 
    label: 'Nombre del Servicio o Producto', 
    required: true, 
    description: 'Nombre visible en tickets o catálogo',
    hintSynonyms: ['nombre', 'servicio', 'artículo', 'articulo', 'tratamiento', 'producto', 'descripción'] 
  },
  { 
    key: 'price', 
    label: 'Precio de Venta al Público (€)', 
    required: true, 
    description: 'PVP final con IVA incluido',
    hintSynonyms: ['precio venta', 'precio', 'pvp', 'tarifa', 'importe', 'price'] 
  },
  { 
    key: 'is_product', 
    label: '¿Es Artículo / Producto de Venta?', 
    description: 'Columna con "si"/"no" para distinguir servicios de mano de obra de productos de venta en TPV',
    hintSynonyms: ['es artículo', 'es articulo', 'es producto', 'tipo', 'artículo', 'articulo'] 
  },
  { 
    key: 'category', 
    label: 'Sección / Categoría / Familia', 
    description: 'Familia o sección para agrupar en el TPV (ej: Peluquería Servicios, Tintes...)',
    hintSynonyms: ['sección', 'seccion', 'familia', 'categoría', 'categoria', 'grupo'] 
  },
  { 
    key: 'cost_price', 
    label: 'Precio de Coste / Compra (€)', 
    description: 'Precio al que se compra al distribuidor',
    hintSynonyms: ['precio compra', 'coste', 'cost', 'compra'] 
  },
  { 
    key: 'sku', 
    label: 'Código de Barras / SKU', 
    description: 'Código de barras para lector láser o referencia interna',
    hintSynonyms: ['código barras', 'codigo barras', 'código', 'codigo', 'sku', 'barcode', 'referencia'] 
  },
  { 
    key: 'stock', 
    label: 'Stock Actual', 
    description: 'Cantidad de unidades en inventario',
    hintSynonyms: ['stock actual', 'stock', 'existencias', 'unidades'] 
  },
  { 
    key: 'duration', 
    label: 'Duración (Minutos)', 
    description: 'Tiempo estándar del servicio en agenda',
    hintSynonyms: ['duración', 'duracion', 'minutos', 'tiempo'] 
  },
];

interface UniversalExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'clients' | 'services';
  onSuccess: () => void;
}

export function UniversalExcelImportModal({
  isOpen,
  onClose,
  type,
  onSuccess,
}: UniversalExcelImportModalProps) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'importing' | 'completed'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [visibilityMode, setVisibilityMode] = useState<'tpv_only' | 'web_and_tpv' | 'auto'>('tpv_only');
  const [importResult, setImportResult] = useState<{
    total_rows: number;
    imported: number;
    updated: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fieldDefinitions = type === 'clients' ? CLIENT_FIELDS : SERVICE_FIELDS;

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setIsDragging(false);
    setHeaders([]);
    setPreviewRows([]);
    setMapping({});
    setImportResult(null);
    setVisibilityMode('tpv_only');
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsLoadingPreview(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const endpoint = type === 'clients' 
        ? `${process.env.NEXT_PUBLIC_API_URL}/clients/import-excel-preview`
        : `${process.env.NEXT_PUBLIC_API_URL}/services/import-excel-preview`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: getTenantHeaders(),
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Error al procesar el archivo' }));
        throw new Error(err.detail || 'Error al procesar el archivo');
      }

      const data = await res.json();
      const detectedHeaders: string[] = data.headers || [];
      const preview: any[] = data.preview || [];

      setHeaders(detectedHeaders);
      setPreviewRows(preview);

      // Auto-mapeo inteligente por similitud
      const initialMapping: Record<string, string> = {};
      fieldDefinitions.forEach((field) => {
        const match = detectedHeaders.find((h) => {
          const normH = h.toLowerCase().trim();
          return field.hintSynonyms.some((syn) => normH.includes(syn.toLowerCase()));
        });
        if (match) {
          initialMapping[field.key] = match;
        }
      });

      setMapping(initialMapping);
      setStep('mapping');
      toast.success(`Archivo leído con éxito: ${detectedHeaders.length} columnas detectadas`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al leer el archivo Excel');
      setFile(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleMappingChange = (fieldKey: string, excelColumn: string) => {
    setMapping((prev) => {
      const updated = { ...prev };
      if (excelColumn === '__none__') {
        delete updated[fieldKey];
      } else {
        updated[fieldKey] = excelColumn;
      }
      return updated;
    });
  };

  const handleStartImport = async () => {
    if (!file) return;

    // Verificar campo obligatorio 'name'
    if (!mapping['name']) {
      toast.error('Debes asignar al menos una columna para el campo "Nombre"');
      return;
    }

    setStep('importing');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mapping', JSON.stringify(mapping));
      if (type === 'services') {
        formData.append('visibility_mode', visibilityMode);
      }

      const endpoint = type === 'clients'
        ? `${process.env.NEXT_PUBLIC_API_URL}/clients/import-excel`
        : `${process.env.NEXT_PUBLIC_API_URL}/services/import-excel`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: getTenantHeaders(),
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Error en la importación' }));
        throw new Error(err.detail || 'Error en la importación');
      }

      const result = await res.json();
      setImportResult(result);
      setStep('completed');
      toast.success(`¡Importación completada! ${result.imported} nuevos, ${result.updated} actualizados.`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error durante la importación');
      setStep('mapping');
    }
  };

  const handleFinish = () => {
    onSuccess();
    handleReset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleReset();
        onClose();
      }
    }}>
      <DialogContent className="p-0 border border-stone-200/90 w-[95vw] sm:max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl bg-white flex flex-col overflow-hidden">
        {/* Header */}
        <DialogHeader className="shrink-0 p-6 border-b border-stone-100 bg-stone-50/70">
          <div className="flex items-center justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-200/60 mb-1">
                <FileSpreadsheet size={12} className="text-[#FF6B00]" />
                Asistente Universal Excel
              </span>
              <DialogTitle className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                {type === 'clients' ? 'Importar Directorio de Clientes' : 'Importar Catálogo & Tarifas TPV'}
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-500 mt-0.5">
                {type === 'clients' 
                  ? 'Importa clientes y sus historiales técnicos desde cualquier formato de Excel o CSV.'
                  : 'Carga masivamente servicios y productos con precios, stock y códigos de barras en tu TPV.'
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* STEP 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-6 py-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer group ${
                  isDragging 
                    ? 'border-[#FF6B00] bg-orange-50/50 scale-[1.01] shadow-lg' 
                    : 'border-stone-300 hover:border-[#FF6B00] bg-stone-50/50 hover:bg-orange-50/20'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {isLoadingPreview ? (
                  <div className="space-y-3">
                    <div className="w-10 h-10 mx-auto border-3 border-stone-200 border-t-[#FF6B00] rounded-full animate-spin" />
                    <p className="text-xs font-bold text-stone-700">Analizando estructura del archivo...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center transition-transform shadow-xs ${
                      isDragging ? 'bg-[#FF6B00] text-white scale-110' : 'bg-orange-100/70 text-[#FF6B00] group-hover:scale-110'
                    }`}>
                      <UploadCloud size={28} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-800">
                        {isDragging ? 'Suelta el archivo aquí para comenzar' : 'Haz clic o arrastra aquí tu archivo Excel o CSV'}
                      </p>
                      <p className="text-xs text-stone-400 mt-1">
                        Compatible con archivos exportados de otros programas (.xlsx, .xls, .csv)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/70 text-xs text-stone-600 space-y-1.5">
                <p className="font-bold text-stone-800 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[#FF6B00]" />
                  Mapeo Inteligente y Auto-Detección
                </p>
                <p>
                  No importa cómo se llamen las columnas en tu Excel. Podrás asociar cada columna a tu gusto con vista previa en tiempo real.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Visual Column Mapping */}
          {step === 'mapping' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-3 bg-orange-50/70 border border-orange-200/60 rounded-2xl text-xs">
                <div className="flex items-center gap-2">
                  <FileCheck size={16} className="text-[#FF6B00]" />
                  <span className="font-bold text-orange-950 truncate max-w-[250px]">{file?.name}</span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[11px] font-bold text-orange-900 hover:underline cursor-pointer"
                >
                  Cambiar archivo
                </button>
              </div>

              {/* Destination Selector for Services */}
              {type === 'services' && (
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal size={14} className="text-[#FF6B00]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Destino de los Precios / Tratamientos Importados
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setVisibilityMode('tpv_only')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        visibilityMode === 'tpv_only'
                          ? 'border-[#FF6B00] bg-orange-50/50 ring-1 ring-[#FF6B00]/40'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-stone-800 mb-1">
                        <Store size={14} className={visibilityMode === 'tpv_only' ? 'text-[#FF6B00]' : 'text-stone-500'} />
                        Solo TPV (Mostrador)
                      </div>
                      <p className="text-[10px] text-stone-500 leading-tight">
                        Uso interno para cobrar en mostrador. Oculto para reservas en la web.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisibilityMode('web_and_tpv')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        visibilityMode === 'web_and_tpv'
                          ? 'border-[#FF6B00] bg-orange-50/50 ring-1 ring-[#FF6B00]/40'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-stone-800 mb-1">
                        <Globe size={14} className={visibilityMode === 'web_and_tpv' ? 'text-[#FF6B00]' : 'text-stone-500'} />
                        Web y TPV
                      </div>
                      <p className="text-[10px] text-stone-500 leading-tight">
                        Visible en el catálogo web público para reservas y también en el TPV.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisibilityMode('auto')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        visibilityMode === 'auto'
                          ? 'border-[#FF6B00] bg-orange-50/50 ring-1 ring-[#FF6B00]/40'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-stone-800 mb-1">
                        <Sparkles size={14} className={visibilityMode === 'auto' ? 'text-[#FF6B00]' : 'text-stone-500'} />
                        Auto-detectar
                      </div>
                      <p className="text-[10px] text-stone-500 leading-tight">
                        Según columna 'Es artículo': artículos solo a TPV, servicios a web y TPV.
                      </p>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Asociación de Columnas de tu Excel
                </h3>
                <p className="text-[11px] text-stone-400">
                  Verifica que las columnas detectadas correspondan con la información deseada:
                </p>
              </div>

              <div className="space-y-3">
                {fieldDefinitions.map((field) => {
                  const selectedColumn = mapping[field.key] || '__none__';
                  const sampleValue = selectedColumn !== '__none__' && previewRows.length > 0 
                    ? previewRows[0][selectedColumn] 
                    : null;

                  return (
                    <div 
                      key={field.key}
                      className="p-3.5 bg-white border border-stone-200 rounded-2xl shadow-2xs hover:border-stone-300 transition-all space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-stone-900">{field.label}</span>
                            {field.required && (
                              <span className="text-[10px] font-bold text-rose-500">*Obligatorio</span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-400">{field.description}</p>
                        </div>

                        <div className="w-full sm:w-64 shrink-0">
                          <Select
                            value={selectedColumn}
                            onValueChange={(val) => handleMappingChange(field.key, val)}
                          >
                            <SelectTrigger className="w-full text-xs font-semibold h-9 rounded-xl border-stone-200 bg-stone-50/60">
                              <SelectValue placeholder="-- Seleccionar columna --" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border border-stone-200 shadow-xl max-h-56 bg-white">
                              <SelectItem value="__none__" className="text-stone-400 italic text-xs">
                                -- No importar este campo --
                              </SelectItem>
                              {headers.map((h) => (
                                <SelectItem key={h} value={h} className="text-xs font-medium">
                                  {h}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {sampleValue !== null && sampleValue !== undefined && String(sampleValue).trim() !== '' && (
                        <div className="text-[11px] bg-stone-50 border border-stone-100 rounded-lg px-2.5 py-1 text-stone-600 truncate">
                          <span className="text-stone-400 font-semibold mr-1.5">Muestra Fila 1:</span>
                          <span className="font-mono">{String(sampleValue)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Importing in progress */}
          {step === 'importing' && (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 mx-auto border-3 border-stone-200 border-t-[#FF6B00] rounded-full animate-spin" />
              <div>
                <h3 className="text-base font-bold text-stone-900">Procesando e Importando Registros</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Analizando fichas técnicas, normalizando teléfonos y sincronizando tu catálogo...
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Completed summary */}
          {step === 'completed' && importResult && (
            <div className="space-y-6 py-4">
              <div className="p-6 bg-emerald-50/70 border border-emerald-200/70 rounded-3xl text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-emerald-950">
                    ¡Importación Completada con Éxito!
                  </h3>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Tus registros han sido guardados y están listos para utilizarse.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <span className="text-2xl font-bold text-emerald-700 block">{importResult.imported}</span>
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Nuevos Creados</span>
                </div>
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <span className="text-2xl font-bold text-[#FF6B00] block">{importResult.updated}</span>
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Actualizados</span>
                </div>
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <span className="text-2xl font-bold text-stone-400 block">{importResult.skipped}</span>
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Omitidos / Vacíos</span>
                </div>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 text-xs text-orange-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertCircle size={13} /> Avisos durante la importación:
                  </p>
                  <ul className="list-disc pl-4 text-[11px] space-y-0.5 text-orange-800">
                    {importResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 p-6 border-t border-stone-100 bg-stone-50/80 flex items-center justify-between gap-4">
          {step === 'mapping' ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="rounded-xl border-stone-300 text-stone-600 font-bold text-xs cursor-pointer"
              >
                Volver
              </Button>
              <Button
                type="button"
                onClick={handleStartImport}
                className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl px-6 py-2.5 shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Comenzar Importación</span>
                <ArrowRight size={14} />
              </Button>
            </>
          ) : step === 'completed' ? (
            <Button
              type="button"
              onClick={handleFinish}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl py-3 shadow-md cursor-pointer"
            >
              Finalizar y Ver Datos en el Panel
            </Button>
          ) : (
            <div className="w-full flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl border-stone-300 text-stone-600 font-bold text-xs cursor-pointer"
              >
                Cerrar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
