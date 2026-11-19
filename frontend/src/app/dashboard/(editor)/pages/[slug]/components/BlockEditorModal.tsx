"use client";
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link2, Check, X, Sparkles, LayoutGrid, Layers, CheckCircle2, AlignLeft, AlignCenter, AlignRight, AlignJustify, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';

const selectClass = "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 font-sans shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] transition-all duration-200 appearance-none cursor-pointer";
const inputClass = "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 font-sans shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] transition-all duration-200";
const labelClass = "block text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1.5";

// ── UTILERÍA: Camuflaje y formateo de nombre de archivo Supabase ───────
function getCleanFileName(url?: string): string {
  if (!url) return '';
  try {
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    const clean = lastPart.split('?')[0];
    if (clean.length > 26) {
      const ext = clean.split('.').pop() || 'webp';
      return `${clean.substring(0, 16)}...${ext}`;
    }
    return clean;
  } catch {
    return 'archivo_multimedia.webp';
  }
}

// ── SUBCOMPONENTE: Selector Multimedia de Lujo (Oculta URL Supabase) ────
function MediaSelectorField({
  value,
  onChange,
  onOpenGallery,
  label = "Fotografía o Vídeo",
  aspectRatio = "aspect-video",
}: {
  value: string;
  onChange: (val: string) => void;
  onOpenGallery: () => void;
  label?: string;
  aspectRatio?: string;
}) {
  const [showManualUrl, setShowManualUrl] = React.useState(false);
  const isVideo = value && (value.includes('.mp4') || value.includes('.webm') || value.includes('video_'));
  const cleanName = getCleanFileName(value);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className={labelClass}>{label}</label>
        {value && (
          <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md flex items-center gap-1.5 border border-stone-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            <span className="font-mono">{cleanName}</span>
          </span>
        )}
      </div>

      {value ? (
        <div className={`relative w-full ${aspectRatio} rounded-2xl overflow-hidden shadow-xs border border-stone-200/80 bg-stone-900 group`}>
          {isVideo ? (
            <video src={value} autoPlay loop muted playsInline className="w-full h-full object-cover" />
          ) : (
            <img src={value} alt="Vista previa" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all flex items-center justify-center gap-2 opacity-90 group-hover:opacity-100">
            <button
              type="button"
              onClick={onOpenGallery}
              className="px-4 py-2 rounded-xl bg-white/95 hover:bg-white text-stone-900 text-xs font-black uppercase tracking-wider shadow-md backdrop-blur-sm transition-all active:scale-95 flex items-center gap-1.5"
            >
              <ImageIcon size={13} className="text-[#d4af37]" />
              <span>Cambiar Medio</span>
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-2 rounded-xl bg-black/60 hover:bg-red-600 text-white transition-all text-xs"
              title="Quitar medio"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={onOpenGallery}
          className={`w-full ${aspectRatio} rounded-2xl border-2 border-dashed border-stone-200 hover:border-[#d4af37] bg-stone-50 hover:bg-amber-50/20 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 group p-6 text-center select-none`}
        >
          <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-stone-200 flex items-center justify-center text-stone-400 group-hover:text-[#d4af37] group-hover:border-[#d4af37] transition-all">
            <ImageIcon size={18} />
          </div>
          <span className="text-xs font-bold text-stone-600 group-hover:text-stone-900">
            Seleccionar de Galería
          </span>
          <span className="text-[10px] text-stone-400">
            Haz clic para abrir el catálogo multimedia de la clínica
          </span>
        </div>
      )}

      {/* Opción discreta para URL externa sin abrumar */}
      <div className="pt-0.5">
        {!showManualUrl ? (
          <button
            type="button"
            onClick={() => setShowManualUrl(true)}
            className="text-[10px] text-stone-400 hover:text-stone-600 hover:underline flex items-center gap-1"
          >
            <span>🔗 O pegar enlace directo externo</span>
          </button>
        ) : (
          <div className="flex gap-1.5 items-center mt-1">
            <input
              className={inputClass}
              value={value || ''}
              onChange={e => onChange(e.target.value)}
              placeholder="https://..."
            />
            <button
              type="button"
              onClick={() => setShowManualUrl(false)}
              className="p-2 text-stone-400 hover:text-stone-600"
              title="Cerrar"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── SUBCOMPONENTE: Editor Tiptap Premium ───────────────────────────────
function RichTextEditor({ value, onChange, blockId }: { value: string; onChange: (val: string) => void; blockId: string }) {
  const [linkUrl, setLinkUrl] = React.useState('');
  const [showLinkInput, setShowLinkInput] = React.useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#d4af37] underline cursor-pointer hover:text-amber-600 transition-colors',
        },
      }),
    ],
    content: value || '<p></p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  }, [blockId]);

  React.useEffect(() => {
    if (editor) {
      const current = editor.getHTML();
      if (value !== current) {
        editor.commands.setContent(value || '<p></p>');
      }
    }
  }, [value, editor]);

  if (!editor) return null;

  const handleLinkToggle = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setLinkUrl('');
    } else {
      const prev = editor.getAttributes('link').href || '';
      setLinkUrl(prev);
      setShowLinkInput(true);
    }
  };

  const saveLink = () => {
    if (linkUrl.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setShowLinkInput(false);
  };

  return (
    <div className="flex flex-col rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-[#d4af37]/30 transition-all">
      {/* Barra de herramientas */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-stone-50 border-b border-stone-200 select-none">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-xl transition-all ${editor.isActive('bold') ? 'bg-stone-200 text-stone-900 font-bold' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'}`}
          title="Negrita"
        >
          <Bold size={15} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-xl transition-all ${editor.isActive('italic') ? 'bg-stone-200 text-stone-900' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'}`}
          title="Cursiva"
        >
          <Italic size={15} strokeWidth={2.5} />
        </button>
        <div className="w-px h-5 bg-stone-250 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-xl transition-all ${editor.isActive('heading', { level: 2 }) ? 'bg-stone-200 text-stone-900' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'}`}
          title="Título 2"
        >
          <Heading2 size={15} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded-xl transition-all ${editor.isActive('heading', { level: 3 }) ? 'bg-stone-200 text-stone-900' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'}`}
          title="Título 3"
        >
          <Heading3 size={15} strokeWidth={2.5} />
        </button>
        <div className="w-px h-5 bg-stone-250 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-xl transition-all ${editor.isActive('bulletList') ? 'bg-stone-200 text-stone-900' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'}`}
          title="Lista Viñetas"
        >
          <List size={15} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-xl transition-all ${editor.isActive('orderedList') ? 'bg-stone-200 text-stone-900' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'}`}
          title="Lista Numerada"
        >
          <ListOrdered size={15} strokeWidth={2.5} />
        </button>
        <div className="w-px h-5 bg-stone-250 mx-1" />
        <button
          type="button"
          onClick={handleLinkToggle}
          className={`p-2 rounded-xl transition-all ${editor.isActive('link') ? 'bg-stone-200 text-[#d4af37]' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'}`}
          title="Agregar/Quitar Enlace"
        >
          <Link2 size={15} strokeWidth={2.5} />
        </button>

        {/* Pequeño input de link flotante integrado en la barra */}
        {showLinkInput && (
          <div className="flex items-center gap-1.5 ml-auto bg-stone-100 border border-stone-250 rounded-xl px-2 py-1 animate-in fade-in slide-in-from-right-3 duration-250">
            <input
              type="text"
              placeholder="https://..."
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              className="bg-white px-2 py-1 text-xs text-stone-850 outline-none rounded-lg border border-stone-200 w-40 focus:border-[#d4af37]"
              onKeyDown={e => {
                if (e.key === 'Enter') saveLink();
                if (e.key === 'Escape') setShowLinkInput(false);
              }}
              autoFocus
            />
            <button
              type="button"
              onClick={saveLink}
              className="p-1 rounded-md bg-stone-900 hover:bg-[#d4af37] text-white transition-all"
            >
              <Check size={12} strokeWidth={3} />
            </button>
            <button
              type="button"
              onClick={() => setShowLinkInput(false)}
              className="p-1 rounded-md bg-stone-200 hover:bg-stone-300 text-stone-600 transition-all"
            >
              <X size={12} strokeWidth={3} />
            </button>
          </div>
        )}
      </div>

      {/* Caja de contenido */}
      <div className="p-4 bg-stone-50/20">
        <EditorContent editor={editor} className="focus:outline-none min-h-[180px] prose prose-stone text-stone-700 font-sans" />
      </div>
    </div>
  );
}

// ── COMPONENTE PRINCIPAL: Modal de propiedades de bloque ──────────────────
interface BlockEditorModalProps {
  isOpen: boolean;
  editingBlock: any;
  editFormData: Record<string, any>;
  onChangeFormData: (data: Record<string, any>) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
  dbCategories: any[];
  dbServices: any[];
  openGalleryFor: (field: string, mediaType?: 'image' | 'video' | 'all') => void;
}

export default function BlockEditorModal({
  isOpen,
  editingBlock,
  editFormData,
  onChangeFormData,
  onSave,
  onClose,
  saving,
  dbCategories,
  dbServices,
  openGalleryFor,
}: BlockEditorModalProps) {
  if (!isOpen || !editingBlock) return null;

  const set = (key: string, value: any) => onChangeFormData({ ...editFormData, [key]: value });
  const blockType = editingBlock.block_type;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-8 pt-8 pb-5 border-b border-stone-100 shrink-0">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37] block mb-1">
            Propiedades del Bloque
          </span>
          <h2 className="font-serif text-2xl font-bold text-stone-800 capitalize">
            {blockType.replace(/_/g, ' ')}
          </h2>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">

          {/* ── HERO (QUIET LUXURY 2026) ── */}
          {blockType === 'hero' && (<>
            <MediaSelectorField
              value={editFormData.image_url || ''}
              onChange={val => set('image_url', val)}
              onOpenGallery={() => openGalleryFor('image_url', 'all')}
              label="Fotografía o Vídeo de Fondo (Cinematográfico 16:9)"
              aspectRatio="aspect-[16/7]"
            />

            {/* Alineación de Contenido */}
            <div>
              <label className={labelClass}>Alineación del Titular y Contenido</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'left', label: 'Izquierda', icon: AlignLeft },
                  { value: 'center', label: 'Centrado', icon: AlignCenter },
                  { value: 'right', label: 'Derecha', icon: AlignRight }
                ].map(opt => {
                  const Icon = opt.icon;
                  const isSel = (editFormData.alignment || 'center') === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set('alignment', opt.value)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                        isSel
                          ? 'bg-stone-900 border-stone-900 text-white shadow-sm ring-1 ring-stone-900'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <Icon size={14} className={isSel ? 'text-[#d4af37]' : 'text-stone-400'} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Titular Principal */}
            <div>
              <label className={labelClass}>Título Principal (Serif de Gran Formato)</label>
              <input 
                className={`${inputClass} font-serif text-base font-bold text-stone-900`} 
                value={editFormData.heading || ''} 
                onChange={e => set('heading', e.target.value)} 
                placeholder="Descubre tu mejor versión" 
              />
            </div>

            {/* Subtítulo */}
            <div>
              <label className={labelClass}>Subtítulo Descriptivo</label>
              <textarea 
                className={`${inputClass} resize-none`} 
                rows={2} 
                value={editFormData.subheading || ''} 
                onChange={e => set('subheading', e.target.value)} 
                placeholder="Texto explicativo breve que complementa el titular..." 
              />
            </div>

            {/* Botón de Acción CTA */}
            <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#d4af37] block">
                Botón de Llamada a la Acción (CTA)
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">Texto del Botón</label>
                  <input 
                    className={inputClass} 
                    value={editFormData.cta_text || ''} 
                    onChange={e => set('cta_text', e.target.value)} 
                    placeholder="Reservar cita" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">Enlace de Destino</label>
                  <input 
                    className={inputClass} 
                    value={editFormData.cta_url || ''} 
                    onChange={e => set('cta_url', e.target.value)} 
                    placeholder="/reservar" 
                  />
                </div>
              </div>
            </div>
          </>)}

          {/* ── TÍTULO / ENCABEZADO ── */}
          {(blockType === 'atomic_title' || blockType === 'title_heading') && (<>
            <div>
              <label className={labelClass}>Texto del Título</label>
              <input 
                className={`${inputClass} font-serif text-base font-bold text-stone-900`} 
                value={editFormData.title || ''} 
                onChange={e => set('title', e.target.value)} 
                placeholder="Título de la sección..." 
              />
            </div>
            <div>
              <label className={labelClass}>Subtítulo (opcional)</label>
              <input 
                className={inputClass} 
                value={editFormData.subtitle || ''} 
                onChange={e => set('subtitle', e.target.value)} 
                placeholder="Texto complementario o descripción breve..." 
              />
            </div>

            {/* Familia Tipográfica Preestablecida */}
            <div>
              <label className={labelClass}>Tipografía</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 select-none">
                {[
                  { value: 'playfair', label: 'Playfair Display', note: 'Serif Clásica' },
                  { value: 'inter', label: 'Inter Moderno', note: 'Sans Nítida' },
                  { value: 'cormorant', label: 'Cormorant', note: 'Cursiva Lujo' },
                  { value: 'cinzel', label: 'Cinzel', note: 'Romana Monumental' },
                  { value: 'montserrat', label: 'Montserrat', note: 'Geométrica' }
                ].map(font => {
                  const isSel = (editFormData.font_family || 'playfair') === font.value;
                  return (
                    <button
                      key={font.value}
                      type="button"
                      onClick={() => set('font_family', font.value)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSel
                          ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span className="block text-xs font-bold leading-tight truncate">{font.label}</span>
                      <span className={`block text-[9px] mt-0.5 ${isSel ? 'text-[#d4af37]' : 'text-stone-400'}`}>{font.note}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grosor y Tamaño */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Grosor de Fuente</label>
                <div className="grid grid-cols-3 gap-1 select-none">
                  {[
                    { value: 'normal', label: 'Normal' },
                    { value: 'semibold', label: 'Semibold' },
                    { value: 'extrabold', label: 'Black' }
                  ].map(w => {
                    const isSel = (editFormData.font_weight || 'extrabold') === w.value;
                    return (
                      <button
                        key={w.value}
                        type="button"
                        onClick={() => set('font_weight', w.value)}
                        className={`py-2 px-1.5 rounded-xl text-[11px] font-bold border transition-all text-center ${
                          isSel
                            ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {w.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={labelClass}>Tamaño</label>
                <div className="grid grid-cols-3 gap-1 select-none">
                  {[
                    { value: 'small', label: 'M (24px)' },
                    { value: 'medium', label: 'L (36px)' },
                    { value: 'xlarge', label: 'XL (54px)' }
                  ].map(s => {
                    const isSel = (editFormData.font_size || 'medium') === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => set('font_size', s.value)}
                        className={`py-2 px-1.5 rounded-xl text-[11px] font-bold border transition-all text-center ${
                          isSel
                            ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tag HTML y Alineación */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Jerarquía HTML (Tag)</label>
                <div className="grid grid-cols-4 gap-1 select-none">
                  {['h1', 'h2', 'h3', 'h4'].map(tag => {
                    const isSel = (editFormData.title_tag || 'h2') === tag;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => set('title_tag', tag)}
                        className={`py-2 rounded-xl text-xs font-black uppercase border transition-all text-center ${
                          isSel
                            ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={labelClass}>Alineación</label>
                <div className="grid grid-cols-3 gap-1 select-none">
                  {[
                    { value: 'left', icon: AlignLeft, label: 'Izq' },
                    { value: 'center', icon: AlignCenter, label: 'Centro' },
                    { value: 'right', icon: AlignRight, label: 'Dcha' }
                  ].map(al => {
                    const Icon = al.icon;
                    const isSel = (editFormData.alignment || 'center') === al.value;
                    return (
                      <button
                        key={al.value}
                        type="button"
                        onClick={() => set('alignment', al.value)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                          isSel
                            ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <Icon size={12} className={isSel ? 'text-[#d4af37]' : 'text-stone-400'} />
                        <span>{al.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Color y Transformación */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Color del Texto</label>
                <div className="grid grid-cols-3 gap-1 select-none">
                  {[
                    { value: 'stone-900', label: 'Antracita', colorDot: 'bg-stone-900' },
                    { value: 'gold', label: 'Dorado', colorDot: 'bg-[#d4af37]' },
                    { value: 'white', label: 'Blanco', colorDot: 'bg-white border border-stone-300' }
                  ].map(c => {
                    const isSel = (editFormData.text_color || 'stone-900') === c.value;
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => set('text_color', c.value)}
                        className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-center gap-1.5 ${
                          isSel
                            ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${c.colorDot}`} />
                        <span>{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={labelClass}>Estilo de Mayúsculas</label>
                <div className="grid grid-cols-3 gap-1 select-none">
                  {[
                    { value: 'none', label: 'Normal' },
                    { value: 'uppercase', label: 'MAYÚSC.' },
                    { value: 'italic', label: 'Cursiva' }
                  ].map(t => {
                    const isSel = (editFormData.text_transform || 'none') === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => set('text_transform', t.value)}
                        className={`py-2 rounded-xl text-[10px] font-bold border transition-all text-center ${
                          isSel
                            ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <input 
                type="checkbox" 
                id="show_divider" 
                checked={editFormData.show_divider !== false} 
                onChange={e => set('show_divider', e.target.checked)} 
                className="w-4 h-4 accent-[#d4af37] rounded cursor-pointer" 
              />
              <label htmlFor="show_divider" className="text-xs font-semibold text-stone-600 cursor-pointer select-none">
                Mostrar acento de línea divisoria dorada
              </label>
            </div>
          </>)}

          {/* ── TEXTO ENRIQUECIDO ── */}
          {blockType === 'atomic_text' && (<>
            <div>
              <label className={labelClass}>Contenido del Párrafo (Editor Enriquecido)</label>
              <RichTextEditor
                value={editFormData.html || ''}
                onChange={val => set('html', val)}
                blockId={editingBlock.id}
              />
            </div>
            <div>
              <label className={labelClass}>Alineación del Texto</label>
              <div className="grid grid-cols-4 gap-2 select-none">
                {[
                  { value: 'left', icon: AlignLeft, label: 'Izquierda' },
                  { value: 'center', icon: AlignCenter, label: 'Centro' },
                  { value: 'right', icon: AlignRight, label: 'Derecha' },
                  { value: 'justify', icon: AlignJustify, label: 'Justificado' }
                ].map(opt => {
                  const Icon = opt.icon;
                  const isSel = (editFormData.alignment || 'left') === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set('alignment', opt.value)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        isSel
                          ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <Icon size={13} className={isSel ? 'text-[#d4af37]' : 'text-stone-400'} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>)}

          {/* ── IMAGEN / VÍDEO EDITORIAL ── */}
          {blockType === 'atomic_image' && (<>
            <MediaSelectorField
              value={editFormData.image_url || ''}
              onChange={val => set('image_url', val)}
              onOpenGallery={() => openGalleryFor('image_url', 'all')}
              label="Archivo Multimedia"
              aspectRatio="aspect-video"
            />

            <div>
              <label className={labelClass}>Pie de foto (caption)</label>
              <input 
                className={inputClass} 
                value={editFormData.caption || ''} 
                onChange={e => set('caption', e.target.value)} 
                placeholder="Descripción o nota al pie..." 
              />
            </div>

            <div>
              <label className={labelClass}>Alineación</label>
              <div className="grid grid-cols-4 gap-2 select-none">
                {[
                  { value: 'left', label: 'Izquierda' },
                  { value: 'center', label: 'Centro' },
                  { value: 'right', label: 'Derecha' },
                  { value: 'full_width', label: 'Ancho Total' }
                ].map(opt => {
                  const isSel = (editFormData.alignment || 'center') === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set('alignment', opt.value)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                        isSel
                          ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={labelClass}>Altura de Imagen / Vídeo</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 select-none">
                {[
                  { value: 'auto', label: 'Auto' },
                  { value: 'small', label: '250px' },
                  { value: 'medium', label: '400px' },
                  { value: 'large', label: '550px' },
                  { value: 'screen', label: '750px' }
                ].map(h => {
                  const isSel = (editFormData.height_preset || 'auto') === h.value;
                  return (
                    <button
                      key={h.value}
                      type="button"
                      onClick={() => set('height_preset', h.value)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        isSel
                          ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {h.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {editFormData.alignment !== 'full_width' && (
              <div>
                <label className={labelClass}>Ancho Máximo</label>
                <div className="grid grid-cols-4 gap-2 select-none">
                  {['25%', '50%', '75%', '100%'].map(w => {
                    const isSel = editFormData.max_width === w || (!editFormData.max_width && w === '100%');
                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() => set('max_width', w)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          isSel
                            ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {w}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className={labelClass}>Encuadre de Imagen (Object Fit)</label>
              <div className="grid grid-cols-2 gap-2 select-none">
                {[
                  { value: 'cover', label: 'Recortar y Llenar (Cover)' },
                  { value: 'contain', label: 'Ajustar Completa (Contain)' }
                ].map(fit => {
                  const isSel = (editFormData.object_fit || 'cover') === fit.value;
                  return (
                    <button
                      key={fit.value}
                      type="button"
                      onClick={() => set('object_fit', fit.value)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                        isSel
                          ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {fit.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </>)}

          {/* ── IMAGEN + TEXTO (TEXT IMAGE CTA) ── */}
          {blockType === 'text_image_cta' && (<>
            <MediaSelectorField
              value={editFormData.image_url || ''}
              onChange={val => set('image_url', val)}
              onOpenGallery={() => openGalleryFor('image_url', 'all')}
              label="Fotografía o Vídeo Editorial"
              aspectRatio="aspect-video"
            />

            {/* Disposición del Bloque (Layout en 4 direcciones) */}
            <div>
              <label className={labelClass}>Disposición del Bloque</label>
              <div className="grid grid-cols-2 gap-2 select-none">
                {[
                  { value: 'image_left', label: 'Imagen a la Izquierda', sub: 'Texto a la derecha' },
                  { value: 'image_right', label: 'Imagen a la Derecha', sub: 'Texto a la izquierda' },
                  { value: 'image_top', label: 'Imagen Arriba', sub: 'Texto debajo centrado' },
                  { value: 'image_bottom', label: 'Texto Arriba', sub: 'Imagen debajo centrada' }
                ].map(opt => {
                  const currentLayout = editFormData.layout || (editFormData.alignment === 'right' ? 'image_right' : editFormData.alignment === 'center' ? 'image_top' : 'image_left');
                  const isSel = currentLayout === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        set('layout', opt.value);
                        set('alignment', opt.value === 'image_right' ? 'right' : opt.value === 'image_top' ? 'center' : 'left');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSel
                          ? 'bg-stone-900 border-stone-900 text-white shadow-xs ring-1 ring-stone-900'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold leading-tight">{opt.label}</span>
                        {isSel && <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />}
                      </div>
                      <span className={`block text-[10px] mt-0.5 ${isSel ? 'text-stone-300' : 'text-stone-400'}`}>
                        {opt.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contenido Editorial */}
            <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#d4af37] block">
                Contenido Editorial y Botón
              </span>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1">Título</label>
                <input 
                  className={`${inputClass} font-serif font-bold text-base`} 
                  value={editFormData.heading || ''} 
                  onChange={e => set('heading', e.target.value)} 
                  placeholder="Ej: Armonía y Excelencia" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1">Texto Descriptivo</label>
                <textarea 
                  className={`${inputClass} min-h-[70px] resize-none`} 
                  rows={3} 
                  value={editFormData.subheading || ''} 
                  onChange={e => set('subheading', e.target.value)} 
                  placeholder="Un espacio donde el bienestar y la sofisticación se encuentran..." 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">Texto del Botón CTA</label>
                  <input 
                    className={inputClass} 
                    value={editFormData.cta_text || ''} 
                    onChange={e => set('cta_text', e.target.value)} 
                    placeholder="Descubrir más" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">Enlace del Botón CTA</label>
                  <input 
                    className={inputClass} 
                    value={editFormData.cta_url || ''} 
                    onChange={e => set('cta_url', e.target.value)} 
                    placeholder="/tratamientos" 
                  />
                </div>
              </div>
            </div>

            {/* Altura y Encuadre */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Altura de Fotografía</label>
                <div className="grid grid-cols-3 gap-1 select-none">
                  {[
                    { value: 'small', label: '250px' },
                    { value: 'medium', label: '400px' },
                    { value: 'large', label: '550px' }
                  ].map(h => {
                    const isSel = (editFormData.height_preset || 'medium') === h.value;
                    return (
                      <button
                        key={h.value}
                        type="button"
                        onClick={() => set('height_preset', h.value)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          isSel
                            ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {h.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={labelClass}>Encuadre (Object Fit)</label>
                <div className="grid grid-cols-2 gap-1 select-none">
                  {[
                    { value: 'cover', label: 'Recortar (Cover)' },
                    { value: 'contain', label: 'Ajustar' }
                  ].map(fit => {
                    const isSel = (editFormData.object_fit || 'cover') === fit.value;
                    return (
                      <button
                        key={fit.value}
                        type="button"
                        onClick={() => set('object_fit', fit.value)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          isSel
                            ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {fit.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>)}

          {/* ── BOTÓN ── */}
          {blockType === 'atomic_button' && (<>
            <div>
              <label className={labelClass}>Texto del botón</label>
              <input className={inputClass} value={editFormData.text || ''} onChange={e => set('text', e.target.value)} placeholder="Reservar cita..." />
            </div>
            <div>
              <label className={labelClass}>URL de destino</label>
              <input className={inputClass} value={editFormData.url || ''} onChange={e => set('url', e.target.value)} placeholder="/reservar" />
            </div>
            <div>
              <label className={labelClass}>Estilo del botón</label>
              <div className="grid grid-cols-3 gap-2 select-none">
                {[
                  { value: 'gold_solid', label: 'Dorado Sólido' },
                  { value: 'gold_outline', label: 'Dorado Outline' },
                  { value: 'dark_solid', label: 'Antracita' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set('style', opt.value)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                      (editFormData.style || 'gold_solid') === opt.value
                        ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Alineación</label>
              <div className="grid grid-cols-3 gap-2 select-none">
                {[
                  { value: 'left', label: 'Izquierda' },
                  { value: 'center', label: 'Centro' },
                  { value: 'right', label: 'Derecha' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set('alignment', opt.value)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-center ${
                      (editFormData.alignment || 'center') === opt.value
                        ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </>)}

          {/* ── CATEGORÍA / BENTO (QUIET LUXURY 2026) ── */}
          {blockType === 'atomic_category' && (<>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass}>Colección / Categoría de Tratamientos</label>
                <span className="text-[10px] text-stone-400 font-sans">
                  {dbCategories.length} disponibles
                </span>
              </div>
              
              {/* Selector Visual de Categorías en Tarjetas de Lujo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto p-1 pr-1.5 [scrollbar-width:thin]">
                {dbCategories.map(cat => {
                  const isSelected = editFormData.category_id === cat.id;
                  const serviceCount = dbServices?.filter(s => s.category_id === cat.id && s.is_active !== false)?.length ?? 0;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => set('category_id', cat.id)}
                      className={`group relative text-left p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                        isSelected
                          ? 'border-[#d4af37] bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 shadow-[0_4px_16px_-4px_rgba(212,175,55,0.25)] ring-1 ring-[#d4af37]'
                          : 'border-stone-200/80 bg-white hover:border-[#d4af37]/40 hover:bg-stone-50/70 shadow-2xs'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <span className={`block font-serif text-sm font-bold tracking-tight truncate ${isSelected ? 'text-stone-950 font-black' : 'text-stone-800 group-hover:text-stone-950'}`}>
                          {cat.name}
                        </span>
                        <span className={`block text-[11px] font-sans mt-0.5 ${isSelected ? 'text-[#b38f2b] font-medium' : 'text-stone-400 group-hover:text-stone-500'}`}>
                          {serviceCount} {serviceCount === 1 ? 'tratamiento' : 'tratamientos'}
                        </span>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'bg-[#d4af37] text-white shadow-xs'
                            : 'border border-stone-200 text-transparent group-hover:border-stone-300'
                        }`}
                      >
                        <Check size={12} strokeWidth={3} />
                      </div>
                    </button>
                  );
                })}
              </div>
              {dbCategories.length === 0 && (
                <div className="p-4 rounded-2xl border border-dashed border-stone-200 text-center">
                  <p className="text-xs text-stone-500 font-sans">
                    No se encontraron categorías activas. Crea categorías en la sección de Servicios para vincularlas aquí.
                  </p>
                </div>
              )}
            </div>

            {editFormData.category_id && (<>
              <div>
                <label className={labelClass}>Diseño / Disposición Visual</label>
                <div className="grid grid-cols-2 gap-2.5 select-none">
                  {[
                    { value: 'traditional_grid', label: 'Cuadrícula (Grid)', desc: 'Columnas limpias y ordenadas' },
                    { value: 'bento_grid', label: 'Bento Asimétrico 2026', desc: 'Layout dinámico Quiet Luxury' },
                    { value: 'cards_slider', label: 'Carrusel de Tarjetas', desc: 'Desplazamiento interactivo' },
                    { value: 'minimalist_list', label: 'Lista Elegante', desc: 'Tipografía y precios discretos' }
                  ].map(layout => {
                    const isSelected = (editFormData.layout || 'traditional_grid') === layout.value;
                    return (
                      <button
                        key={layout.value}
                        type="button"
                        onClick={() => set('layout', layout.value)}
                        className={`p-3 rounded-2xl text-left transition-all duration-200 border ${
                          isSelected
                            ? 'bg-stone-950 border-stone-950 text-white shadow-md'
                            : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{layout.label}</span>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />}
                        </div>
                        <span className={`block text-[10px] mt-0.5 ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                          {layout.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className={labelClass}>Tratamientos a mostrar (opcional)</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto border border-stone-150 rounded-2xl p-3 bg-stone-50/50 [scrollbar-width:thin]">
                  {dbServices.filter(s => s.category_id === editFormData.category_id && s.is_active).map(svc => (
                    <label key={svc.id} className="flex items-center gap-2.5 cursor-pointer group py-1 px-1.5 rounded-lg hover:bg-stone-100/70 transition-colors">
                      <input
                        type="checkbox"
                        checked={(editFormData.selected_treatment_ids || []).includes(svc.id)}
                        onChange={e => {
                          const current = editFormData.selected_treatment_ids || [];
                          set('selected_treatment_ids', e.target.checked ? [...current, svc.id] : current.filter((id: string) => id !== svc.id));
                        }}
                        className="w-4 h-4 accent-[#d4af37] rounded"
                      />
                      <span className="text-sm text-stone-700 group-hover:text-stone-900 transition-colors font-medium">{svc.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[10px] text-stone-400 mt-1">Si no seleccionas ninguno, se mostrarán todos los activos de la categoría.</p>
              </div>
              <div>
                <label className={labelClass}>Máximo de tratamientos visibles</label>
                <div className="flex gap-2 select-none">
                  {[2, 3, 4, 6, 8].map(n => {
                    const isSelected = (editFormData.max_items || 4) === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => set('max_items', n)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          isSelected
                            ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className={labelClass}>Texto del enlace de acción (ej: "Ver Tratamiento", "Reservar")</label>
                <input
                  className={inputClass}
                  value={editFormData.link_text || ''}
                  onChange={e => set('link_text', e.target.value)}
                  placeholder="Por defecto: Ver tratamiento"
                />
              </div>
            </>)}
          </>)}

        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-stone-100 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-stone-200 text-stone-500 hover:bg-stone-50 text-sm font-bold transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 py-3 rounded-2xl bg-stone-900 hover:bg-[#d4af37] text-white text-sm font-black uppercase tracking-wider transition-all duration-300 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
