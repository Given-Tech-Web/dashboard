/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  // Vercel 최적화
  output: 'standalone',
  // 환경변수 런타임 노출
  publicRuntimeConfig: {
    NEXT_PUBLIC_HIVEMQ_HOST: process.env.NEXT_PUBLIC_HIVEMQ_HOST,
    NEXT_PUBLIC_HIVEMQ_PORT: process.env.NEXT_PUBLIC_HIVEMQ_PORT,
    NEXT_PUBLIC_HIVEMQ_USERNAME: process.env.NEXT_PUBLIC_HIVEMQ_USERNAME,
    NEXT_PUBLIC_HIVEMQ_PASSWORD: process.env.NEXT_PUBLIC_HIVEMQ_PASSWORD,
    NEXT_PUBLIC_DEVICE_ID: process.env.NEXT_PUBLIC_DEVICE_ID || 'solar_system_001',
  }
}

export default nextConfig;