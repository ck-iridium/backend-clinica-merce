"use client"
import React from 'react';
import { ChevronLeft, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Step1Treatments({
  categories,
  services,
  activeCategory,
  setActiveCategory,
  bookingLayout = 'grid',
  onSelectService
}: {
  categories: any[];
  services: any[];
  activeCategory: any;
  setActiveCategory: (cat: any) => void;
  bookingLayout?: string;
  onSelectService: (srv: any) => void;
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.8, filter: 'blur(4px)', transition: { duration: 0.3 } }
  };

  return (
    <div className="w-full flex flex-col flex-grow min-h-0 relative bg-[#F7F7F5]">
      <AnimatePresence mode="wait">
        {!activeCategory ? (
          <motion.div 
            key="category-list"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
            className="flex flex-col flex-grow min-h-0"
          >
            {/* Header Compacto */}
            <div className="shrink-0 px-6 pt-3 pb-2 z-30 bg-[#F7F7F5]">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-stone-800 tracking-tight">¿Qué zona deseas tratar?</h1>
              <p className="text-[11px] md:text-xs lg:text-sm text-stone-500 mt-1 uppercase tracking-[0.15em] font-medium">
                Selecciona una categoría para ver servicios
              </p>
            </div>

            <div className="flex flex-col flex-grow min-h-0 relative">
              {/* Degradado superior de inmersión */}
              <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-[#F7F7F5] to-transparent z-20 pointer-events-none" />
              
              <div className="flex-grow overflow-y-auto custom-scrollbar px-6 pt-6 pb-6 space-y-3">
                {categories.map(cat => (
                  <motion.button
                    key={cat.id}
                    variants={itemVariants}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveCategory(cat)}
                    className="relative w-full h-28 md:h-36 rounded-2xl overflow-hidden group shadow-sm border border-stone-200/50 shrink-0"
                  >
                    {cat.image_url ? (
                      <img 
                        src={cat.image_url} 
                        alt={cat.name} 
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="absolute inset-0 bg-stone-800" />
                    )}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                    
                    <div className="relative z-10 h-full flex items-center justify-center">
                      <h2 className="text-white font-serif text-xl md:text-3xl tracking-wide group-hover:scale-105 transition-transform duration-500">
                        {cat.name}
                      </h2>
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 group-hover:text-[#d4af37] transition-colors">
                      <ChevronRight size={22} className="md:w-7 md:h-7" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="treatment-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col flex-grow min-h-0 relative"
          >
            {/* Header de Categoría Seleccionada (SÓLIDO Y FLOTANTE) */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute top-0 left-0 right-0 z-20 px-4 pt-3"
            >
              <div className="bg-white rounded-2xl overflow-hidden border border-stone-200/60 shadow-lg relative h-20 md:h-24 flex items-center px-4 md:px-6">
                {activeCategory.image_url && (
                  <img 
                    src={activeCategory.image_url} 
                    className="absolute inset-0 w-full h-full object-cover opacity-80" 
                    style={{ 
                      maskImage: 'linear-gradient(to right, transparent 50%, black 95%)', 
                      WebkitMaskImage: 'linear-gradient(to right, transparent 50%, black 95%)' 
                    }}
                    alt=""
                  />
                )}
                
                <div className="relative z-10 flex items-center gap-4 w-full">
                  <button 
                    onClick={() => setActiveCategory(null)}
                    className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-stone-100 rounded-full transition-colors"
                  >
                    <ChevronLeft size={20} className="text-stone-600 md:scale-125" />
                  </button>
                  <div className="flex flex-col">
                    <h2 className="text-lg md:text-2xl font-serif text-stone-800 leading-tight">{activeCategory.name}</h2>
                    <p className="text-[10px] md:text-xs uppercase tracking-widest text-[#d4af37] font-bold mt-0.5">Selecciona tratamiento</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Grid or Elegant List of Treatments */}
            {bookingLayout === 'grid' ? (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex-grow overflow-y-auto pt-32 md:pt-36 pb-10 px-4 custom-scrollbar grid grid-cols-2 gap-4 content-start auto-rows-max"
              >
                {services.filter(s => String(s.category_id) === String(activeCategory.id)).length === 0 ? (
                  <div className="col-span-2 py-10 text-center text-stone-400 text-sm font-medium">
                    No hay servicios disponibles.
                  </div>
                ) : (
                  services
                    .filter(s => String(s.category_id) === String(activeCategory.id))
                    .map(srv => (
                      <motion.button
                        key={srv.id}
                        variants={itemVariants}
                        onClick={() => onSelectService(srv)}
                        className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden group border border-stone-200/50 shadow-sm active:scale-95 transition-transform bg-white shrink-0"
                      >
                        {srv.image_url ? (
                          <img 
                            src={srv.image_url} 
                            alt={srv.name} 
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          />
                        ) : (
                          <div className="absolute inset-0 bg-stone-100" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        
                        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 flex flex-col items-start text-left">
                          <h3 className="text-white font-serif text-sm md:text-lg lg:text-xl leading-snug mb-3 group-hover:text-[#d4af37] transition-colors line-clamp-2">
                            {srv.name}
                          </h3>
                          <div className="flex items-center justify-between w-full mt-auto">
                            <div className="flex items-center gap-1.5 md:gap-2.5 text-xs md:text-base text-stone-300 font-semibold">
                              <Clock size={12} className="text-[#d4af37] md:scale-150" />
                              <span>{srv.duration_minutes}m</span>
                            </div>
                            <span className="text-sm md:text-lg lg:text-xl font-bold text-[#d4af37] bg-black/60 px-3 py-1 md:px-5 md:py-2 rounded-full backdrop-blur-sm">
                              {srv.price}€
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    ))
                )}
              </motion.div>
            ) : (
              /* Lista Elegante (Filas) */
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex-grow overflow-y-auto pt-32 md:pt-36 pb-10 px-4 custom-scrollbar flex flex-col gap-3 content-start"
              >
                {services.filter(s => String(s.category_id) === String(activeCategory.id)).length === 0 ? (
                  <div className="py-10 text-center text-stone-400 text-sm font-medium">
                    No hay servicios disponibles.
                  </div>
                ) : (
                  services
                    .filter(s => String(s.category_id) === String(activeCategory.id))
                    .map(srv => (
                      <motion.button
                        key={srv.id}
                        variants={itemVariants}
                        onClick={() => onSelectService(srv)}
                        className="w-full bg-white rounded-2xl border border-stone-200/50 hover:border-[#d4af37]/30 hover:bg-stone-50/50 p-3.5 md:p-4.5 flex items-center justify-between shadow-sm active:scale-98 transition-all shrink-0 group text-left gap-4"
                      >
                        {/* Left Side: Image + Full Wrapping Title */}
                        <div className="flex items-center gap-3.5 md:gap-4.5 min-w-0 flex-grow">
                          {srv.image_url ? (
                            <img 
                              src={srv.image_url} 
                              alt={srv.name} 
                              className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover overflow-hidden shrink-0 border border-stone-100" 
                            />
                          ) : (
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-tr from-[#d4af37]/5 to-[#d4af37]/20 flex items-center justify-center shrink-0 border border-stone-100">
                              <span className="text-xs md:text-sm text-[#d4af37] font-serif font-bold">M</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 className="text-stone-850 font-serif text-sm md:text-lg leading-snug group-hover:text-[#d4af37] transition-colors break-words">
                              {srv.name}
                            </h3>
                          </div>
                        </div>

                        {/* Right Side: Stacked Price & Duration + Chevron */}
                        <div className="flex items-center gap-3 md:gap-4 shrink-0 pl-2">
                          <div className="flex flex-col items-end text-right">
                            <span className="text-sm md:text-lg font-bold text-[#d4af37]">
                              {srv.price}€
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-stone-400 mt-1">
                              <Clock size={11} className="text-stone-300 shrink-0" />
                              <span>{srv.duration_minutes} min</span>
                            </div>
                          </div>
                          <span className="text-stone-300 group-hover:text-[#d4af37] transition-colors text-lg md:text-xl font-bold shrink-0">›</span>
                        </div>
                      </motion.button>
                    ))
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
