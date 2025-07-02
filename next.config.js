/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // Optimize Fast Refresh
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Optimize for Fast Refresh
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            default: {
              chunks: 'async',
              minSize: 20000,
              maxSize: 100000,
            },
          },
        },
      };
    }
    
    return config;
  },

  // Optimizaciones de compilación
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Optimizaciones de imágenes
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Configuración de compresión
  compress: true,
  
  // Headers para optimización
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Redirecciones
  async redirects() {
    return [
      {
        source: '/usuarios',
        destination: '/dashboard/admin/usuarios',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;