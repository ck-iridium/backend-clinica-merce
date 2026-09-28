import { useState, useEffect } from 'react';
import { FileText, Plus, Edit2, Trash2, ChevronLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface ConsentTemplate {
  id: string;
  title: string;
  body_text: string;
  created_at: string;
  updated_at: string;
}

export default function ConsentsTab() {
  const { showFeedback } = useFeedback();
  const [templates, setTemplates] = useState<ConsentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<Partial<ConsentTemplate> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/consent-templates/`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      } else {
        toast.error('Error al cargar las plantillas de consentimiento');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error de red al cargar las plantillas');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate?.title?.trim() || !editingTemplate?.body_text?.trim()) {
      toast.error('El título y el cuerpo del documento son obligatorios');
      return;
    }

    setIsSaving(true);
    try {
      const isNew = !editingTemplate.id;
      const url = isNew 
        ? `${process.env.NEXT_PUBLIC_API_URL}/consent-templates/`
        : `${process.env.NEXT_PUBLIC_API_URL}/consent-templates/${editingTemplate.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingTemplate.title,
          body_text: editingTemplate.body_text
        })
      });

      if (res.ok) {
        toast.success(isNew ? 'Plantilla creada con éxito' : 'Plantilla actualizada');
        setEditingTemplate(null);
        fetchTemplates();
      } else {
        toast.error('Error al guardar la plantilla');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error de red al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    showFeedback({
      type: 'confirm',
      title: 'Eliminar Plantilla',
      message: '¿Estás seguro de que deseas eliminar esta plantilla de consentimiento? Esta acción es permanente.',
      onConfirm: async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/consent-templates/${id}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            toast.success('Plantilla eliminada correctamente');
            fetchTemplates();
          } else {
            toast.error('Error al eliminar la plantilla');
          }
        } catch (e) {
          console.error(e);
          toast.error('Error de red al eliminar');
        }
      }
    });
  };

  if (loading && templates.length === 0) {
    return (
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-150/80 p-8 shadow-sm space-y-4">
        <Skeleton className="h-7 w-52 rounded-xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  if (editingTemplate) {
    return (
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-200/80 p-5 md:p-8 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
          <Button 
            id="consents-back-btn"
            type="button" 
            variant="ghost"
            size="icon"
            onClick={() => setEditingTemplate(null)}
            className="w-9 h-9 rounded-full bg-stone-100/70 hover:bg-stone-200 text-stone-600 transition-colors"
          >
            <ChevronLeft size={18} />
          </Button>
          <div>
            <h3 className="text-xl md:text-2xl font-serif font-semibold text-stone-900">
              {editingTemplate.id ? 'Editar Plantilla' : 'Nueva Plantilla'}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">Define los términos legales para la firma del cliente</p>
          </div>
        </div>

        <form id="consents-template-form" onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1 mb-2 block">
              Título del Documento
            </label>
            <input 
              id="consents-title-input"
              required
              type="text" 
              placeholder="Ej. Consentimiento Informado para Tratamiento Facial"
              value={editingTemplate.title || ''}
              onChange={e => setEditingTemplate({...editingTemplate, title: e.target.value})}
              className="w-full px-4 py-3 bg-stone-50/70 border border-stone-200 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 focus:bg-white outline-none transition-all text-sm font-semibold text-stone-850 shadow-2xs"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1 mb-2 block">
              Cuerpo del Consentimiento (Términos y Condiciones)
            </label>
            <textarea 
              id="consents-body-textarea"
              required
              rows={12}
              placeholder="Escribe el texto legal aquí. Puedes usar corchetes como [Nombre del Cliente] para que el especialista los rellene al firmar."
              value={editingTemplate.body_text || ''}
              onChange={e => setEditingTemplate({...editingTemplate, body_text: e.target.value})}
              className="w-full px-4 py-3 bg-stone-50/70 border border-stone-200 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 focus:bg-white outline-none transition-all text-sm text-stone-700 leading-relaxed shadow-2xs font-sans"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
            <Button 
              id="consents-cancel-edit-btn"
              type="button" 
              variant="outline"
              onClick={() => setEditingTemplate(null)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-stone-600"
            >
              Cancelar
            </Button>
            <Button 
              id="consents-submit-btn"
              type="submit" 
              variant="luxury"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl font-bold shadow-luxury text-xs text-stone-950 flex items-center gap-2"
            >
              <Save size={15} />
              {isSaving ? 'Guardando...' : 'Guardar Plantilla'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-200/80 p-5 md:p-8 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shadow-inner">
            <FileText size={18} strokeWidth={1.5} />
          </span>
          <div>
            <h3 className="text-xl md:text-2xl font-serif font-semibold text-stone-900">Consentimientos Legales</h3>
            <p className="text-xs text-stone-400 mt-0.5">Gestiona los modelos y cláusulas informadas para tus tratamientos</p>
          </div>
        </div>
        <Button
          id="consents-new-template-btn"
          type="button"
          variant="luxury"
          onClick={() => setEditingTemplate({ title: '', body_text: '' })}
          className="rounded-xl px-5 font-bold text-xs shadow-luxury text-stone-950 flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} strokeWidth={2} />
          Nueva Plantilla
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-stone-200 rounded-3xl bg-stone-50/50">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mx-auto mb-3">
            <FileText size={24} strokeWidth={1.5} />
          </div>
          <h4 className="font-serif font-bold text-stone-800 text-lg">No hay plantillas creadas</h4>
          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto px-4 leading-relaxed">
            Crea tu primera plantilla para que esté disponible al firmar tratamientos en las fichas de tus clientes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {templates.map((template) => (
            <div 
              key={template.id} 
              className="border border-stone-200/80 hover:border-[#D4AF37]/50 rounded-2xl p-5 bg-white transition-all duration-300 flex justify-between items-start gap-4 group hover:shadow-sm"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <h4 className="font-serif font-bold text-stone-850 text-lg group-hover:text-[#D4AF37] transition-colors truncate">
                  {template.title}
                </h4>
                <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed font-sans">
                  {template.body_text}
                </p>
                <div className="text-[10px] text-stone-400 uppercase tracking-wider pt-1 flex items-center gap-2 font-medium">
                  <span>Actualizado: {new Date(template.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  id={`consents-edit-btn-${template.id}`}
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setEditingTemplate(template)}
                  className="w-8 h-8 rounded-xl border border-stone-200 hover:border-stone-900 hover:bg-stone-50 text-stone-600 transition-colors"
                  title="Editar"
                >
                  <Edit2 size={13} />
                </Button>
                <Button
                  id={`consents-delete-btn-${template.id}`}
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleDelete(template.id)}
                  className="w-8 h-8 rounded-xl border border-rose-200/60 hover:bg-rose-50 hover:border-rose-300 text-rose-500 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
