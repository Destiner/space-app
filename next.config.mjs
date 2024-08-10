/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.output.environment = {
      ...config.output.environment,
      bigIntLiteral: true,
    };
    return config;
  },
};

export default nextConfig;
