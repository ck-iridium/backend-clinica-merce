import React, { useState, useCallback } from 'react';
import Cropper, { Point, Area } from 'react-easy-crop';

interface CropImageModalProps {
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
}

export default function CropImageModal({ imageSrc, onClose, onCropComplete }: CropImageModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspectRatio, setAspectRatio] = useState<number>(4 / 3);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);

    try {
      const image = new Image();
      image.src = imageSrc;
      await new Promise((resolve) => (image.onload = resolve));

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      canvas.toBlob((blob) => {
        if (blob) {
          onCropComplete(blob);
        } else {
          alert('Error construyendo la imagen recortada.');
          setIsProcessing(false);
        }
      }, 'image/webp', 0.9);
    } catch (e) {
      console.error(e);
      alert('Error al recortar la imagen.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/90 p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden flex flex-col h-[80vh] max-h-[800px] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <h3 className="font-extrabold text-xl text-stone-800">Recortar Imagen</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-800 text-2xl leading-none">&times;</button>
        </div>

        {/* Workspace */}
        <div className="flex-1 relative bg-stone-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onCropComplete={handleCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        {/* Controles de Ratio */}
        <div className="p-6 bg-stone-50 border-t border-stone-200">
           
           <div className="flex items-center justify-between gap-6 mb-6">
              
              <div className="flex-1">
                 <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Zoom</label>
                 <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-[#d4af37]"
                  />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Proporción</label>
                <div className="flex gap-2 bg-white border border-stone-200 p-1 rounded-xl">
                  <button 
                    onClick={() => setAspectRatio(1)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${aspectRatio === 1 ? 'bg-[#d4af37] text-white' : 'text-stone-500 hover:bg-stone-100'}`}
                  >1:1</button>
                  <button 
                    onClick={() => setAspectRatio(4/3)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${aspectRatio === 4/3 ? 'bg-[#d4af37] text-white' : 'text-stone-500 hover:bg-stone-100'}`}
                  >4:3</button>
                  <button 
                    onClick={() => setAspectRatio(16/9)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${aspectRatio === 16/9 ? 'bg-[#d4af37] text-white' : 'text-stone-500 hover:bg-stone-100'}`}
                  >16:9</button>
                </div>
              </div>

           </div>

           <div className="flex justify-end gap-3">
              <button 
                onClick={onClose} 
                className="px-6 py-3 rounded-xl font-bold text-stone-600 bg-white border border-stone-200 hover:bg-stone-50 transition-all"
              >Cancelar</button>
              
              <button 
                onClick={createCroppedImage}
                disabled={isProcessing}
                className="bg-stone-900 hover:bg-[#d4af37] text-white min-w-[150px] px-8 py-3 rounded-xl font-bold transition-all shadow-md disabled:opacity-50 flex justify-center items-center"
              >
                {isProcessing ? <span className="animate-pulse">Recortando...</span> : 'Aplicar Recorte'}
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}
