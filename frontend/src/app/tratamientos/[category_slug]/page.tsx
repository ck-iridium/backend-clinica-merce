import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import PublicNavbar from '@/components/PublicNavbar';
import TreatmentCarousel from '@/components/TreatmentCarousel';
import Footer from '@/components/Footer';

// Helpers to get data
async function getCategoryData(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/service-categories/slug/${slug}`, {
    next: { revalidate: 60 }
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch category data');
  }
  return res.json();
}

async function getAllCategories() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/service-categories/`, {
    next: { revalidate: 60 }
  });
  if (!res.ok) return [];
  return res.json();
}

async function getServices() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/services/`, {
    next: { revalidate: 60 }
  });
  if (!res.ok) return [];
  return res.json();
}

const getFullUrl = (url: string) => {
  if (!url) return '';
  return url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${url}` : url;
};

export async function generateMetadata({ params }: { params: { category_slug: string } }): Promise<Metadata> {
  const category = await getCategoryData(params.category_slug);
  if (!category) return { title: 'Categoría no encontrada' };

  return {
    title: `${category.name} | Estetica Merce`,
    description: category.seo_description || category.description || `Descubre nuestra categoría de ${category.name}.`,
  };
}

export default async function CategoryDynamicPage({ params }: { params: { category_slug: string } }) {
  const category = await getCategoryData(params.category_slug);
  if (!category) notFound();

  const [allCategories, allServices] = await Promise.all([
    getAllCategories(),
    getServices()
  ]);

  const categoryServices = allServices.filter((s: any) => s.category_id === category.id && s.is_active);
  // Máximo 4 categorías para el Bento Grid
  const otherCategories = allCategories.filter((c: any) => c.id !== category.id && c.is_active).slice(0, 4);

  // Fallback LOREM IPSUM para SEO description si no hay texto editorial
  const editorialText = category.seo_description || `El enfoque de nuestra clínica hacia los tratamientos de ${category.name.toLowerCase()} se basa en la excelencia, la personalización y los resultados naturales. Comprendemos que cada piel y cada cuerpo cuentan una historia única, por lo que nuestras especialistas realizan un diagnóstico exhaustivo antes de recomendar cualquier protocolo.

Utilizamos aparatología de vanguardia combinada con técnicas manuales exclusivas, creando una sinergia perfecta que no solo embellece, sino que también promueve la salud integral desde el interior.

Déjate asesorar por nuestro equipo médico-estético y descubre cómo podemos potenciar tu bienestar con la máxima discreción y profesionalidad que caracteriza a Estetica Merce.`;

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-[#d4af37]/30">

      {/* 1. HERO DE CATEGORÍA (65vh) — Navbar DENTRO de la sección (estilo Home) */}
      <section className="relative w-full h-[65vh] overflow-hidden flex flex-col justify-end">
        {/* Navbar absoluto arriba */}
        <div className="absolute top-0 left-0 w-full z-50">
          <PublicNavbar transparent={true} />
        </div>

        {/* Background Image full-bleed */}
        <div className="absolute inset-0 z-0 bg-stone-900">
          {category.image_url && (
            <img
              src={getFullUrl(category.image_url)}
              alt={category.name}
              className="w-full h-full object-cover object-center"
            />
          )}
          {/* Capas de overlay para legibilidad */}
          <div className="absolute inset-0 bg-stone-900/35"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/75 via-transparent to-transparent"></div>
        </div>

        {/* Texto del Hero — Alineado con márgenes estándar */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-16 md:pb-20 animate-in slide-in-from-bottom-8 duration-1000">
          <span className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-[#d4af37] mb-4 block drop-shadow-md">
            Colección de Tratamientos
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-extrabold text-white leading-none drop-shadow-lg mb-5">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-lg md:text-2xl text-white/90 font-medium max-w-2xl leading-relaxed drop-shadow-md">
              {category.description}
            </p>
          )}
        </div>
      </section>

      {/* 2. SLIDER DE TRATAMIENTOS — loop={false} para evitar duplicados */}
      {categoryServices.length > 0 && (
        <section className="relative z-20 -mt-10 md:-mt-14 w-full overflow-hidden">
          <div className="bg-[#F5F2EE] rounded-t-[2.5rem] pt-12 md:pt-20 pb-16">
            <div className="max-w-7xl mx-auto px-6 mb-8 flex justify-between items-end">
              <div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800">
                  Catálogo de {category.name}
                </h2>
                <p className="text-stone-500 font-medium mt-2">{categoryServices.length} opciones disponibles</p>
              </div>
            </div>
            <TreatmentCarousel servicios={categoryServices} loop={false} />
          </div>
        </section>
      )}

      {/* 3. SECCIÓN SEO EDITORIAL (1280px) */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24 items-start">
          <div className="md:col-span-4 md:sticky md:top-32">
            <div className="w-16 h-1 bg-[#d4af37] mb-6 rounded-full"></div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-extrabold text-stone-900 leading-tight">
              Excelencia en <br /> <span className="text-[#d4af37]">{category.name}</span>
            </h2>
          </div>
          <div className="md:col-span-8">
            <div className="prose prose-stone lg:prose-lg max-w-none text-stone-600 leading-relaxed whitespace-pre-line font-medium">
              {editorialText}
            </div>
          </div>
        </div>
      </section>

      {/* 4. NAVEGACIÓN BENTO GRID (Fondo crema premium, layout adaptativo) */}
      {otherCategories.length > 0 && (
        <section className="py-24 md:py-32 bg-[#F5F2EE] border-t border-border/40">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="text-center mb-16">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-stone-400 mb-3">Sigue explorando</h3>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-800">Otras especialidades</h2>
            </div>

            {/* Grid adaptativo según el número de categorías (1-4) */}
            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              style={{ 
                gridAutoRows: 'minmax(250px, auto)',
                gridTemplateRows: otherCategories.length >= 3 ? '300px 300px' : 'auto'
              }}
            >
              {otherCategories.map((other: any, i: number) => {
                let gridClasses = "relative rounded-[2rem] overflow-hidden group block shadow-luxury transition-all duration-700 h-full bg-white";
                
                // Lógica de recolocación para terminar los espacios (Bento Style)
                if (otherCategories.length === 4) {
                   if (i === 0) gridClasses += " md:row-span-2 md:col-span-1";
                   if (i === 3) gridClasses += " md:col-span-2";
                } else if (otherCategories.length === 3) {
                   if (i === 0) gridClasses += " md:row-span-2 md:col-span-1";
                   if (i === 1 || i === 2) gridClasses += " md:col-span-2 lg:col-span-2";
                } else if (otherCategories.length === 2) {
                   gridClasses += " md:col-span-1";
                } else if (otherCategories.length === 1) {
                   gridClasses += " md:col-span-2 lg:col-span-3";
                }

                return (
                  <Link 
                    href={`/tratamientos/${other.slug || other.id}`} 
                    key={other.id}
                    className={gridClasses}
                  >
                    {/* Imagen de fondo */}
                    <div className="absolute inset-0 bg-[#EBE7E0]">
                      {other.image_url ? (
                        <img 
                          src={getFullUrl(other.image_url)} 
                          alt={other.name} 
                          className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110 group-hover:rotate-1"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#E5E1DA] flex items-center justify-center italic text-stone-400 font-serif">Estetica Merce</div>
                      )}
                    </div>
                    
                    {/* Overlay Beige Soft (Quiet Luxury) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2C241E]/80 via-[#2C241E]/20 to-transparent transition-opacity duration-700 group-hover:opacity-60"></div>
                    
                    {/* Contenido en la esquina inferior izquierda */}
                    <div className="absolute bottom-0 left-0 p-8 md:p-10 w-full flex flex-col items-start justify-end h-full">
                      <div className="transform transition-all duration-500 ease-out translate-y-4 group-hover:translate-y-0">
                        <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2 drop-shadow-md">
                          {other.name}
                        </h3>
                        <div className="overflow-hidden h-6">
                          <span className="text-[#d4af37] font-bold tracking-[0.2em] uppercase text-[10px] block transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                            Explorar especialidad →
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sutil brillo beige en hover */}
                    <div className="absolute inset-0 bg-[#FDFCFB]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
