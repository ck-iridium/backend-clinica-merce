import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import PublicNavbar from '@/components/PublicNavbar';
import TreatmentCarousel from '@/components/TreatmentCarousel';
import ServiceCard from '@/components/ServiceCard';
import Footer from '@/components/Footer';
import CategoryHero from '@/components/CategoryHero';

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

      {/* CONTENEDOR MAESTRO DE SNAP (Móvil) */}
      <main className="w-full h-[100dvh] overflow-y-auto snap-y-mandatory md:h-auto md:overflow-visible md:snap-none scroll-smooth-premium relative">

        {/* 1. HERO DE CATEGORÍA CINEMATOGRÁFICO */}
        <section className="h-[100dvh] snap-start snap-stop-always md:h-[65vh] md:snap-none">
          <CategoryHero category={category} />
        </section>

        {/* 2. SLIDER DE TRATAMIENTOS */}
        {categoryServices.length > 0 && (
          <section id="treatment-content" className="relative z-20 w-full overflow-hidden h-[100dvh] snap-start snap-stop-always md:h-auto md:snap-none flex flex-col bg-[#F5F2EE]">
            <style dangerouslySetInnerHTML={{ __html: '.hide-scroll::-webkit-scrollbar { display: none; } .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }' }} />
            <div className="pt-16 md:pt-24 pb-8 flex-1 flex flex-col min-h-0">
              <div className="max-w-7xl mx-auto px-6 mb-4 flex flex-col md:flex-row md:justify-between md:items-end gap-2 md:gap-8 flex-shrink-0">
                <div>
                  <h2 className="text-2xl md:text-4xl font-serif font-bold text-stone-800">
                    Catálogo de {category.name}
                  </h2>
                  <p className="text-stone-400 font-medium text-xs md:text-base">{categoryServices.length} opciones disponibles</p>
                </div>
                <Link href="/tratamientos" className="self-end md:self-auto inline-flex items-center gap-2 font-bold text-[#d4af37] hover:text-stone-900 transition-colors uppercase tracking-widest text-[10px] md:text-sm">
                  <span className="hidden md:inline">Ver todos los tratamientos</span>
                  <span className="md:hidden">Ver todos</span>
                  <span className="text-xl">→</span>
                </Link>
              </div>

              <div className="md:block hidden flex-1 min-h-0 flex flex-col justify-center">
                {categoryServices.length === 1 ? (
                  <div className="max-w-7xl mx-auto px-6 w-full">
                    <div className="w-full">
                      <ServiceCard
                        service={categoryServices[0]}
                        className="!w-full !md:w-full !h-[600px] !md:h-[600px]"
                      />
                    </div>
                  </div>
                ) : (
                  <TreatmentCarousel servicios={categoryServices} loop={false} />
                )}
              </div>

              {/* MOBILE VIEW — INFALIBLE & SMART */}
              <div id="mobile-slider-category" className="md:hidden flex overflow-x-auto snap-x-mandatory hide-scroll gap-4 px-6 items-center w-full flex-1 min-h-0 pb-8">
                {categoryServices.map((svc: any) => (
                  <ServiceCard key={svc.id} service={svc} className="snap-stop-always" />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 3. SECCIÓN SEO EDITORIAL (Imantada) */}
        <section className="pt-16 pb-24 md:py-32 bg-white min-h-[100dvh] snap-start snap-stop-always md:min-h-0 md:snap-none flex flex-col justify-center">
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

        {/* 4. DESCUBRE OTRAS CATEGORÍAS (Bento Grid) */}
        {otherCategories.length > 0 && (
          <section className="pt-16 pb-24 md:py-32 bg-[#F5F2EE] min-h-[100dvh] snap-start snap-stop-always md:min-h-0 md:snap-none flex flex-col justify-center">
            <div className="w-full max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10">
                <div>
                  <h2 className="text-2xl md:text-5xl font-serif font-extrabold text-stone-900">Otras Categorías</h2>
                  <p className="text-stone-500 mt-2 text-sm md:text-lg">Explora más servicios de medicina estética avanzada.</p>
                </div>
                <Link href="/tratamientos" className="text-[#d4af37] font-bold uppercase tracking-widest text-[10px] md:text-sm hover:text-stone-900 transition-colors">
                  Ver todo el catálogo →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
                {otherCategories.map((other: any, idx: number) => {
                  let gridClasses = "";

                  if (otherCategories.length === 3) {
                    if (idx === 0) gridClasses = "md:col-span-2 md:row-span-2 h-[400px] md:h-full";
                    else gridClasses = "md:col-span-2 md:row-span-1 h-[300px] md:h-full";
                  } else if (otherCategories.length === 2) {
                    gridClasses = "md:col-span-2 md:row-span-2 h-[400px] md:h-full";
                  } else {
                    if (idx === 0) gridClasses = "md:col-span-2 md:row-span-2 h-[400px] md:h-full";
                    else if (idx === 1) gridClasses = "md:col-span-2 md:row-span-1 h-[300px] md:h-full";
                    else gridClasses = "md:col-span-1 md:row-span-1 h-[300px] md:h-full";
                  }

                  return (
                    <Link
                      key={other.id}
                      href={`/tratamientos/${other.slug || other.id}`}
                      className={`group relative rounded-[2.5rem] overflow-hidden shadow-luxury hover:shadow-2xl transition-all duration-700 block ${gridClasses}`}
                    >
                      {/* Imagen de Fondo */}
                      <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110">
                        <img
                          src={other.image_url?.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${other.image_url}` : other.image_url}
                          alt={other.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-900/20 to-transparent transition-opacity duration-700 group-hover:opacity-60"></div>

                      {/* Contenido Sincronizado */}
                      <div className="absolute bottom-0 left-0 p-8 w-full z-10">
                        <div className="transform transition-transform duration-500 group-hover:-translate-y-6">
                          <h3 className={`${(otherCategories.length === 3 && idx === 0) || otherCategories.length === 2 ? 'text-2xl md:text-4xl' : 'text-xl md:text-2xl'} font-serif font-bold text-white mb-2 leading-tight`}>
                            {other.name}
                          </h3>
                          <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 absolute top-full left-0 mt-2">
                            <span className="text-[#d4af37] font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                              Explorar <span className="text-lg transition-transform group-hover:translate-x-1">→</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* 5. FOOTER (Imantado) */}
        <div className="snap-start snap-stop-always">
          <Footer />
        </div>

      </main>
    </div>
  );
}
