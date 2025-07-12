/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Optimize images (Next.js built-in optimization)
  images: {
    domains: ['images.pexels.com'], // Allow Pexels images if needed
  },
  
  // Configure webpack for Web3 compatibility
  webpack: (config, { isServer }) => {
    // Fix for Web3 libraries that expect Node.js modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  
  // Environment variables that should be available on the client side
  env: {
    CUSTOM_KEY: 'my-value',
  },
}

module.exports = nextConfig;