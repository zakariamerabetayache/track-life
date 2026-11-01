/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: "./",
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@base-ui/react",
      "@tanstack/react-query",
    ],
  },
};

export default nextConfig;
