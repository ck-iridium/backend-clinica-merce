export interface MediaFile {
  name: string;
  url: string;
  size: number;
  content_type: string;
  created_at?: string;
  status: 'in_use' | 'orphan';
  usages: string[];
}

export interface Quota {
  used_bytes: number;
  max_bytes: number;
  file_count: number;
}

export const MAX_BYTES = 1 * 1024 * 1024 * 1024; // 1 GB

export function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function isVideoFile(file: MediaFile): boolean {
  return file.name.toLowerCase().endsWith('.mp4') || file.content_type?.includes('video');
}
