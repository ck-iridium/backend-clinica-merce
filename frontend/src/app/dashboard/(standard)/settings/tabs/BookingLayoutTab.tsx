"use client"
import { LayoutTemplate, Grip, List as ListIcon, Smartphone } from 'lucide-react';

interface BookingLayoutTabProps {
  settings: any;
  setSettings: (s: any) => void;
}

export default function BookingLayoutTab({ settings, setSettings }: BookingLayoutTabProps) {
  const currentLayout = settings?.booking_layout || 'grid';

  const handleLayoutChange = (layout: string) => {
    setSettings({ ...settings, booking_layout: layout });
  };

  return (
    <div className="space-y-4 md:space-y-8 animate-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-100 p-5 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-stone-100">
          <span className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
            <LayoutTemplate size={18} strokeWidth={1.5} />
          </span>
          <h3 className="text-2xl font-serif font-semibold text-stone-800">Diseño de Reservas</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Opciones de Diseño */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-serif font-bold text-stone-800">Layout Principal</h4>
              <p className="text-sm text-stone-500 mt-1">Elige cómo se muestran tus tratamientos en el primer paso de la reserva en móvil.</p>
            </div>

            <div className="flex flex-col gap-4">
              {/* Opción Grid */}
              <button
                onClick={() => handleLayoutChange('grid')}
                className={`text-left w-full relative overflow-hidden transition-all duration-300 p-5 rounded-[2rem] border-2 group
                  ${currentLayout === 'grid' 
                    ? 'border-[#d4af37] bg-stone-50 shadow-md' 
                    : 'border-stone-100 bg-white hover:border-stone-300 hover:bg-stone-50'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl ${currentLayout === 'grid' ? 'bg-[#d4af37]/10 text-[#d4af37]' : 'bg-stone-100 text-stone-400 group-hover:bg-stone-200'}`}>
                    <Grip size={24} />
                  </div>
                  <div>
                    <h5 className={`font-bold text-lg ${currentLayout === 'grid' ? 'text-stone-900' : 'text-stone-700'}`}>Boutique Grid (2 Columnas)</h5>
                    <p className="text-sm text-stone-500 mt-1">Diseño tipo catálogo de lujo. Ideal para clínicas con tratamientos muy visuales o un menú selecto.</p>
                  </div>
                </div>
              </button>

              {/* Opción List */}
              <button
                onClick={() => handleLayoutChange('list')}
                className={`text-left w-full relative overflow-hidden transition-all duration-300 p-5 rounded-[2rem] border-2 group
                  ${currentLayout === 'list' 
                    ? 'border-[#d4af37] bg-stone-50 shadow-md' 
                    : 'border-stone-100 bg-white hover:border-stone-300 hover:bg-stone-50'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl ${currentLayout === 'list' ? 'bg-[#d4af37]/10 text-[#d4af37]' : 'bg-stone-100 text-stone-400 group-hover:bg-stone-200'}`}>
                    <ListIcon size={24} />
                  </div>
                  <div>
                    <h5 className={`font-bold text-lg ${currentLayout === 'list' ? 'text-stone-900' : 'text-stone-700'}`}>Lista Elegante (Filas)</h5>
                    <p className="text-sm text-stone-500 mt-1">Vista limpia y ultra-clara. La mejor opción si tienes un catálogo extenso con muchos tratamientos.</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Placeholder Vista Previa Móvil */}
          <div className="bg-[#F7F7F5] rounded-[2.5rem] border border-stone-200 p-8 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <span className="bg-stone-900 text-[#d4af37] text-[10px] uppercase font-black px-3 py-1 rounded-full tracking-widest shadow-sm">
                Vista Previa
              </span>
            </div>
            
            <div className="w-[220px] h-[450px] border-[6px] border-stone-200 rounded-[2.5rem] bg-white shadow-xl relative flex flex-col items-center justify-center opacity-80">
              <div className="w-20 h-1 bg-stone-200 rounded-full absolute top-3"></div>
              <Smartphone size={48} className="text-stone-300 mb-4" />
              <p className="text-stone-400 text-sm font-medium text-center px-6 leading-tight">
                Simulador de Móvil<br/>en construcción
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
