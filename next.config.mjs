import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://us-central1-inventory-909ff.cloudfunctions.net/api/:path*',
      },
    ];
  },
};

export default withNextIntl(nextConfig);