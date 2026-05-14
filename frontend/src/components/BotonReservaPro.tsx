"use client"
import { motion } from "framer-motion";
import React from "react";
import Link from "next/link";

interface BotonReservaProProps {
  texto?: string;
  onClick?: () => void;
  href?: string; // Nueva prop para enlaces
  className?: string;
  type?: "button" | "submit" | "reset";
  color?: string;
}

export default function BotonReservaPro({ 
  texto = "RESERVAR CITA", 
  onClick,
  href,
  className = "",
  type = "button",
  color = "#d4af37"
}: BotonReservaProProps) {
  // Calculamos colores derivados
  const gradientStyle = {
    background: `linear-gradient(to bottom, ${color}dd, ${color}, ${color}ee)`
  };

  const content = (
    <div 
      style={gradientStyle}
      className="relative px-8 py-3.5 rounded-full flex items-center justify-center
                    shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(0,0,0,0.2)]
                    group-hover:shadow-[inset_0_2px_6px_rgba(255,255,255,0.7),inset_0_-2px_4px_rgba(0,0,0,0.3),0_10px_20px_-5px_rgba(0,0,0,0.2)]
                    transition-all duration-500 overflow-hidden border border-black/5"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.4em] text-white 
                     [text-shadow:_0_1px_2px_rgba(0,0,0,0.8),_0_0_10px_rgba(0,0,0,0.3)]
                     filter group-hover:brightness-110 transition-all duration-300">
        {texto}
      </span>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[35%] bg-gradient-to-b from-white/30 to-transparent rounded-full blur-[1px]" />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={`block relative p-[2px] overflow-hidden rounded-full group ${className}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_120deg,rgba(0,0,0,0.3)_180deg,transparent_240deg,transparent_360deg)] opacity-40 group-hover:opacity-100"
        />
        {content}
      </Link>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`relative p-[2px] overflow-hidden rounded-full group ${className}`}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_120deg,rgba(0,0,0,0.3)_180deg,transparent_240deg,transparent_360deg)] opacity-40 group-hover:opacity-100"
      />
      {content}
    </motion.button>
  );
}
