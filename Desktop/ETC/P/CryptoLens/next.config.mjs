/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  },

  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    serverActions: {
      bodySizeLimit: "2mb"
    }
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
  },

  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-DNS-Prefetch-Control", value: "on" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
};

export default nextConfig;
