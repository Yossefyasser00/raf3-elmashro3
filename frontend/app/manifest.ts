import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'فك زنقة — منصة التعليم والذكاء الاصطناعي',
    short_name: 'فك زنقة',
    description: 'احصل على أفضل شرح وتلخيص لموادك وتوليد الكويزات الذكية على موبايلك.',
    start_url: '/',
    display: 'standalone',
    background_color: '#161B33',
    theme_color: '#EE5A36',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
