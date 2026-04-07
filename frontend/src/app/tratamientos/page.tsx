import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catálogo de Tratamientos | Clínica de Estética',
  description: 'Descubre todos nuestros tratamientos estéticos y servicios.',
};

async function getData() {
  const [categoriesRes, servicesRes, settingsRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/service-categories/`, { next: { revalidate: 60 } }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/services/`, { next: { revalidate: 60 } }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/settings/`, { next: { revalidate: 60 } })
  ]);
  
  const categories = categoriesRes.ok ? await categoriesRes.json() : [];
  const services = servicesRes.ok ? await servicesRes.json() : [];
  const settings = settingsRes.ok ? await settingsRes.json() : null;
  
  return { categories, services, settings };
}

export default async function CatalogPage() {
  const { categories, services, settings } = await getData();
  
  // Filtrar solo activos
  const activeServices = services.filter((s: any) => s.is_active);

  // Agrupar servicios por categoría
  const groupedServices = activeServices.reduce((acc: Record<string, any[]>, svc: any) => {
    // Buscar la categoría completa o asignar "General" si no existe
    const category = categories.find((c: any) => c.id === svc.category_id);
    const catName = category ? category.name : "Tratamientos Generales";
    
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push({ ...svc, categoryInfo: category });
    return acc;
  }, {});

  // Ordenar las categorías para que las que tienen img salgan antes o por orden alfabético
  const sortedCategoryNames = Object.keys(groupedServices).sort();

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans mt-16 md:mt-0">
      {/* HEADER ELIMINADO (Se usa PublicNavbar desde layout) */}

      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6 mb-16 animate-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-stone-900">Catálogo de Tratamientos</h1>
          <p className="text-lg md:text-xl text-stone-500 mt-4 max-w-2xl font-medium">
            Explora todos nuestros servicios diseñados para realzar tu belleza. Selecciona una categoría para ver los detalles.
          </p>
        </div>

        {sortedCategoryNames.length === 0 ? (
          <div className="max-w-7xl mx-auto px-6 py-20 text-center text-stone-400 font-bold border-2 border-dashed border-stone-200 rounded-[3rem]">
            No hay tratamientos disponibles en este momento.
          </div>
        ) : (
          <div className="space-y-24">
            {sortedCategoryNames.map((catName) => {
              const svcs = groupedServices[catName];
              const categoryInfo = svcs[0]?.categoryInfo;
              
              return (
                <section key={catName} className="max-w-7xl mx-auto px-6">
                  {/* Category Header */}
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10 border-b border-stone-200 pb-8">
                    {categoryInfo?.image_url && (
                       <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-[1.5rem] overflow-hidden shadow-lg border border-stone-100">
                         <img src={categoryInfo.image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${categoryInfo.image_url}` : categoryInfo.image_url} alt={catName} className="w-full h-full object-cover" />
                       </div>
                    )}
                    <div>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-stone-800 tracking-tight">{catName}</h2>
                      <p className="text-stone-500 font-semibold mt-2">{svcs.length} tratamientos disponibles</p>
                    </div>
                  </div>

                  {/* Services Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {svcs.map((svc: any) => (
                       <div key={svc.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-stone-100 flex flex-col relative group overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-50 to-transparent rounded-bl-[4rem] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                          
                          <div className="flex justify-between items-start mb-6 gap-4 relative z-10">
                            <h3 className="text-xl md:text-2xl font-bold leading-tight">{svc.name}</h3>
                            <span className="bg-[#fcf8e5] text-[#b08e23] px-3 py-1.5 rounded-xl font-bold text-sm shrink-0 whitespace-nowrap shadow-sm border border-yellow-100">
                              {svc.price} €
                            </span>
                          </div>
                          
                          <p className="text-stone-500 mb-8 font-medium leading-relaxed min-h-[4.5rem] relative z-10">
                            {svc.description || 'Tratamiento especializado en clínica.'}
                          </p>
                          
                          <div className="mt-auto pt-6 border-t border-stone-100 flex justify-between items-center relative z-10">
                            <span className="text-stone-400 font-semibold text-sm flex items-center gap-1">
                               <span className="text-[#d4af37] text-lg leading-none">⏱</span> {svc.duration_minutes} min
                            </span>
                          </div>
                       </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
