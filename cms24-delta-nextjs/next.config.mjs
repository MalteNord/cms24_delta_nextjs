/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
      return [
        {
          source: '/',
          destination: '/sv',
          permanent: false, // Change to true if you want a permanent redirect
        },
      ];
    },
  };
  
  export default nextConfig;
  