import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

/**
 * Carga el motor de FFmpeg en el navegador.
 * Se utiliza una instancia única (Singleton) para evitar recargas innecesarias.
 */
export const loadFFmpeg = async () => {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();
  
  // Cargamos los archivos .wasm desde un CDN para mayor velocidad y caché global
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  return ffmpeg;
};

/**
 * Procesa un archivo de vídeo: quita audio, escala a 720p y comprime.
 */
export const processVideo = async (
  file: File, 
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  const ffmpegInstance = await loadFFmpeg();
  
  const inputName = 'input.mp4';
  const outputName = 'output.mp4';

  // Escribir el archivo original en el sistema de archivos virtual de FFmpeg
  await ffmpegInstance.writeFile(inputName, await fetchFile(file));

  // Escuchar el progreso de la transcodificación
  ffmpegInstance.on('progress', ({ progress }) => {
    if (onProgress) onProgress(Math.round(progress * 100));
  });

  // Comando de optimización: 
  // -an (sin audio)
  // -vcodec libx264 (codec estándar)
  // -crf 30 (balance óptimo peso/calidad para loops web)
  // -preset fast (equilibrio entre velocidad y compresión)
  // -vf scale (escala a 720p solo si es mayor, manteniendo proporción)
  // -pix_fmt yuv420p (formato de píxeles compatible con todos los navegadores/móviles)
  await ffmpegInstance.exec([
    '-i', inputName,
    '-an',
    '-vcodec', 'libx264',
    '-crf', '30',
    '-preset', 'fast',
    '-vf', "scale='min(720,iw)':-2",
    '-pix_fmt', 'yuv420p',
    outputName
  ]);

  // Leer el archivo resultante desde la memoria de WASM
  const data = await ffmpegInstance.readFile(outputName);
  
  // Limpiar archivos virtuales para liberar memoria
  await ffmpegInstance.deleteFile(inputName);
  await ffmpegInstance.deleteFile(outputName);

  // Devolver como Blob de vídeo MP4
  return new Blob([data as any], { type: 'video/mp4' });
};
