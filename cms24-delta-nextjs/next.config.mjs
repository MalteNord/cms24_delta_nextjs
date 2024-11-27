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
    ];
  },
  publicRuntimeConfig: {
    apiUrl: process.env.API_URL || 'https://quizify.azurewebsites.net', // Set your API base URL here
  },
};

export default nextConfig;
