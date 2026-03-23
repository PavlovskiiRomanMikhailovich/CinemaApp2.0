import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'front-school-strapi.ktsdev.ru',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'front-school.minio.ktsdev.ru',
        port: '',
        pathname: '/cinema/**',
      },
    ],
  },
  sassOptions: {
    includePaths: ['./src', './app'],
  },
};

export default nextConfig;
