"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';

interface CtaButton {
  text: string;
  url: string;
  style?: 'gold_solid' | 'gold_outline' | 'dark_solid' | 'white_solid';
}

interface FlexCustomBlockProps {
  data: {
    title: string;
    title_tag?: 'h1' | 'h2' | 'h3' | 'h4';
    description: string;
    image_url?: string;
    image_position?: 'left' | 'right';
    cta_button?: CtaButton;
  };
}

export default function FlexCustomBlock({ data }: FlexCustomBlockProps) {
  if (!data) return null;

  const {
    title,
    title_tag = 'h2',
    description,
    image_url,
    image_position = 'left',
    cta_button,
  } = data;

  const TitleTag = title_tag;

  // Clases del botón de CTA según estilo Quiet Luxury
  const getButtonClass = (style?: string) => {
    const base = "inline-block px-10 py-4 rounded-full font-bold text-sm tracking-wider uppercase transition-all duration-300 transform active:scale-95 shadow-sm";
    switch (style) {
      case 'gold_solid':
        return `${base} bg-[#d4af37] text-white hover:bg-stone-900 border border-[#d4af37] hover:border-stone-900`;
      case 'gold_outline':
        return `${base} bg-transparent border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-white`;
      case 'dark_solid':
        return `${base} bg-stone-900 text-white hover:bg-stone-800 border border-stone-900`;
      case 'white_solid':
        return `${base} bg-white text-stone-900 hover:bg-stone-50 border border-white hover:border-stone-100`;
      default:
        return `${base} bg-transparent border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-white`;
    }
  };

  const hasImage = !!image_url;
  const isRight = image_position === 'right';

  const getFullUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${url}` : url;
  };

  return (
    <section className="w-full py-24 bg-[#FAFAFA] px-6 md:px-12 lg:px-24 flex items-center justify-center overflow-hidden">
      <div className="max-w-7xl w-full mx-auto">
        <div className={`grid grid-cols-1 ${hasImage ? 'lg:grid-cols-12 gap-12 lg:gap-20 items-center' : 'text-center max-w-3xl mx-auto'}`}>
          
          {/* Contenedor de Imagen */}
          {hasImage && (
            <motion.div
              initial={{ opacity: 0, x: isRight ? 40 : -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`lg:col-span-5 ${isRight ? 'lg:order-2' : 'lg:order-1'}`}
            >
              <div className="aspect-[4/5] md:aspect-[3/4] relative rounded-3xl overflow-hidden shadow-luxury bg-stone-100 group">
                <img
                  src={getFullUrl(image_url!)}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/5 mix-blend-multiply" />
              </div>
            </motion.div>
          )}

          {/* Contenedor de Texto */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className={`${hasImage ? 'lg:col-span-7' : ''} ${isRight && hasImage ? 'lg:order-1' : 'lg:order-2'} flex flex-col justify-center`}
          >
            <TitleTag className="text-4xl md:text-5xl lg:text-6xl font-serif font-extrabold text-stone-900 leading-tight tracking-tight drop-shadow-sm mb-6">
              {title}
            </TitleTag>
            
            <p className="text-lg text-stone-600/90 font-sans font-light leading-relaxed mb-8 max-w-2xl whitespace-pre-line">
              {description}
            </p>

            {cta_button && cta_button.text && cta_button.url && (
              <div className="pt-2">
                <Link href={cta_button.url} className={getButtonClass(cta_button.style)}>
                  {cta_button.text}
                </Link>
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
