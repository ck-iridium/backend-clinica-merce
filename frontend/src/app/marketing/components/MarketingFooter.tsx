'use client';

import Link from 'next/link';

interface MarketingFooterProps {
  primaryColor?: string;
  tertiaryColor?: string;
  logoFooterSvg?: string | null;
  logoSvg?: string | null;
}

export default function MarketingFooter({
  primaryColor = '#1c1917',
  tertiaryColor = '#D4AF37',
  logoFooterSvg,
  logoSvg
}: MarketingFooterProps) {
  const darkColor = primaryColor || '#1c1917';
  const accentColor = tertiaryColor || '#D4AF37';

  const resolvedLogo = logoFooterSvg || logoSvg;

  return (
    <footer 
      style={{ backgroundColor: darkColor }}
      className="text-white py-16 border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/10 pb-12 mb-12">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          {resolvedLogo ? (
            <div
              className="h-9 md:h-10 flex items-center justify-center md:justify-start [&>svg]:h-full [&>svg]:w-auto max-w-[180px] mb-3"
              dangerouslySetInnerHTML={{ __html: resolvedLogo }}
            />
          ) : (
            <span className="text-xl font-serif tracking-widest text-white block mb-2 font-bold select-none">
              PROBOOKIA <span style={{ color: accentColor }}>SUITE</span>
            </span>
          )}
          <p className="text-white/80 text-xs md:text-sm max-w-sm leading-relaxed font-medium">
            La plataforma invisible de alta gama para presencia web, reservas online, expedientes médicos, facturación y TPV en centros selectos.
          </p>
        </div>

        {/* Enlaces en color terciario configurado */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-xs font-bold">
          <Link 
            href="/privacidad" 
            style={{ color: accentColor }}
            className="hover:underline hover:brightness-125 transition-all"
          >
            Privacidad
          </Link>
          <Link 
            href="/aviso-legal" 
            style={{ color: accentColor }}
            className="hover:underline hover:brightness-125 transition-all"
          >
            Aviso Legal
          </Link>
          <Link 
            href="/docs" 
            style={{ color: accentColor }}
            className="hover:underline hover:brightness-125 transition-all"
          >
            VIP Blueprint Docs
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 text-center text-xs text-white/60 font-medium">
        &copy; {new Date().getFullYear()} ProBookia. Todos los derechos reservados. SaaS Quiet Luxury B2B.
      </div>
    </footer>
  );
}
