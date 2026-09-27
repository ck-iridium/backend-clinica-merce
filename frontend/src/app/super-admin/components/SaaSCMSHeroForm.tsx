"use client"

import { ChevronRight, Image as ImageIcon, Trash2, Loader2, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SaaSCMSHeroFormProps {
  heroTitle: string
  heroSubtitle: string
  heroImage1: string | null
  heroImage2: string | null
  heroImage3: string | null
  onChangeTitle: (val: string) => void
  onChangeSubtitle: (val: string) => void
  onSelectImage: (index: 1 | 2 | 3) => void
  onClearImage: (index: 1 | 2 | 3) => void
  onSubmit: (e: React.FormEvent) => void
  saving: boolean
}

export default function SaaSCMSHeroForm({
  heroTitle,
  heroSubtitle,
  heroImage1,
  heroImage2,
  heroImage3,
  onChangeTitle,
  onChangeSubtitle,
  onSelectImage,
  onClearImage,
  onSubmit,
  saving
}: SaaSCMSHeroFormProps) {
  
  const renderImageSlot = (index: 1 | 2 | 3, heroImage: string | null) => {
    return (
      <div key={index} className="bg-white/90 border border-stone-200/80 rounded-xl p-3 flex items-center justify-between gap-3 transition-all hover:border-stone-300 shadow-xs">
        <div className="flex items-center gap-3">
          {heroImage ? (
            <img 
              src={heroImage} 
              alt={`Imagen de Portada ${index}`} 
              className="w-11 h-11 rounded-lg object-cover border border-stone-200/60 shadow-xs" 
            />
          ) : (
            <div className="w-11 h-11 rounded-lg bg-stone-50 border border-stone-200 border-dashed flex items-center justify-center text-stone-400">
              <ImageIcon className="w-4 h-4 text-stone-300" />
            </div>
          )}
          <div>
            <span className="text-xs font-bold text-stone-800 block">Imagen Rotativa {index}</span>
            <span className="text-[10px] text-stone-400 block">
              {heroImage ? 'Asignada de galería' : 'Sin imagen seleccionada'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSelectImage(index)}
            className="h-8 text-xs px-2.5"
          >
            {heroImage ? 'Cambiar' : 'Elegir'}
          </Button>
          {heroImage && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onClearImage(index)}
              className="h-8 w-8 p-0 text-stone-400 hover:text-rose-600 hover:bg-rose-50"
              title="Eliminar imagen"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5 ml-1">
          Título Principal (Hero Title)
        </label>
        <Input
          type="text"
          required
          value={heroTitle}
          onChange={(e) => onChangeTitle(e.target.value)}
          className="h-11 font-serif text-sm font-semibold"
          placeholder="Ej. La elegancia de tu negocio..."
        />
      </div>

      <div>
        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5 ml-1">
          Subtítulo Descriptivo (Hero Subtitle)
        </label>
        <textarea
          required
          rows={3}
          value={heroSubtitle}
          onChange={(e) => onChangeSubtitle(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-white/90 rounded-xl border border-stone-200 text-xs text-stone-600 leading-relaxed shadow-sm transition-all focus-visible:outline-none focus-visible:border-[#D4AF37] focus-visible:ring-2 focus-visible:ring-[#D4AF37]/25"
          placeholder="Describe los puntos fuertes del software..."
        />
      </div>

      <div className="space-y-2.5 pt-1">
        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider ml-1">
          Imágenes Rotativas de Portada (Hasta 3)
        </label>
        
        {renderImageSlot(1, heroImage1)}
        {renderImageSlot(2, heroImage2)}
        {renderImageSlot(3, heroImage3)}
      </div>

      <div className="pt-3">
        <Button
          type="submit"
          variant="luxury"
          size="lg"
          disabled={saving}
          className="w-full text-xs font-semibold gap-1.5"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Guardando y publicando...</span>
            </>
          ) : (
            <>
              <span>Guardar y Publicar en Portada</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
