"use client"

import React, { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Pipette, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
  className?: string
}

const LUXURY_PRESETS = [
  { name: 'Dorado Luxury', hex: '#D4AF37' },
  { name: 'Oro Pulido', hex: '#B38F26' },
  { name: 'Negro Antracita', hex: '#1C1917' },
  { name: 'Piedra Profunda', hex: '#1F2937' },
  { name: 'Crema Marfil', hex: '#FAF9F6' },
  { name: 'Azul Real', hex: '#2563EB' },
  { name: 'Esmeralda', hex: '#059669' },
  { name: 'Borgoña', hex: '#881337' },
  { name: 'Rosa Oro', hex: '#E11D48' },
  { name: 'Lavanda Lujo', hex: '#7C3AED' },
]

export function ColorPicker({ value, onChange, label, className }: ColorPickerProps) {
  const [open, setOpen] = useState(false)
  const currentColor = value || '#D4AF37'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-stone-200/80 bg-white/90 hover:bg-stone-50 transition-all text-xs font-mono shadow-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37]",
            className
          )}
        >
          <div
            className="w-4 h-4 rounded-md border border-black/10 shrink-0 shadow-inner"
            style={{ backgroundColor: currentColor }}
          />
          <span className="text-[11px] font-semibold text-stone-750 uppercase">
            {currentColor}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-3 bg-white/95 backdrop-blur-xl border border-stone-200/80 rounded-2xl shadow-xl space-y-3">
        {label && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            {label}
          </p>
        )}

        {/* Muestras Curadas de Lujo */}
        <div>
          <span className="text-[9px] font-semibold text-stone-400 uppercase tracking-widest block mb-1.5">
            Paleta Recomendada
          </span>
          <div className="grid grid-cols-5 gap-1.5">
            {LUXURY_PRESETS.map((preset) => {
              const isSelected = currentColor.toLowerCase() === preset.hex.toLowerCase()
              return (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => onChange(preset.hex)}
                  title={preset.name}
                  className={cn(
                    "w-8 h-8 rounded-lg border flex items-center justify-center transition-all hover:scale-110",
                    isSelected ? "ring-2 ring-[#D4AF37] ring-offset-1 border-stone-400" : "border-black/10"
                  )}
                  style={{ backgroundColor: preset.hex }}
                >
                  {isSelected && (
                    <Check
                      className={cn(
                        "w-3.5 h-3.5",
                        preset.hex === '#FAF9F6' ? "text-stone-900" : "text-white"
                      )}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Input Manual Hexadecimal + Pipeta */}
        <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-mono font-bold">
              #
            </span>
            <input
              type="text"
              value={currentColor.replace('#', '')}
              onChange={(e) => {
                const val = e.target.value.replace('#', '')
                if (/^[0-9A-Fa-f]{0,6}$/.test(val)) {
                  onChange(`#${val}`)
                }
              }}
              placeholder="D4AF37"
              className="w-full pl-6 pr-2 py-1.5 text-xs font-mono font-semibold uppercase bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-[#D4AF37]"
              maxLength={6}
            />
          </div>

          <label
            title="Seleccionar color personalizado"
            className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200 flex items-center justify-center cursor-pointer transition-colors shrink-0"
          >
            <Pipette className="w-3.5 h-3.5 text-stone-600" />
            <input
              type="color"
              value={currentColor}
              onChange={(e) => onChange(e.target.value)}
              className="sr-only"
            />
          </label>
        </div>
      </PopoverContent>
    </Popover>
  )
}
