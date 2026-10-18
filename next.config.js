/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '80mb'
    },
    proxyClientMaxBodySize: '80mb'
  }
};

export default nextConfig;
