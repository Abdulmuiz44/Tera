/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

export default nextConfig
