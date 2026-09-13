import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Debating Society of HSTU',
    short_name: 'Debating Society',
    description: 'Official platform of Debating Society of HSTU',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    orientation: 'portrait-primary',
    categories: ['education', 'productivity', 'news'],
    icons: [
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Upcoming Events',
        short_name: 'Events',
        description: 'View upcoming events and conferences',
        url: '/events/upcoming',
        icons: [{ src: '/logo.png', sizes: '192x192' }],
      },
      {
        name: 'Certificate Verification',
        short_name: 'Verify',
        description: 'Verify certificates and credentials',
        url: '/verification/certificate',
        icons: [{ src: '/logo.png', sizes: '192x192' }],
      },
      {
        name: 'Membership Directory',
        short_name: 'Members',
        description: 'Verify membership records and ID cards',
        url: '/verification/membership',
        icons: [{ src: '/logo.png', sizes: '192x192' }],
      },
      {
        name: 'Research Blog',
        short_name: 'Blog',
        description: 'Read the latest publications and articles',
        url: '/content/blog',
        icons: [{ src: '/logo.png', sizes: '192x192' }],
      },
    ],
  };
}
