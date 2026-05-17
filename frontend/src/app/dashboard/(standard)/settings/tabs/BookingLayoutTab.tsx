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
          <div className="bg-[#F7F7F5] rounded-[2.5rem] border border-stone-200 p-8 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 z-20">
              <span className="bg-stone-900 text-[#d4af37] text-[10px] uppercase font-black px-3 py-1 rounded-full tracking-widest shadow-sm">
                Vista Previa
              </span>
            </div>
            
            <div className="w-[250px] h-[480px] border-[8px] border-stone-900 rounded-[2.5rem] bg-white shadow-2xl relative flex flex-col overflow-hidden">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-stone-900 rounded-b-2xl z-30 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-stone-850"></div>
              </div>
              
              {/* Mini Status Bar */}
              <div className="h-6 bg-white shrink-0 pt-1 px-4 flex justify-between items-center text-[8px] font-bold text-stone-400 select-none z-20">
                <span>09:41</span>
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <div className="w-3.5 h-2 border border-stone-300 rounded-sm p-0.5 flex items-center">
                    <div className="w-full h-full bg-stone-400 rounded-[1px]"></div>
                  </div>
                </div>
              </div>

              {/* Mini App Content (Scrollable) */}
              <div className="flex-grow overflow-y-auto custom-scrollbar p-3 pt-2 bg-[#F7F7F5] select-none text-left">
                {/* Mini Title */}
                <div className="mb-3">
                  <h5 className="text-[11px] font-serif font-bold text-stone-800 tracking-wide">Tratamientos</h5>
                  <p className="text-[7px] text-[#d4af37] font-bold uppercase tracking-widest mt-0.5">Clínica Mercè</p>
                </div>

                {currentLayout === 'grid' ? (
                  /* Boutique Grid (2 Columnas) Mockup */
                  <div className="grid grid-cols-2 gap-2 animate-in fade-in duration-300">
                    {[
                      { name: 'Lifting de Pestañas', price: '45€', duration: '45 min' },
                      { name: 'Higiene Facial', price: '60€', duration: '60 min' },
                      { name: 'Microblading', price: '120€', duration: '90 min' },
                      { name: 'Láser Diodo', price: '80€', duration: '30 min' },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white rounded-xl border border-stone-100/60 p-2 flex flex-col justify-between shadow-[0_2px_6px_rgba(0,0,0,0.02)]">
                        <div>
                          {/* Luxury image placeholder */}
                          <div className="w-full h-12 rounded-lg bg-gradient-to-tr from-[#d4af37]/5 to-[#d4af37]/20 flex items-center justify-center mb-1.5">
                            <span className="text-[9px] text-[#d4af37] font-serif font-bold">M</span>
                          </div>
                          <h6 className="text-[8px] font-bold text-stone-850 leading-tight line-clamp-2">{item.name}</h6>
                        </div>
                        <div className="mt-2 flex items-baseline justify-between border-t border-stone-50 pt-1">
                          <span className="text-[6px] text-stone-400">{item.duration}</span>
                          <span className="text-[8px] font-bold text-[#d4af37]">{item.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Lista Elegante (Filas) Mockup */
                  <div className="space-y-1.5 animate-in fade-in duration-300">
                    {[
                      { name: 'Lifting de Pestañas', price: '45€', duration: '45 min' },
                      { name: 'Higiene Facial Premium', price: '60€', duration: '60 min' },
                      { name: 'Microblading Cejas', price: '120€', duration: '90 min' },
                      { name: 'Depilación Láser Diodo', price: '80€', duration: '30 min' },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white rounded-xl border border-stone-100/60 p-2 flex items-center justify-between shadow-[0_2px_4px_rgba(0,0,0,0.01)] gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-grow">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#d4af37]/5 to-[#d4af37]/20 flex items-center justify-center shrink-0">
                            <span className="text-[8px] text-[#d4af37] font-serif font-bold">M</span>
                          </div>
                          <h6 className="text-[8px] font-bold text-stone-850 leading-tight break-words">{item.name}</h6>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 pl-1">
                          <div className="flex flex-col items-end text-right">
                            <span className="text-[8px] font-bold text-[#d4af37]">{item.price}</span>
                            <span className="text-[5px] text-stone-400 mt-0.5">{item.duration}</span>
                          </div>
                          <span className="text-stone-300 text-[8px] font-black">›</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer simulation */}
                <div className="mt-4 pt-2 border-t border-stone-200/40 flex items-center justify-between text-[6px] text-stone-400">
                  <span>Paso 1 de 3</span>
                  <div className="w-12 h-3.5 bg-stone-900 rounded-md flex items-center justify-center text-[5px] text-[#d4af37] font-bold uppercase tracking-wider">
                    Siguiente
                  </div>
                </div>
              </div>

              {/* Bottom Home Indicator */}
              <div className="h-4 bg-[#F7F7F5] shrink-0 pb-1.5 flex items-center justify-center select-none z-20">
                <div className="w-20 h-1 bg-stone-300 rounded-full"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
