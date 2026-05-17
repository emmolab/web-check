import type { APIRoute } from 'astro';
import { branding } from '@/config/branding';

export const GET: APIRoute = () => {
  const manifest = {
    name: branding.titleLong,
    short_name: branding.name,
    description: branding.description,
    start_url: '/',
    display: 'standalone',
    background_color: branding.theme.background,
    theme_color: branding.theme.primary,
    icons: [
      {
        src: branding.appIconPath,
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: branding.appIconPath,
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
    },
  });
};
