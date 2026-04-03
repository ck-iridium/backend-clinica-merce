import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navbar */}
      <header className="fixed w-full top-0 z-50 glass-card shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight text-[#d9777f]">Clínica Mercè</h1>
          <Link href="/login" className="text-sm font-medium text-stone-500 hover:text-[#d9777f] transition-colors">
            Acceso
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:pt-40 md:pb-28 text-center bg-gradient-to-b from-stone-50 to-[#fdf2f3] relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-[#f3c7cb] rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-[#d4af37] rounded-full blur-3xl opacity-10"></div>
        
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="inline-block py-1.5 px-4 rounded-full bg-white shadow-sm text-[#d9777f] text-sm font-semibold mb-6 border border-[#f3c7cb]">
            Descubre tu mejor versión
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold text-stone-900 mb-6 leading-tight">
            Estética Avanzada y <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d9777f] to-[#b35e65]">Depilación Láser</span>
          </h2>
          <p className="text-lg text-stone-600 mb-10 mx-auto max-w-xl">
            Tratamientos personalizados con tecnología de vanguardia para realzar tu belleza natural.
          </p>
          <Link href="/reservar" className="inline-block bg-[#d9777f] hover:bg-[#c6646b] text-white font-bold py-4 px-10 rounded-full shadow-xl transform transition hover:scale-105 active:scale-95">
            Reservar Cita Online
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-4 text-stone-900">Nuestros Servicios</h3>
          <p className="text-center text-stone-500 mb-16 max-w-2xl mx-auto">Disponemos de la última tecnología láser y protocolos estéticos únicos para cuidar tu piel y tu cuerpo.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Depilación Láser', desc: 'Láser de diodo de última generación. Prácticamente indoloro y altamente efectivo en todo tipo de pieles.', price: 'Desde 30€' },
              { title: 'Tratamientos Faciales', desc: 'Higiene profunda, hidratación, anti-aging y tratamientos específicos con aparatología avanzada.', price: 'Desde 45€' },
              { title: 'Remodelación Corporal', desc: 'Maderoterapia, presoterapia y reducción de volumen para esculpir tu silueta.', price: 'Desde 50€' }
            ].map((service, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-stone-50 border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 bg-[#fdf2f3] rounded-2xl mb-6 flex items-center justify-center">
                  <span className="text-xl">✨</span>
                </div>
                <h4 className="text-xl font-bold mb-3 text-stone-800">{service.title}</h4>
                <p className="text-stone-600 mb-6 line-clamp-3">{service.desc}</p>
                <div className="text-[#d9777f] font-bold text-lg">{service.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
