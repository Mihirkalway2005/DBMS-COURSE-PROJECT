/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    VITE_CLERK_PUBLISHABLE_KEY:
      process.env.VITE_CLERK_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
      "",
    VITE_NEON_DATABASE_URL:
      process.env.VITE_NEON_DATABASE_URL ||
      process.env.NEXT_PUBLIC_NEON_DATABASE_URL ||
      "",
  },
}

export default nextConfig
