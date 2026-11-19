import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link2, Check, X } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  blockId: string;
}

export function RichTextEditor({ value, onChange, blockId }: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

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

  useEffect(() => {
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

        {/* Input de link flotante */}
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

      {/* Contenido */}
      <div className="p-4 bg-stone-50/20">
        <EditorContent editor={editor} className="focus:outline-none min-h-[180px] prose prose-stone text-stone-700 font-sans" />
      </div>
    </div>
  );
}
