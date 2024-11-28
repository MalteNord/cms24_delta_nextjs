/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [

      {
        source: '/',
        destination: '/en',
        permanent: false,
      },
      {
        source: '/:path((?!en|sv).*)',
        destination: '/en/:path*',
        permanent: false,
      },
    ];
  },
  publicRuntimeConfig: {
    apiUrl: process.env.API_URL || 'https://quizify.azurewebsites.net',
  },
};

export default nextConfig;
