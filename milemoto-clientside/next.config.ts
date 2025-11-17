import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/milemoto.appspot.com/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/v0/b/milemoto.appspot.com/o/**',
      },
    ],
  },
  async rewrites() {
    const devApiOrigin = process.env.NEXT_PUBLIC_DEV_API || 'http://localhost:4000';
    return process.env.NODE_ENV === 'production'
      ? []
      : [
          {
            source: '/api/:path*',
            destination: `${devApiOrigin}/api/:path*`,
          },
        ];
  },
};

export default nextConfig;
