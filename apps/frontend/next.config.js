/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        const backendPort = process.env.BACKEND_PORT || 3001;
        return [
          // Proxy all API routes to backend app (port from root .env)
          {
            source: "/api/:path*",
            destination: `http://localhost:${backendPort}/api/:path*`,
          },
        ];
    },
};

export default nextConfig;
