'use client';

import Link from 'next/link';

export default function MarketingFooter() {
  return (
    <footer className="bg-stone-950 text-white py-16 border-t border-stone-900">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 border-b border-stone-900 pb-12 mb-12">
        <div>
          <span className="text-xl font-serif tracking-widest text-white block mb-2 font-bold">
            PROBOOKIA SUITE
          </span>
          <p className="text-stone-400 text-xs md:text-sm max-w-sm leading-relaxed font-medium">
            La plataforma invisible de alta gama para presencia web, reservas online, expedientes médicos, facturación y TPV en centros selectos.
          </p>
        </div>
        <div className="flex gap-8 text-xs font-bold text-stone-400">
          <Link href="/privacidad" className="hover:text-white transition-colors">
            Privacidad
          </Link>
          <Link href="/aviso-legal" className="hover:text-white transition-colors">
            Aviso Legal
          </Link>
          <Link href="/docs" className="hover:text-white transition-colors">
            VIP Blueprint Docs
          </Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 text-center text-xs text-stone-600 font-semibold">
        &copy; {new Date().getFullYear()} ProBookia. Todos los derechos reservados. SaaS Quiet Luxury B2B.
      </div>
    </footer>
  );
}
