"use client";

import { useLanguage, Language } from "@/app/contexts/LanguageContext";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function FlagSpain({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 750 500" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <rect width="750" height="125" fill="#AA151B" />
      <rect y="125" width="750" height="250" fill="#F1BF00" />
      <rect y="375" width="750" height="125" fill="#AA151B" />
      <g transform="translate(180, 185) scale(1.15)">
        <path d="M12 -8 L18 0 L24 -8 L30 0 L36 -8 L33 6 L15 6 Z" fill="#AA151B" stroke="#D4AF37" strokeWidth="2" />
        <circle cx="24" cy="-12" r="3" fill="#D4AF37" />
        <rect x="0" y="8" width="6" height="60" rx="2" fill="#D4AF37" opacity="0.95" />
        <rect x="42" y="8" width="6" height="60" rx="2" fill="#D4AF37" opacity="0.95" />
        <path d="M10 10 H38 V48 C38 62 24 70 24 70 C24 70 10 62 10 48 Z" fill="#AA151B" stroke="#D4AF37" strokeWidth="3" />
        <rect x="14" y="14" width="20" height="30" fill="#F1BF00" />
        <circle cx="24" cy="29" r="4" fill="#002B7F" />
      </g>
    </svg>
  );
}

export function FlagUK({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 30" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <clipPath id="uk-flag-clip">
        <path d="M0 0v30h60v-30z" />
      </clipPath>
      <g clipPath="url(#uk-flag-clip)">
        <path d="M0 0v30h60v-30z" fill="#012169" />
        <path d="M0 0L60 30M60 0L0 30" stroke="#FFFFFF" strokeWidth="6" />
        <path d="M0 0L60 30" stroke="#C8102E" strokeWidth="2" strokeDasharray="15 30 15 0" />
        <path d="M60 0L0 30" stroke="#C8102E" strokeWidth="2" strokeDasharray="0 15 30 15" />
        <path d="M30 0v30M0 15h60" stroke="#FFFFFF" strokeWidth="10" />
        <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

export function FlagFrance({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 900 600" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <rect width="300" height="600" fill="#002654" />
      <rect x="300" width="300" height="600" fill="#FFFFFF" />
      <rect x="600" width="300" height="600" fill="#CE1126" />
    </svg>
  );
}

export function FlagIcon({ code, className = "w-5 h-3.5" }: { code: Language | string; className?: string }) {
  const flagClass = `inline-flex items-center justify-center shrink-0 rounded-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.2)] ring-1 ring-black/15 overflow-hidden ${className}`;

  if (code === "en") {
    return (
      <span className={flagClass} aria-label="United Kingdom">
        <FlagUK />
      </span>
    );
  }
  if (code === "fr") {
    return (
      <span className={flagClass} aria-label="France">
        <FlagFrance />
      </span>
    );
  }
  return (
    <span className={flagClass} aria-label="España">
      <FlagSpain />
    </span>
  );
}

export default function LanguageSelector({
  upward = false,
  className = "",
}: {
  upward?: boolean;
  className?: string;
}) {
  const { language, setLanguage, alternateUrls } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; label: string }[] = [
    { code: "es", label: "Español" },
    { code: "en", label: "English" },
    { code: "fr", label: "Français" },
  ];

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Botón Selector con Bandera de Color */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Seleccionar idioma: actual ${currentLang.label}`}
        aria-expanded={isOpen}
        className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-full border transition-all duration-300 active:scale-95 shadow-2xs hover:shadow-xs ${
          upward
            ? "bg-stone-900/95 hover:bg-stone-850 border-stone-750 text-stone-200"
            : "bg-white/85 dark:bg-stone-900/85 hover:bg-white dark:hover:bg-stone-850 backdrop-blur-md border-stone-200/80 dark:border-stone-800 text-stone-800 dark:text-stone-200"
        }`}
      >
        <FlagIcon code={currentLang.code} className="w-5 h-3.5" />
        <span className="text-xs font-bold tracking-wider uppercase">
          {currentLang.code}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-200 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Menú Desplegable Glassmorphic con Banderas */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: upward ? -8 : 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: upward ? -8 : 8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`absolute ${
              upward ? "left-0 bottom-full mb-2.5" : "right-0 top-full mt-2"
            } w-44 bg-white/95 dark:bg-stone-950/95 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800 rounded-2xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.25)] z-[999] overflow-hidden p-1.5`}
          >
            <div className="flex flex-col gap-1">
              {languages.map((lang) => {
                const isActive = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.code, alternateUrls?.[lang.code]);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-amber-500/10 text-stone-950 dark:text-stone-50 font-bold border border-amber-500/20"
                        : "text-stone-600 dark:text-stone-300 hover:bg-stone-100/80 dark:hover:bg-stone-900 hover:text-stone-950 dark:hover:text-white border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FlagIcon code={lang.code} className="w-5 h-3.5" />
                      <span className="tracking-wide">{lang.label}</span>
                    </div>
                    {isActive ? (
                      <Check className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-stone-400 opacity-60">
                        {lang.code}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
