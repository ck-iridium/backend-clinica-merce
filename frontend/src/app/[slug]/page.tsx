import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import FlexCustomBlock from '@/components/blocks/FlexCustomBlock';
import TitleHeadingBlock from '@/components/blocks/TitleHeadingBlock';

// Registro del motor de bloques
const BLOCK_COMPONENTS: Record<string, React.FC<any>> = {
  text_image_cta: FlexCustomBlock,
  title_heading: TitleHeadingBlock,
};

// Tipos
interface Block {
  id: string;
  block_type: string;
  content_data: Record<string, any>;
  order_index: number;
}

interface PageProps {
  params: { slug: string };
}

// Metadata dinámica por página
export async function generateMetadata({ params }: PageProps) {
  const { slug } = params;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const requestHeaders = headers();
  const tenantId = requestHeaders.get('x-tenant-id') || '00000000-0000-0000-0000-000000000001';

  try {
    // Comprobamos si la página existe en site_navigation
    const res = await fetch(`${baseUrl}/cms/navigation`, {
      next: { revalidate: 60 },
      headers: { 'X-Tenant-ID': tenantId },
    });
    if (res.ok) {
      const navItems: any[] = await res.json();
      const page = navItems.find((item) => item.path === `/${slug}` && item.is_custom);
      if (page) {
        return {
          title: `${page.label} | Clínica`,
          description: `Página personalizada: ${page.label}`,
        };
      }
    }
  } catch {
    // silencioso
  }

  return {
    title: 'Página | Clínica',
  };
}

export default async function CustomPage({ params }: PageProps) {
  const { slug } = params;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const requestHeaders = headers();
  const tenantId = requestHeaders.get('x-tenant-id') || '00000000-0000-0000-0000-000000000001';

  // 1. Verificar que la página existe y es custom
  let pageTitle = slug;
  try {
    const resNav = await fetch(`${baseUrl}/cms/navigation`, {
      next: { revalidate: 30 },
      headers: { 'X-Tenant-ID': tenantId },
    });
    if (resNav.ok) {
      const navItems: any[] = await resNav.json();
      const page = navItems.find((item) => item.path === `/${slug}` && item.is_custom);
      if (!page) {
        notFound();
      }
      pageTitle = page.label;
    } else {
      notFound();
    }
  } catch {
    notFound();
  }

  // 2. Cargar los bloques de esta página
  let blocks: Block[] = [];
  try {
    const resBlocks = await fetch(`${baseUrl}/cms/blocks/${slug}`, {
      next: { revalidate: 30 },
      headers: { 'X-Tenant-ID': tenantId },
    });
    if (resBlocks.ok) {
      blocks = await resBlocks.json();
    }
  } catch {
    // Devuelve vacío, se muestra el estado vacío elegante
  }

  return (
    <>
      <main className="w-full min-h-screen bg-[#FAFAFA] pt-20">

        {/* Motor de bloques */}
        {blocks.length > 0 ? (
          <div className="flex flex-col w-full">
            {blocks.map((block) => {
              const Component = BLOCK_COMPONENTS[block.block_type];
              if (!Component) return null;
              return (
                <section key={block.id} className="w-full transition-all duration-300">
                  <Component data={block.content_data} />
                </section>
              );
            })}
          </div>
        ) : (
          /* Estado vacío elegante */
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
            {/* Decoración dorada */}
            <div className="w-16 h-[2px] bg-[#d4af37] rounded-full mb-10" />

            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4af37] block mb-4">
              Página en construcción
            </span>

            <h1 className="font-serif text-4xl md:text-5xl font-extrabold text-stone-800 leading-tight mb-6">
              {pageTitle}
            </h1>

            <p className="text-stone-400 font-sans text-base md:text-lg max-w-md leading-relaxed mb-10">
              Esta página está lista y publicada. En breve encontrarás aquí toda la información que estamos preparando para ti.
            </p>

            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-[#d4af37] transition-colors duration-300 group"
            >
              <svg
                className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300"
                fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Volver al inicio
            </a>

            <div className="w-16 h-[2px] bg-stone-100 rounded-full mt-10" />
          </div>
        )}

      </main>
    </>
  );
}
