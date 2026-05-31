/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
