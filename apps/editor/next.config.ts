import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

let url = process.env.NEXT_PUBLIC_APP_URL || 'https://email-studio.solomon-ai.app';

const nextConfig: NextConfig = {
  basePath: '/zone-editor',
  // devIndicators: false,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['warn', 'error'],
          }
        : undefined,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '0.email' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  typescript: {
    // TODO: enforce types throwing errors on build
    ignoreBuildErrors: true,
  },
  eslint: {
    // TODO: enforce linting throwing errors on build
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  async redirects() {
    return [
      {
        source: '/settings',
        destination: '/settings/general',
        permanent: true,
      },
      {
        source: '/mail',
        destination: '/mail/inbox',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/zone-ai-assistant',
        destination: `${url}/zone-ai-assistant`,
      },
      {
        source: '/zone-ai-assistant/:path+',
        destination: `${url}/zone-ai-assistant/:path+`,
      },
      {
        source: '/zone-leads',
        destination: `${url}/zone-leads`,
      },
      {
        source: '/zone-leads/:path+',
        destination: `${url}/zone-leads/:path+`,
      },
      {
        source: '/',
        destination: `${url}/`,
      },
      {
        source: '/:path+',
        destination: `${url}/:path+`,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

export default withNextIntl(nextConfig);
