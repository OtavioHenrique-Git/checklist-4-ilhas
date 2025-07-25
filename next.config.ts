import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Se quiser adicionar mais configs, coloque aqui
};

export default nextConfig;
