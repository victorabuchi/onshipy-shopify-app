/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "frame-ancestors 'none' https://*.myshopify.com https://admin.shopify.com",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;