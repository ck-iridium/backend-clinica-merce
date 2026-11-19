import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link2, Check, X } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  blockId: string;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  blockId,
  placeholder = "Escribe aquí el contenido de tu párrafo...",
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  // Si el valor recibido es el texto dummy anterior de prueba, tratarlo como vacío para activar el placeholder limpio
  const cleanInitialValue =
    value === '<p>Escribe aquí tu párrafo...</p>' ||
    value === '<p>Escribe aquí tu párrafo con información detallada...</p>'
      ? ''
      : value;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer hover:text-amber-700 transition-colors',
        },
      }),
    ],
    content: cleanInitialValue || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  }, [blockId]);

  useEffect(() => {
    if (editor) {
      const current = editor.getHTML();
      const nextVal = cleanInitialValue || '';
      if (nextVal !== current && (nextVal !== '' || current !== '<p></p>')) {
        editor.commands.setContent(nextVal);
      }
    }
  }, [cleanInitialValue, editor]);

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

  const isEmpty = editor.isEmpty || editor.getHTML() === '<p></p>' || editor.getHTML().trim() === '';

  return (
    <div className="flex flex-col rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
      {/* Barra de herramientas */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-stone-50/80 border-b border-stone-200 select-none">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-xl transition-all ${
            editor.isActive('bold')
              ? 'bg-stone-900 text-white font-bold shadow-xs'
              : 'text-stone-500 hover:bg-stone-200/60 hover:text-stone-800'
          }`}
          title="Negrita"
        >
          <Bold size={14} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-xl transition-all ${
            editor.isActive('italic')
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-500 hover:bg-stone-200/60 hover:text-stone-800'
          }`}
          title="Cursiva"
        >
          <Italic size={14} strokeWidth={2.5} />
        </button>
        <div className="w-px h-5 bg-stone-200 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-xl transition-all ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-stone-900 text-white font-bold shadow-xs'
              : 'text-stone-500 hover:bg-stone-200/60 hover:text-stone-800'
          }`}
          title="Título 2"
        >
          <Heading2 size={14} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded-xl transition-all ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-stone-900 text-white font-bold shadow-xs'
              : 'text-stone-500 hover:bg-stone-200/60 hover:text-stone-800'
          }`}
          title="Título 3"
        >
          <Heading3 size={14} strokeWidth={2.5} />
        </button>
        <div className="w-px h-5 bg-stone-200 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-xl transition-all ${
            editor.isActive('bulletList')
              ? 'bg-stone-900 text-white font-bold shadow-xs'
              : 'text-stone-500 hover:bg-stone-200/60 hover:text-stone-800'
          }`}
          title="Lista Viñetas"
        >
          <List size={14} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-xl transition-all ${
            editor.isActive('orderedList')
              ? 'bg-stone-900 text-white font-bold shadow-xs'
              : 'text-stone-500 hover:bg-stone-200/60 hover:text-stone-800'
          }`}
          title="Lista Numerada"
        >
          <ListOrdered size={14} strokeWidth={2.5} />
        </button>
        <div className="w-px h-5 bg-stone-200 mx-1" />
        <button
          type="button"
          onClick={handleLinkToggle}
          className={`p-2 rounded-xl transition-all ${
            editor.isActive('link')
              ? 'bg-stone-900 text-primary font-bold shadow-xs'
              : 'text-stone-500 hover:bg-stone-200/60 hover:text-stone-800'
          }`}
          title="Agregar/Quitar Enlace"
        >
          <Link2 size={14} strokeWidth={2.5} />
        </button>

        {/* Input de link flotante */}
        {showLinkInput && (
          <div className="flex items-center gap-1.5 ml-auto bg-stone-100 border border-stone-250 rounded-xl px-2 py-1 animate-in fade-in slide-in-from-right-3 duration-200">
            <input
              type="text"
              placeholder="https://..."
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              className="bg-white px-2 py-1 text-xs text-stone-800 outline-none rounded-lg border border-stone-200 w-44 focus:border-primary"
              onKeyDown={e => {
                if (e.key === 'Enter') saveLink();
                if (e.key === 'Escape') setShowLinkInput(false);
              }}
              autoFocus
            />
            <button
              type="button"
              onClick={saveLink}
              className="p-1 rounded-md bg-stone-900 hover:bg-primary text-white transition-all"
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

      {/* Contenedor del área de edición con foco en toda la superficie */}
      <div
        onClick={() => editor.chain().focus().run()}
        className="relative p-4 bg-white min-h-[190px] cursor-text"
      >
        {isEmpty && (
          <div className="absolute top-4 left-4 text-stone-400 font-sans pointer-events-none select-none text-sm">
            {placeholder}
          </div>
        )}
        <EditorContent
          editor={editor}
          className="outline-none focus:outline-none min-h-[160px] prose prose-stone max-w-none text-stone-700 font-sans text-sm leading-relaxed
            [&_.ProseMirror]:outline-none [&_.ProseMirror]:border-none [&_.ProseMirror]:min-h-[160px] [&_.ProseMirror-focused]:outline-none"
        />
      </div>
    </div>
  );
}
