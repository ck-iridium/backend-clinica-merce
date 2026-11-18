'use client';

import { getWebmasterCommands } from './webmasterConfig';

interface WebmasterCommandGridProps {
  onExecuteCommand: (prompt: string) => void;
  disabled: boolean;
  activePageSlug?: string;
  activePageTitle?: string;
}

export default function WebmasterCommandGrid({
  onExecuteCommand,
  disabled,
  activePageSlug,
  activePageTitle,
}: WebmasterCommandGridProps) {
  const { sectionTitle, sectionSubtitle, commands } = getWebmasterCommands(
    activePageSlug,
    activePageTitle
  );

  return (
    <div className="px-4 py-3 bg-[#FAF9F6]/90 backdrop-blur-xl border-t border-stone-200/70 shrink-0">
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <div className="flex items-center gap-1.5 min-w-0 pr-2">
          <span className="flex h-1.5 w-1.5 rounded-full bg-[#d4af37] animate-pulse shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b38f2b] truncate">
            {sectionTitle}
          </span>
        </div>
        <span className="text-[10px] text-stone-400 font-medium tracking-wide shrink-0">
          {sectionSubtitle}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[185px] overflow-y-auto pr-0.5 hide-scroll">
        {commands.map((cmd, idx) => {
          const Icon = cmd.icon;
          return (
            <button
              key={cmd.id}
              onClick={() => onExecuteCommand(cmd.prompt)}
              disabled={disabled}
              className="group relative overflow-hidden rounded-2xl p-2.5 text-left transition-all duration-300 bg-white/90 hover:bg-white border border-stone-200/80 hover:border-[#d4af37]/70 shadow-2xs hover:shadow-[0_8px_25px_-5px_rgba(212,175,55,0.22)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
            >
              {/* Reflejo / Glossy Gradient ambiental en hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="relative z-10 flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <div className="w-6 h-6 rounded-lg bg-amber-50/90 border border-amber-200/60 flex items-center justify-center text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-stone-950 transition-colors shadow-2xs">
                    <Icon size={12} strokeWidth={2.3} />
                  </div>
                  <span className="text-[9px] font-mono text-stone-300 group-hover:text-[#b38f2b] font-bold transition-colors">
                    0{idx + 1}
                  </span>
                </div>

                <span className="text-[11px] font-bold text-stone-900 group-hover:text-stone-950 block leading-tight truncate">
                  {cmd.title}
                </span>
                <span className="text-[9px] text-stone-400 group-hover:text-stone-600 block leading-snug mt-0.5 truncate">
                  {cmd.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
