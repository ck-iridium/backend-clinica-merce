"use client";

import { useLanguage, Language } from "@/app/contexts/LanguageContext";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function LanguageSelector({ upward = false }: { upward?: boolean }) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
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
    <div className="relative" ref={dropdownRef}>
      {/* Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-stone-50/80 backdrop-blur-md border border-stone-200/50 hover:bg-stone-100/80 hover:border-stone-300/80 rounded-full px-2.5 py-1 transition-all active:scale-95 shadow-luxury"
      >
        <Globe className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-[10px] md:text-xs font-extrabold text-stone-700 tracking-wider uppercase">
          {currentLang.code}
        </span>
        <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Floating Glassmorphic Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: upward ? -8 : 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: upward ? -8 : 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute right-0 w-32 bg-white/95 backdrop-blur-md border border-stone-200/60 rounded-2xl shadow-xl z-[999] overflow-hidden p-1.5 ${
              upward ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
            <div className="flex flex-col gap-0.5">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    language === lang.code
                      ? "bg-[#d4af37]/10 text-[#d4af37]"
                      : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm leading-none">{lang.flag}</span>
                    <span className="tracking-wide">{lang.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
