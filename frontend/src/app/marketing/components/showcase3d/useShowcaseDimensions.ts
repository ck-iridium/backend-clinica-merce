import { useState, useEffect } from 'react';

export interface ShowcaseDimensions {
  width: number;
  height: number;
  radius: number;
  angleStep: number;
  stageHeight: number;
}

export function useShowcaseDimensions(isPreview: boolean = false): ShowcaseDimensions {
  const [dimensions, setDimensions] = useState<ShowcaseDimensions>({
    width: isPreview ? 190 : 395,
    height: isPreview ? 338 : 702,
    radius: isPreview ? 720 : 1420,
    angleStep: isPreview ? 18 : 17,
    stageHeight: isPreview ? 380 : 760,
  });

  useEffect(() => {
    if (isPreview) return;

    const updateDimensions = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (w < 640) {
        // Móviles
        const cardW = Math.min(w * 0.78, 290);
        setDimensions({
          width: Math.round(cardW),
          height: Math.round(cardW * (16 / 9)),
          radius: 960,
          angleStep: 18.5,
          stageHeight: Math.round(cardW * (16 / 9) + 40),
        });
      } else if (w < 1024) {
        // Tablets y laptops compactas
        setDimensions({
          width: 340,
          height: 604,
          radius: 1200,
          angleStep: 17.5,
          stageHeight: 670,
        });
      } else if (w < 1536) {
        // Desktop estándar (1080p) - Fichas grandes e imponentes que llenan el alto
        const cardH = Math.min(Math.round(h * 0.68), 710);
        const cardW = Math.round(cardH * (9 / 16));
        setDimensions({
          width: cardW,
          height: cardH,
          radius: 1400,
          angleStep: 17,
          stageHeight: cardH + 60,
        });
      } else {
        // Pantallas 2K y 4K
        const cardH = Math.min(Math.round(h * 0.70), 780);
        const cardW = Math.round(cardH * (9 / 16));
        setDimensions({
          width: cardW,
          height: cardH,
          radius: 1550,
          angleStep: 16.5,
          stageHeight: cardH + 70,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isPreview]);

  return dimensions;
}
