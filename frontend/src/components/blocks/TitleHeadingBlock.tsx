"use client";
import { motion } from 'framer-motion';

interface TitleHeadingBlockProps {
  data: {
    title: string;
    subtitle?: string;
    title_tag?: 'h1' | 'h2' | 'h3';
    alignment?: 'left' | 'center' | 'right';
    show_divider?: boolean;
  };
}

export default function TitleHeadingBlock({ data }: TitleHeadingBlockProps) {
  if (!data) return null;

  const {
    title,
    subtitle,
    title_tag = 'h2',
    alignment = 'center',
    show_divider = true,
  } = data;

  const TitleTag = title_tag;

  const alignClass = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[alignment];

  return (
    <section className="w-full py-20 bg-[#FAFAFA] px-6 md:px-12 lg:px-24 flex justify-center overflow-hidden">
      <div className="max-w-4xl w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className={`flex flex-col gap-4 ${alignClass}`}
        >
          <TitleTag className="font-serif font-extrabold text-4xl md:text-5xl lg:text-6xl text-stone-900 leading-tight tracking-tight">
            {title}
          </TitleTag>

          {show_divider && (
            <div className="w-16 h-[2px] bg-[#d4af37] rounded-full" />
          )}

          {subtitle && (
            <p className="text-lg md:text-xl text-stone-500 font-sans font-light leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
