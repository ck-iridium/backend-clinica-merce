"use client"
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-stone-100 py-12 print:hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo / Brand */}
          <div className="text-center md:text-left">
            <Link href="/" className="text-xl font-black text-stone-800 tracking-tighter hover:text-[#d9777f] transition-colors">
              CLÍNICA <span className="text-[#d9777f]">MERCÈ</span>
            </Link>
            <p className="text-stone-400 text-xs mt-2 font-medium">Estética de vanguardia y bienestar.</p>
          </div>

          {/* Legal Links */}
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            <Link href="/aviso-legal" className="text-stone-400 hover:text-stone-700 text-xs font-bold uppercase tracking-widest transition-colors">
              Aviso Legal
            </Link>
            <Link href="/privacidad" className="text-stone-400 hover:text-stone-700 text-xs font-bold uppercase tracking-widest transition-colors">
              Privacidad
            </Link>
            <Link href="/cookies" className="text-stone-400 hover:text-stone-700 text-xs font-bold uppercase tracking-widest transition-colors">
              Política de Cookies
            </Link>
          </nav>

          {/* Copyright */}
          <div className="text-stone-300 text-[10px] font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} Todos los derechos reservados
          </div>
        </div>
      </div>
    </footer>
  );
}
