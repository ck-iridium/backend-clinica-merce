'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import PublicNavbar from './PublicNavbar';
import ScrollIndicator from './ScrollIndicator';

interface CategoryHeroProps {
  category: any;
}

export default function CategoryHero({ category }: CategoryHeroProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getFullUrl = (url: string) => {
    if (!url) return '';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return url.startsWith('/') ? `${apiUrl}${url}` : url;
  };

  const parallaxOffset = scrollY * 0.4;
  const imageUrl = getFullUrl(category.image_url);

  return (
    <section className="relative w-full h-full overflow-hidden flex flex-col justify-end bg-stone-900">
      {/* Navbar absoluto arriba */}
      <div className="absolute top-0 left-0 w-full z-50">
        <PublicNavbar transparent={true} />
      </div>

      {/* Background Image Container with Parallax */}
      <div className="absolute inset-0 z-0">
        <div
          className="relative w-full h-[120%] -top-[10%]"
          style={{
            transform: `translateY(${parallaxOffset}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={category.name}
              fill
              priority
              className="object-cover object-center animate-slow-zoom"
              sizes="100vw"
            />
          )}
          {/* Capas de overlay graduado */}
          <div className="absolute inset-0 bg-stone-900/30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/20 to-transparent"></div>
        </div>
      </div>

      {/* Texto del Hero — Con entrada animada */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-16 md:pb-20">
        <div className="overflow-hidden mb-4">
          <span className="text-xs md:text-sm font-black uppercase tracking-[0.4em] text-[#d4af37] block animate-reveal-up drop-shadow-md">
            Colección de Tratamientos
          </span>
        </div>
        <div className="overflow-hidden">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-extrabold text-white leading-none drop-shadow-2xl animate-reveal-up animation-delay-200">
            {category.name}
          </h1>
        </div>

        {category.description && (
          <div className="overflow-hidden mt-6">
            <p className="text-lg md:text-2xl text-white/90 font-medium max-w-2xl leading-relaxed drop-shadow-md animate-reveal-up animation-delay-400">
              {category.description}
            </p>
          </div>
        )}
      </div>
      
      <ScrollIndicator />

      {/* Animaciones CSS personalizadas */}
      <style jsx global>{`
        @keyframes slow-zoom {
          from { transform: scale(1.15); }
          to { transform: scale(1); }
        }
        @keyframes reveal-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slow-zoom {
          animation: slow-zoom 5s cubic-bezier(0.2, 0, 0.2, 1) forwards;
        }
        .animate-reveal-up {
          animation: reveal-up 1.2s cubic-bezier(0.2, 0, 0.2, 1) forwards;
        }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
      `}</style>
    </section>
  );
}
