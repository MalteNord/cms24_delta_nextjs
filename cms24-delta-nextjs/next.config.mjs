/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Disables ESLint during the build process
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/sv',
        permanent: false, // Change to true if you want a permanent redirect
      },
    ];
  },
  publicRuntimeConfig: {
    apiUrl: process.env.API_URL || 'https://quizify.azurewebsites.net', // Set your API base URL here
  },
};

export default nextConfig;
