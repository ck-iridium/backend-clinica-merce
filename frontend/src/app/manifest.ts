import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ProBookia - Mostrador TPV & Agenda',
    short_name: 'ProBookia',
    description: 'Gestión de citas, mostrador TPV, fichaje legal y cobros.',
    start_url: '/dashboard/calendar',
    display: 'standalone',
    background_color: '#FAFAFA',
    theme_color: '#1C1917',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
    ],
  };
}
