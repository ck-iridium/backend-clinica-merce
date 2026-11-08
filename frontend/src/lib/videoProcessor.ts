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

export interface ProcessVideoOptions {
  keepAudio?: boolean;
  maxDimension?: number; // Por defecto 540p: resolución optimizada para pantallas móviles
  crf?: number; // Por defecto 30: balance óptimo compresión/calidad
}

/**
 * Procesa un archivo de vídeo:
 * - Permite elegir si conservar el audio (AAC 96k) o silenciarlo (-an).
 * - Escala la resolución hacia abajo para pantallas móviles (máx 540p), reduciendo drásticamente el peso de 720p/1080p.
 * - Aplica flags de streaming instantáneo (+faststart) y compresión H.264.
 */
export const processVideo = async (
  file: File, 
  onProgress?: (progress: number) => void,
  options?: ProcessVideoOptions
): Promise<Blob> => {
  const ffmpegInstance = await loadFFmpeg();
  
  const inputName = 'input.mp4';
  const outputName = 'output.mp4';

  const keepAudio = options?.keepAudio ?? false;
  const maxDim = options?.maxDimension ?? 540;
  const crf = (options?.crf ?? 30).toString();

  // Escribir el archivo original en el sistema de archivos virtual de FFmpeg
  await ffmpegInstance.writeFile(inputName, await fetchFile(file));

  // Escuchar el progreso de la transcodificación
  ffmpegInstance.on('progress', ({ progress }) => {
    if (onProgress) onProgress(Math.round(progress * 100));
  });

  // Filtro de escala: reduce proporcionalmente a resolución móvil (ej: 540p)
  // asegurando dimensiones pares (-2) requeridas por H.264
  const scaleFilter = `scale='if(gt(iw,ih),-2,min(${maxDim},iw))':'if(gt(iw,ih),min(${maxDim},ih),-2)'`;

  const ffmpegArgs: string[] = [
    '-i', inputName
  ];

  // Configuración de audio
  if (keepAudio) {
    // Si el usuario decide conservar sonido: audio AAC comprimido en estéreo a 96 kbps
    ffmpegArgs.push('-c:a', 'aac', '-b:a', '96k', '-ar', '44100');
  } else {
    // Silenciado para loops web ultraligeros
    ffmpegArgs.push('-an');
  }

  // Parámetros de vídeo y optimización web
  ffmpegArgs.push(
    '-vcodec', 'libx264',
    '-crf', crf,
    '-preset', 'fast',
    '-vf', scaleFilter,
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    outputName
  );

  await ffmpegInstance.exec(ffmpegArgs);

  // Leer el archivo resultante desde la memoria de WASM
  const data = await ffmpegInstance.readFile(outputName);
  
  // Limpiar archivos virtuales para liberar memoria
  await ffmpegInstance.deleteFile(inputName);
  await ffmpegInstance.deleteFile(outputName);

  // Devolver como Blob de vídeo MP4
  return new Blob([data as any], { type: 'video/mp4' });
};
