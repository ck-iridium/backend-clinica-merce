import { Sparkles, Bold, Italic, List, ListOrdered, Heading2 } from 'lucide-react';
import { Editor, EditorContent } from '@tiptap/react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface ContentTabProps {
  editor: Editor | null;
  setShowAIModal: (type: 'short_description' | 'rich_content') => void;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;
  return (
    <div className="flex flex-wrap gap-1 p-2 bg-stone-50 border border-stone-200 border-b-0 rounded-t-xl">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded hover:bg-stone-200 ${editor.isActive('bold') ? 'bg-stone-200 text-stone-900' : 'text-stone-600'}`}>
        <Bold size={16} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded hover:bg-stone-200 ${editor.isActive('italic') ? 'bg-stone-200 text-stone-900' : 'text-stone-600'}`}>
        <Italic size={16} />
      </button>
      <div className="w-px h-6 bg-stone-300 mx-1 my-auto" />
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-1.5 rounded hover:bg-stone-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-stone-200 text-stone-900' : 'text-stone-600'}`}>
        <Heading2 size={16} />
      </button>
      <div className="w-px h-6 bg-stone-300 mx-1 my-auto" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded hover:bg-stone-200 ${editor.isActive('bulletList') ? 'bg-stone-200 text-stone-900' : 'text-stone-600'}`}>
        <List size={16} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded hover:bg-stone-200 ${editor.isActive('orderedList') ? 'bg-stone-200 text-stone-900' : 'text-stone-600'}`}>
        <ListOrdered size={16} />
      </button>
    </div>
  );
};

export default function ContentTab({ editor, setShowAIModal }: ContentTabProps) {
  const { t } = useLanguage();
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest">{t('dashboard.services.rich_content_title')}</label>
          <button 
            type="button" 
            onClick={() => setShowAIModal('rich_content')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#d4af37] hover:bg-yellow-50/50 px-2.5 py-1 rounded-lg border border-yellow-100 transition-colors shadow-sm"
          >
            <Sparkles size={12} strokeWidth={2} />
            {t('dashboard.services.generate_ia')}
          </button>
        </div>
        <div className="flex flex-col shadow-sm rounded-xl">
          <MenuBar editor={editor} />
          <EditorContent editor={editor} />
        </div>
        <p className="text-[10px] text-stone-400 mt-2">{t('dashboard.services.rich_content_help')}</p>
      </div>
    </div>
  );
}
