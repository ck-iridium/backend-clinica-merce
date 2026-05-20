"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function BentoGridServices({ data, services }: { data: any, services: any[] }) {
  const getFullUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${url}` : url;
  };

  // Get active and featured services (up to max_services, defaulting to 4)
  const maxServices = data?.max_services || 4;
  const filteredServices = services
    .filter(s => s.is_active)
    .sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
    .slice(0, maxServices);

  if (filteredServices.length === 0) return null;

  // Asymmetric Grid layout classes for Bento Grid (max 4 elements)
  const getGridClasses = (index: number, total: number) => {
    if (total === 3) {
      if (index === 0) return 'md:col-span-2 md:row-span-2 h-[450px] md:h-full';
      return 'md:col-span-1 md:row-span-1 h-[215px] md:h-full';
    }
    // For 4 elements
    if (index === 0) return 'md:col-span-2 md:row-span-1 h-[250px]';
    if (index === 1) return 'md:col-span-1 md:row-span-2 h-full min-h-[300px]';
    if (index === 2) return 'md:col-span-1 md:row-span-1 h-[250px]';
    return 'md:col-span-1 md:row-span-1 h-[250px]';
  };

  return (
    <section className="w-full py-24 px-6 md:px-12 bg-[#FAFAFA] flex flex-col snap-start snap-stop-always md:snap-none">
      {/* Title */}
      <div className="max-w-7xl mx-auto w-full mb-12 text-center md:text-left">
        <h2 className="text-4xl md:text-5xl font-serif font-extrabold text-stone-900 leading-tight">
          {data?.title || 'Nuestros Tratamientos Insignia'}
        </h2>
        {data?.subtitle && (
          <p className="text-lg md:text-xl text-stone-500 mt-3 font-medium font-sans">
            {data.subtitle}
          </p>
        )}
      </div>

      {/* Asymmetric Bento Grid */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px] md:auto-rows-[250px]">
        {filteredServices.map((svc, idx) => {
          const gridClass = getGridClasses(idx, filteredServices.length);
          
          return (
            <motion.div
              key={svc.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className={`${gridClass} group relative rounded-3xl overflow-hidden shadow-luxury bg-white border border-stone-100/50 flex flex-col justify-end p-6 cursor-pointer transition-all duration-500 hover:shadow-xl`}
            >
              {/* Service Background Image */}
              {svc.image_url ? (
                <img
                  src={getFullUrl(svc.image_url)}
                  alt={svc.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-stone-100 flex items-center justify-center">
                  <span className="font-serif text-stone-300 italic">ProBookia</span>
                </div>
              )}

              {/* Elegant Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent z-10"></div>

              {/* Service Meta Details */}
              <div className="relative z-20 text-white w-full">
                <span className="text-[#d4af37] text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-2 block">
                  {svc.duration_minutes} min • {svc.price}€
                </span>
                <h4 className="text-xl md:text-2xl font-serif font-bold leading-tight group-hover:text-[#d4af37] transition-colors line-clamp-2">
                  {svc.name}
                </h4>
                <p className="text-xs text-white/70 mt-2 font-medium line-clamp-2 group-hover:text-white/95 transition-colors">
                  {svc.description}
                </p>
                <div className="pt-4 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <Link 
                    href={`/reservar?service=${svc.id}`} 
                    className="inline-flex items-center text-xs font-bold text-[#d4af37] tracking-wider uppercase gap-1"
                  >
                    Reservar ahora <span className="translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
